// const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: [
          '@/styles/_variables.uikit',
          '@/styles/_mixins.uikit',
          '@/styles/_variables',
          '@/styles/_mixins',
        ].map((v) => `@import "${v}.scss";`).join(''),
      },
    },
  },
  // configureWebpack: {
  //   plugins: [new VuetifyLoaderPlugin()],
  // },
};
