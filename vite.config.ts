import { relative, resolve } from 'path';
import { ModuleFormat } from 'rollup';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { rewriteLegacyCoreDtsPath } from './build/dts-paths.ts';

export const appendExtension = (format: ModuleFormat, name: String): string => {
	if (format === 'es') {
		return `${name}.mjs`;
	} else {
		return `${name}.js`;
	}
};

export default defineConfig({
	server: {
		port: Number(process.env.npm_config_port || 8000),
	},
	build: {
		target: ['es2015'],
		emptyOutDir: true,
		lib: {
			formats: ['es', 'umd'],
			entry: resolve(__dirname, 'js/index.ts'),
			name: 'Reveal',
			fileName: (format, entryName) => {
				return appendExtension(format, 'reveal');
			},
		},
		rollupOptions: {
			output: {
				assetFileNames: 'reveal.[ext]',
			},
		},
	},
	resolve: {
		alias: {
			// Matches the exported paths in package.json
			'reveal.js/plugin': '/plugin',
			'reveal.js': '/js',
			'reveal.css': '/css/reveal.scss',
		},
	},
	plugins: [
		{
			// Section markdown is fetched at runtime, so it is outside Vite's
			// module graph and does not reload the page on its own.
			name: 'reload-section-markdown',
			configureServer(server) {
				const sectionsDir = resolve(__dirname, 'sections');
				server.watcher.add(sectionsDir);
				server.watcher.on('change', (file) => {
					const fromSections = relative(sectionsDir, file);
					if (!fromSections.startsWith('..') && file.endsWith('.md')) {
						server.ws.send({ type: 'full-reload' });
					}
				});
			},
		},
		dts({
			insertTypesEntry: true,
			rollupTypes: false,
			exclude: ['**/index.ts'],
			copyDtsFiles: true,
			beforeWriteFile(filePath, content) {
				return {
					filePath: rewriteLegacyCoreDtsPath(filePath),
					content,
				};
			},
		}),
	],
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler',
			},
		},
	},
});
