import { defineConfig } from '@tanstack/start/config'

export default defineConfig({
  server: {
    prerender: {
      // autoSubfolderIndex: true,
      routes: ['/tanstack'],
      crawlLinks: true,
    },
    static: true,
    preset: 'static',
  },
})