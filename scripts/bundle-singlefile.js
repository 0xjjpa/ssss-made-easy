import fs from 'fs';
import path from 'path';
import * as esbuild from 'esbuild';

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

function inlineAsset(urlPath, fromFile) {
        const cleanPath = urlPath.replace(/^["']|["']$/g, '');
        if (cleanPath.startsWith('data:') || cleanPath.startsWith('http')) return urlPath;

        const absolutePath = path.resolve(path.dirname(fromFile), cleanPath);
        const ext = path.extname(absolutePath).toLowerCase();
        const mime = MIME_MAP[ext] || 'application/octet-stream';
        const data = fs.readFileSync(absolutePath);
        const dataUrl = `data:${mime};base64,${data.toString('base64')}`;
        return `"${dataUrl}"`;
}

function inlineCssLinks(html) {
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

function extractHydrationInfo(html) {
        const baseMatch = html.match(/(__sveltekit_[a-z0-9]+)\s*=\s*\{/);
        const startMatch = html.match(/import\("(\.\/[^\"]*start[^\"]*\.js)"\)/);
        const appMatch = html.match(/import\("(\.\/[^\"]*app[^\"]*\.js)"\)/);
        const optionsMatch = html.match(/kit\.start\(app,\s*element,\s*(\{[\s\S]*?\})\s*\);/);

        if (!baseMatch || !startMatch || !appMatch || !optionsMatch) {
                throw new Error('Unable to locate hydration bootstrap information in index.html');
        }

        return {
                baseVar: baseMatch[1],
                startPath: startMatch[1],
                appPath: appMatch[1],
                options: optionsMatch[1]
        };
}

async function buildInlineBundle(hydration) {
        const entrySource = `
const target = document.currentScript?.parentElement ?? document.body;
window.${hydration.baseVar} = { base: new URL('.', location).pathname.slice(0, -1) };
import * as kit from '${hydration.startPath}';
import * as app from '${hydration.appPath}';
kit.start(app, target, ${hydration.options});
`;

        const result = await esbuild.build({
                stdin: {
                        contents: entrySource,
                        resolveDir: BUILD_DIR
                },
                bundle: true,
                format: 'iife',
                platform: 'browser',
                minify: true,
                write: false,
                target: 'es2020',
                loader: {
                        '.css': 'text',
                        '.ttf': 'dataurl',
                        '.woff': 'dataurl',
                        '.woff2': 'dataurl',
                        '.eot': 'dataurl',
                        '.png': 'dataurl',
                        '.jpg': 'dataurl',
                        '.jpeg': 'dataurl',
                        '.svg': 'dataurl',
                        '.webp': 'dataurl'
                }
        });

        return result.outputFiles[0].text;
}

async function bundleToSingleFile() {
        console.log('Creating offline single-file build...');

        const indexPath = path.join(BUILD_DIR, 'index.html');
        if (!fs.existsSync(indexPath)) {
                console.error('Build output not found. Run "npm run build" first.');
                process.exit(1);
        }

        let html = read(indexPath);
        const hydration = extractHydrationInfo(html);

        html = inlineIcon(html);
        html = inlineCssLinks(html);

        html = html.replace(/<link[^>]+rel=["']modulepreload["'][^>]*>\s*/gi, '');
        html = html.replace(/<script[^>]*>[^]*?kit\.start[^]*?<\/script>/i, '');

        const bundle = await buildInlineBundle(hydration);
        const scriptTag = `<script>${bundle}</script>`;
        html = html.replace('</body>', `${scriptTag}\n</body>`);

        fs.writeFileSync(OUTPUT_FILE, html, 'utf-8');
        const stats = fs.statSync(OUTPUT_FILE);
        console.log(`Wrote ${OUTPUT_FILE} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
}

bundleToSingleFile().catch((err) => {
        console.error(err);
        process.exit(1);
});
