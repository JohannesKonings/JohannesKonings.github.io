import { defineConfig } from '@tanstack/start/config'

export default defineConfig({
  server: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
    },
    static: true,
    preset: 'static',
  },
})