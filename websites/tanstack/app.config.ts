import { defineConfig } from '@tanstack/start/config'

export const githubPagesPrefix = '/tanstack'

export default defineConfig({
  server: {
    compatibilityDate: '2024-11-23',
    // prerender: {
    //   routes: ['/'],
    //   crawlLinks: true,
    // },
    static: true,
    preset: 'static',
  },
})