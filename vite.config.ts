import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { execSync } from 'child_process';

let gitSha = 'unknown';
try {
        gitSha = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
        gitSha = 'dev';
}

const config: UserConfig = {
        plugins: [sveltekit()],
        server: {
                host: '0.0.0.0',
                port: 5000,
                allowedHosts: true,
                hmr: {
                        clientPort: 443
                }
        },
        define: {
                '__GIT_SHA__': JSON.stringify(gitSha)
        }
};

export default config;
