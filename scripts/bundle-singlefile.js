import fs from 'fs';
import path from 'path';
import * as esbuild from 'esbuild';

const BUILD_DIR = 'build';
const OUTPUT_FILE = 'build/ssss-made-easy-offline.html';

function readFile(filePath) {
	return fs.readFileSync(filePath, 'utf-8');
}

function getAllFiles(dir, extension, files = []) {
	if (!fs.existsSync(dir)) return files;
	const items = fs.readdirSync(dir);
	for (const item of items) {
		const fullPath = path.join(dir, item);
		if (fs.statSync(fullPath).isDirectory()) {
			getAllFiles(fullPath, extension, files);
		} else if (item.endsWith(extension)) {
			files.push(fullPath);
		}
	}
	return files;
}

async function bundleToSingleFile() {
	console.log('Bundling SvelteKit output to single HTML file...');
	
	const indexPath = path.join(BUILD_DIR, 'index.html');
	if (!fs.existsSync(indexPath)) {
		console.error('Build output not found. Run "npm run build" first.');
		process.exit(1);
	}
	
	let html = readFile(indexPath);
	
	const cssFiles = getAllFiles(BUILD_DIR, '.css');
	let allCSS = '';
	for (const cssFile of cssFiles) {
		console.log(`Including CSS: ${cssFile}`);
		allCSS += readFile(cssFile) + '\n';
	}
	
	const appDir = path.join(BUILD_DIR, '_app/immutable');
	const allJsFiles = getAllFiles(appDir, '.js');
	
	console.log(`Found ${allJsFiles.length} JavaScript files to process`);
	
	const moduleExports = {};
	
	for (const jsFile of allJsFiles) {
		const relativePath = '/_app/immutable/' + path.relative(appDir, jsFile).replace(/\\/g, '/');
		
		try {
			const result = await esbuild.build({
				entryPoints: [jsFile],
				bundle: true,
				write: false,
				format: 'esm',
				minify: true,
				target: 'es2020',
				platform: 'browser',
				mainFields: ['browser', 'module', 'main'],
				conditions: ['browser'],
				define: {
					'import.meta.url': `"${relativePath}"`,
					'import.meta.env.SSR': 'false',
					'import.meta.env.DEV': 'false', 
					'import.meta.env.PROD': 'true',
				},
				logLevel: 'silent',
			});
			
			moduleExports[relativePath] = result.outputFiles[0].text;
		} catch (e) {
			moduleExports[relativePath] = readFile(jsFile);
		}
	}
	
	console.log(`Processed ${Object.keys(moduleExports).length} modules`);

	const loaderScript = `
<script type="module">
const __modules__ = {};
const __cache__ = {};

${Object.entries(moduleExports).map(([path, code]) => {
	const safeName = path.replace(/[^a-zA-Z0-9]/g, '_');
	return `
__modules__["${path}"] = async function() {
  if (__cache__["${path}"]) return __cache__["${path}"];
  const blob = new Blob([${JSON.stringify(code)}], {type: 'application/javascript'});
  const url = URL.createObjectURL(blob);
  try {
    const mod = await import(url);
    __cache__["${path}"] = mod;
    return mod;
  } finally {
    URL.revokeObjectURL(url);
  }
};`;
}).join('\n')}

const originalFetch = window.fetch;
window.fetch = async function(url, options) {
  const urlStr = typeof url === 'string' ? url : url.toString();
  if (urlStr.includes('/_app/') && urlStr.endsWith('.js')) {
    const path = new URL(urlStr, location.href).pathname;
    if (__modules__[path]) {
      const code = await __modules__[path]();
      return new Response(JSON.stringify(code), {
        headers: {'Content-Type': 'application/javascript'}
      });
    }
  }
  return originalFetch.call(this, url, options);
};

const startPath = Object.keys(__modules__).find(p => p.includes('/entry/start'));
if (startPath) {
  __modules__[startPath]().then(() => {
    console.log('SvelteKit offline initialized');
  }).catch(e => {
    console.error('Init error:', e);
  });
}
</script>`;

	html = html.replace(/<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi, '');
	html = html.replace(/<link\s+[^>]*rel=["']modulepreload["'][^>]*>/gi, '');
	html = html.replace(/<script\s+type=["']module["'][^>]*>[\s\S]*?<\/script>/gi, '');
	
	const styleTag = `<style>${allCSS}</style>`;
	html = html.replace('</head>', `${styleTag}</head>`);
	
	html = html.replace('</body>', `${loaderScript}</body>`);
	
	fs.writeFileSync(OUTPUT_FILE, html, 'utf-8');
	
	const stats = fs.statSync(OUTPUT_FILE);
	console.log(`Created: ${OUTPUT_FILE} (${(stats.size / 1024).toFixed(1)} KB)`);
	console.log('This file can be downloaded and used offline.');
}

bundleToSingleFile().catch(console.error);
