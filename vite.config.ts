/*
 * @Author: zouyaoji@https://github.com/zouyaoji
 * @Date: 2021-12-08 23:26:13
 * @LastEditTime: 2023-07-20 22:07:59
 * @LastEditors: cweibo
 * @Description:
 * @FilePath: \vue-map-demo\vite.config.ts
 */
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('./package.json')
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

const htmlPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      return html.replace(/<title>(.*?)<\/title>/, `<title>${process.env.VITE_VUE_APP_TITLE}</title>`)
    }
  }
}

// https://vitejs.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }
  return defineConfig({
    base: process.env.VITE_VUE_ROUTER_BASE,
    plugins: [
      vueJsx(),
      vue({
        template: { transformAssetUrls }
      }),
      quasar({
        sassVariables: true
      }),
      htmlPlugin(),
      {
        name: 'singleHMR',
        handleHotUpdate({ modules }) {
          modules.map(m => {
            m.importedModules = new Set()
            m.importers = new Set()
          })

          return modules
        }
      }
    ],
    resolve: {
      alias: {
        '@src': resolve(__dirname, './src'),
        '@api': resolve(__dirname, './src/api'),
        '@assets': resolve(__dirname, './src/assets'),
        '@components': resolve(__dirname, './src/components'),
        '@composables': resolve(__dirname, './src/composables'),
        '@config': resolve(__dirname, './src/config'),
        '@directives': resolve(__dirname, './src/directives'),
        '@i18n': resolve(__dirname, './src/i18n'),
        '@layouts': resolve(__dirname, './src/layouts'),
        '@pages': resolve(__dirname, './src/pages'),
        '@router': resolve(__dirname, './src/router'),
        '@store': resolve(__dirname, './src/store'),
        '@types': resolve(__dirname, './src/types'),
        '@utils': resolve(__dirname, './src/utils')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@src/assets/style/variables.scss";'
        }
      }
    },
    server: {
      // host: '0.0.0.0',
      https: false,
      port: 3200,
      proxy: {
        '/traffictile': {
          target: 'https://tm.amap.com/trafficengine/mapabc/traffictile',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/traffictile/, '/')
        },
        '/v3': {
          target: 'https://restapi.amap.com/v3',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/v3/, '/')
        }
      }
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      },
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('/node_modules/')) {
              const modules = [
                'quasar',
                'leaflet',
                'element-plus',
                'lodash',
                'axios',
                'interactjs',
                'lowdb',
                'pinia',
                '@supermap/iclient-leaflet'
              ]
              const chunk = modules.find(module => id.includes(`/node_modules/${module}`))
              return chunk ? `vendor-${chunk}` : 'vendor'
            }
          }
        }
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
      'process.env': {}
    }
  })
}
