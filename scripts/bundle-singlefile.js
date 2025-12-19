import fs from 'fs';
import path from 'path';
const BUILD_DIR = path.resolve('build');
const OUTPUT_FILE = path.join(BUILD_DIR, 'ssss-made-easy-offline.html');

const MIME_MAP = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.woff2': 'font/woff2',
        '.woff': 'font/woff',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject'
};

function read(filePath) {
        return fs.readFileSync(filePath, 'utf-8');
}

function inlineAsset(assetPath, fromFile) {
        const cleanPath = assetPath.replace(/^["']|["']$/g, '');
        if (cleanPath.startsWith('data:') || cleanPath.startsWith('http')) return cleanPath;

        const absolutePath = path.resolve(path.dirname(fromFile), cleanPath);
        const ext = path.extname(absolutePath).toLowerCase();
        const mime = MIME_MAP[ext] || 'application/octet-stream';
        const data = fs.readFileSync(absolutePath);
        return `data:${mime};base64,${data.toString('base64')}`;
}

function inlineCss(html) {
        const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
        let combinedCss = '';

        html = html.replace(linkRegex, (match) => {
                const hrefMatch = match.match(/href=["']([^"']+)["']/i);
                const href = hrefMatch?.[1];
                if (!href) return '';

                const cssPath = path.join(BUILD_DIR, href.replace(/^\.\//, ''));
                if (!fs.existsSync(cssPath)) {
                        console.warn(`Skipping missing stylesheet: ${href}`);
                        return '';
                }

                let css = read(cssPath);
                css = css.replace(/url\(([^)]+)\)/g, (full, assetPath) => `url(${inlineAsset(assetPath.trim(), cssPath)})`);
                combinedCss += css + '\n';
                return '';
        });

        if (!combinedCss) return html;
        const styleTag = `<style>\n${combinedCss}</style>`;
        return html.replace('</head>', `${styleTag}\n</head>`);
}

function inlineIcon(html) {
        const iconRegex = /<link[^>]+rel=["']icon["'][^>]*href=["']([^"']+)["'][^>]*>/i;
        return html.replace(iconRegex, (match, href) => {
                const iconPath = path.join(BUILD_DIR, href.replace(/^\.\//, ''));
                if (!fs.existsSync(iconPath)) return match;
                const ext = path.extname(iconPath).toLowerCase();
                const mime = MIME_MAP[ext] || 'image/png';
                const dataUrl = `data:${mime};base64,${fs.readFileSync(iconPath).toString('base64')}`;
                return `<link rel="icon" href="${dataUrl}" />`;
        });
}

function inlineScripts(html) {
        const scriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi;
        return html.replace(scriptRegex, (match, src) => {
                const scriptPath = path.join(BUILD_DIR, src.replace(/^\.\//, ''));
                if (!fs.existsSync(scriptPath)) {
                        console.warn(`Skipping missing script: ${src}`);
                        return '';
                }
                let code = read(scriptPath);
                // inline asset references inside bundled output
                code = code.replace(/"(\.\/)?assets\/(.+?)"/g, (full, prefix, file) => {
                        const assetPath = path.join(BUILD_DIR, 'assets', file);
                        if (!fs.existsSync(assetPath)) return full;
                        const dataUrl = inlineAsset(assetPath, assetPath);
                        return `"${dataUrl}"`;
                });
                return `<script type="module">${code}</script>`;
        });
}

function cleanPreloads(html) {
        return html.replace(/<link[^>]+rel=["']modulepreload["'][^>]*>\s*/gi, '');
}

function buildSingleFile() {
        console.log('Inlining build assets into a single HTML file...');
        const indexPath = path.join(BUILD_DIR, 'index.html');
        if (!fs.existsSync(indexPath)) {
                        console.error('Build output not found. Run "npm run build" first.');
                        process.exit(1);
        }

        let html = read(indexPath);
        html = cleanPreloads(html);
        html = inlineIcon(html);
        html = inlineCss(html);
        html = inlineScripts(html);

        fs.writeFileSync(OUTPUT_FILE, html, 'utf-8');
        const stats = fs.statSync(OUTPUT_FILE);
        console.log(`Wrote ${OUTPUT_FILE} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
}

buildSingleFile();
