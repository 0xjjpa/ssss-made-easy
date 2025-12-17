import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	server: {
		host: '0.0.0.0',
		port: 5000,
		allowedHosts: true
	}
};

export default config;
