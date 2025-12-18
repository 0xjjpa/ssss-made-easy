import fs from 'fs';
import path from 'path';

const BUILD_DIR = 'build';
const OUTPUT_FILE = 'build/ssss-made-easy-offline.html';

function readFile(filePath) {
	return fs.readFileSync(filePath, 'utf-8');
}

function getAssetPath(href, baseDir) {
	if (href.startsWith('/')) {
		return path.join(BUILD_DIR, href);
	}
	return path.join(baseDir, href);
}

function inlineCSS(html, baseDir) {
	const cssLinkRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
	
	return html.replace(cssLinkRegex, (match, href) => {
		try {
			const cssPath = getAssetPath(href, baseDir);
			if (fs.existsSync(cssPath)) {
				const cssContent = readFile(cssPath);
				return `<style>${cssContent}</style>`;
			}
		} catch (e) {
			console.warn(`Could not inline CSS: ${href}`, e.message);
		}
		return match;
	});
}

function inlineJS(html, baseDir) {
	const scriptRegex = /<script\s+([^>]*)src=["']([^"']+)["']([^>]*)><\/script>/gi;
	
	return html.replace(scriptRegex, (match, before, src, after) => {
		try {
			const jsPath = getAssetPath(src, baseDir);
			if (fs.existsSync(jsPath)) {
				let jsContent = readFile(jsPath);
				jsContent = resolveImports(jsContent, path.dirname(jsPath));
				const attrs = (before + after).replace(/type=["']module["']/gi, '').trim();
				return `<script${attrs ? ' ' + attrs : ''}>${jsContent}</script>`;
			}
		} catch (e) {
			console.warn(`Could not inline JS: ${src}`, e.message);
		}
		return match;
	});
}

function resolveImports(jsContent, baseDir) {
	const importRegex = /import\s*(?:\{[^}]*\}|[^'"]*)\s*from\s*["']([^"']+)["']/g;
	const dynamicImportRegex = /import\s*\(\s*["']([^"']+)["']\s*\)/g;
	
	const allImports = new Set();
	let match;
	
	while ((match = importRegex.exec(jsContent)) !== null) {
		allImports.add(match[1]);
	}
	while ((match = dynamicImportRegex.exec(jsContent)) !== null) {
		allImports.add(match[1]);
	}
	
	for (const importPath of allImports) {
		try {
			let resolvedPath;
			if (importPath.startsWith('/')) {
				resolvedPath = path.join(BUILD_DIR, importPath);
			} else if (importPath.startsWith('.')) {
				resolvedPath = path.join(baseDir, importPath);
			} else {
				continue;
			}
			
			if (fs.existsSync(resolvedPath)) {
				let importedContent = readFile(resolvedPath);
				importedContent = resolveImports(importedContent, path.dirname(resolvedPath));
			}
		} catch (e) {
			console.warn(`Could not resolve import: ${importPath}`, e.message);
		}
	}
	
	return jsContent;
}

function getAllJSFiles(dir, files = []) {
	const items = fs.readdirSync(dir);
	for (const item of items) {
		const fullPath = path.join(dir, item);
		if (fs.statSync(fullPath).isDirectory()) {
			getAllJSFiles(fullPath, files);
		} else if (item.endsWith('.js')) {
			files.push(fullPath);
		}
	}
	return files;
}

function getAllCSSFiles(dir, files = []) {
	const items = fs.readdirSync(dir);
	for (const item of items) {
		const fullPath = path.join(dir, item);
		if (fs.statSync(fullPath).isDirectory()) {
			getAllCSSFiles(fullPath, files);
		} else if (item.endsWith('.css')) {
			files.push(fullPath);
		}
	}
	return files;
}

function bundleToSingleFile() {
	console.log('Bundling SvelteKit output to single HTML file...');
	
	const indexPath = path.join(BUILD_DIR, 'index.html');
	if (!fs.existsSync(indexPath)) {
		console.error('Build output not found. Run "npm run build" first.');
		process.exit(1);
	}
	
	let html = readFile(indexPath);
	
	const cssFiles = getAllCSSFiles(BUILD_DIR);
	let allCSS = '';
	for (const cssFile of cssFiles) {
		allCSS += readFile(cssFile) + '\n';
	}
	
	const jsFiles = getAllJSFiles(BUILD_DIR);
	let allJS = '';
	for (const jsFile of jsFiles) {
		allJS += readFile(jsFile) + '\n';
	}
	
	html = html.replace(/<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi, '');
	html = html.replace(/<script\s+[^>]*src=["'][^"']+["'][^>]*><\/script>/gi, '');
	html = html.replace(/<link\s+[^>]*rel=["']modulepreload["'][^>]*>/gi, '');
	
	const styleTag = `<style>${allCSS}</style>`;
	html = html.replace('</head>', `${styleTag}</head>`);
	
	const scriptTag = `<script type="module">${allJS}</script>`;
	html = html.replace('</body>', `${scriptTag}</body>`);
	
	fs.writeFileSync(OUTPUT_FILE, html, 'utf-8');
	
	const stats = fs.statSync(OUTPUT_FILE);
	console.log(`Created: ${OUTPUT_FILE} (${(stats.size / 1024).toFixed(1)} KB)`);
	console.log('This file can be downloaded and used offline.');
}

bundleToSingleFile();
