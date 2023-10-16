const { defineConfig } = require('vite')

module.exports = defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: './index.html',
        home: './home.html',
        kingdom: './kingdom.html',
        grimes: './grimes.html',
        soundcloud: './soundcloud.html',
        lenskart: './lenskart.html',
        elfrave: './elfrave.html',
        geng_puma: './geng_puma.html',
        // ...
        // List all files you want in your build
      }
    }
  }
})