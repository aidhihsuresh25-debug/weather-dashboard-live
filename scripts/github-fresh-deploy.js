import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const token = process.env.GITHUB_TOKEN || process.argv[2];
const repoName = process.argv[3] || 'weather-dashboard-live';

if (!token) {
  console.error('\n❌ ERROR: Please provide your GitHub Personal Access Token.');
  console.log('\nUsage: node scripts/github-fresh-deploy.js <YOUR_GITHUB_TOKEN> [REPO_NAME]\n');
  process.exit(1);
}

function request(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: urlPath,
      method: method,
      headers: {
        'User-Agent': 'NodeJS-Deployer',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(resBody ? JSON.parse(resBody) : {});
        } else {
          reject(new Error(`API ${method} ${urlPath} failed (${res.statusCode}): ${resBody}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function getFilesRecursively(dirPath, baseDir = dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (file === 'node_modules' || file === '.git' || file === '.DS_Store') {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getFilesRecursively(fullPath, baseDir, arrayOfFiles);
    } else {
      arrayOfFiles.push({ fullPath, relPath });
    }
  });
  return arrayOfFiles;
}

async function uploadFilesToBranch(user, repoName, branchName, fileList) {
  console.log(`⬆️ Uploading ${fileList.length} files to branch "${branchName}"...`);
  const treeItems = [];
  const binaryExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.pdf', '.zip', '.woff', '.woff2', '.ttf', '.eot']);

  for (const item of fileList) {
    const ext = path.extname(item.relPath).toLowerCase();
    const isBinary = binaryExts.has(ext);

    const content = isBinary
      ? fs.readFileSync(item.fullPath).toString('base64')
      : fs.readFileSync(item.fullPath, 'utf8');

    const blob = await request('POST', `/repos/${user.login}/${repoName}/git/blobs`, {
      content: content,
      encoding: isBinary ? 'base64' : 'utf-8'
    });

    treeItems.push({
      path: item.relPath,
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    });
  }

  const tree = await request('POST', `/repos/${user.login}/${repoName}/git/trees`, {
    tree: treeItems
  });

  const commit = await request('POST', `/repos/${user.login}/${repoName}/git/commits`, {
    message: `Deployment update for ${branchName}`,
    tree: tree.sha,
    parents: []
  });

  try {
    await request('PATCH', `/repos/${user.login}/${repoName}/git/refs/heads/${branchName}`, {
      sha: commit.sha,
      force: true
    });
  } catch (e) {
    await request('POST', `/repos/${user.login}/${repoName}/git/refs`, {
      ref: `refs/heads/${branchName}`,
      sha: commit.sha
    });
  }
}

async function main() {
  try {
    console.log('🔨 Building production bundle with Vite...');
    execSync('cmd /c npm run build', { cwd: rootDir, stdio: 'inherit' });

    console.log('\n🚀 Authenticating with GitHub...');
    const user = await request('GET', '/user');
    console.log(`✅ Logged in as GitHub user: ${user.login}`);

    console.log(`📦 Ensuring repository "${repoName}"...`);
    let repo;
    try {
      repo = await request('POST', '/user/repos', {
        name: repoName,
        description: 'Live Interactive AeroGlass Weather Dashboard',
        auto_init: true,
        private: false
      });
      console.log(`✅ Created repository: ${repo.html_url}`);
    } catch (e) {
      repo = await request('GET', `/repos/${user.login}/${repoName}`);
      console.log(`ℹ️ Repository "${repoName}" exists: ${repo.html_url}`);
    }

    // Temporary replace root index.html with dist/index.html and merge assets for main branch deployment
    const originalIndexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    const distIndexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

    fs.writeFileSync(path.join(rootDir, 'index.html'), distIndexHtml);

    const rootAssetsDir = path.join(rootDir, 'assets');
    if (!fs.existsSync(rootAssetsDir)) fs.mkdirSync(rootAssetsDir);
    const distAssetsDir = path.join(distDir, 'assets');
    if (fs.existsSync(distAssetsDir)) {
      fs.readdirSync(distAssetsDir).forEach(f => {
        fs.copyFileSync(path.join(distAssetsDir, f), path.join(rootAssetsDir, f));
      });
    }

    console.log('⬆️ Uploading compiled production application to main branch...');
    const allFiles = getFilesRecursively(rootDir, rootDir);
    await uploadFilesToBranch(user, repoName, 'main', allFiles);

    console.log('⬆️ Uploading to gh-pages branch...');
    const distFiles = getFilesRecursively(distDir, distDir);
    await uploadFilesToBranch(user, repoName, 'gh-pages', distFiles);

    // Restore original index.html locally
    fs.writeFileSync(path.join(rootDir, 'index.html'), originalIndexHtml);

    console.log('🌐 Requesting GitHub Pages rebuild...');
    try {
      await request('POST', `/repos/${user.login}/${repoName}/pages`, {
        source: { branch: 'main', path: '/' }
      });
    } catch (e) {
      try {
        await request('PUT', `/repos/${user.login}/${repoName}/pages`, {
          source: { branch: 'main', path: '/' }
        });
      } catch (err) {}
    }

    console.log('\n🎉 SUCCESS! Production build pushed directly to GitHub!');
    console.log(`🔗 Repository: ${repo.html_url}`);
    console.log(`🌐 Live Site: https://${user.login}.github.io/${repoName}/#/\n`);
  } catch (err) {
    console.error('\n❌ Deployment failed:', err.message);
    process.exit(1);
  }
}

main();
