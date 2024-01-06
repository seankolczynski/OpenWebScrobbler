/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';

import react from '@vitejs/plugin-react-swc';
import svgrPlugin from 'vite-plugin-svgr';
import { viteExternalsPlugin } from 'vite-plugin-externals';
import { VitePWA } from 'vite-plugin-pwa';
import { terser } from 'rollup-plugin-terser';
import VitePluginReactRemoveAttributes from 'vite-plugin-react-remove-attributes';
import tsconfigPaths from 'vite-tsconfig-paths';

const manifest = require('./src/webmanifest.json');

const removeAttributes = VitePluginReactRemoveAttributes.default;

const envPrefix = 'REACT_APP_';

const isDevEnvironment = process.env.NODE_ENV === 'development';
const isProdEnvironment = process.env.NODE_ENV === 'production';

const defineReactAppEnv = (mode) => {
  const env = loadEnv(mode, process.cwd(), '');
  return Object.keys(env).reduce((acc, key) => {
    if (key.startsWith(envPrefix)) {
      acc[`process.env.${key}`] = JSON.stringify(env[key]);
    }
    return acc;
  }, {});
};

// https://vitejs.dev/config/
const viteConfig = ({ mode }) =>
  defineConfig({
    base: '/',
    server: {
      host: true,
      // port: 3000,
      strictPort: true,
      clearScreen: false,
      proxy: {
        '/api': {
          target: 'http://localhost:3274/',
          changeOrigin: true,
        },
      },
    },
    envPrefix,
    define: {
      ...defineReactAppEnv(mode),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.NO_DEVTOOLS': JSON.stringify(process.env.NO_DEVTOOLS),
      'process.env.REACT_APP_VERSION': JSON.stringify(process.env.npm_package_version),
    },
    plugins: [
      tsconfigPaths(),
      react({
        babel: {
          plugins: [
            [
              '@locator/babel-jsx/dist',
              {
                env: 'development',
              },
            ],
          ],
        },
      }),
      svgrPlugin(),
      removeAttributes({
        attributes: ['data-cy'],
      }),
      viteExternalsPlugin({
        'redux-logger': isDevEnvironment ? 'redux-logger' : 'window',
      }),
      VitePWA({
        registerType: 'prompt',
        injectRegister: 'inline',
        srcDir: 'build',
        filename: 'service-worker.js',
        manifest,
        manifestFilename: 'site.webmanifest',
        minify: false, // Applies to manifest
        workbox: {
          navigateFallbackDenylist: [/^\/api/],
        },
      }),
    ],
    build: {
      outDir: 'build',
      assetsDir: 'static',
      sourcemap: true,
      minify: 'terser',
      rollupOptions: {
        plugins: [
          terser({
            format: {
              comments: false,
            },
          }),
        ],
        mangle: {
          keep_classnames: false,
          reserved: [],
        },
      },
    },
    test: {
      coverage: {
        enabled: false,
        reporter: ['lcov', 'html'],
        reportsDirectory: './coverage',
        thresholds: {
          statements: 100,
          branches: 95,
          functions: 100,
          lines: 100,
        },
      },
      globals: true,
      environment: 'jsdom',
      setupFiles: 'src/setupTests.ts',
    },
  });

export default viteConfig;
