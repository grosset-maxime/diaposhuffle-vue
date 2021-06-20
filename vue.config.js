// const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

process.env.VUE_APP_OFFLINE_MATERIAL_DESIGN_CSS = process.env.VUE_APP_OFFLINE_MATERIAL_DESIGN_CSS
  || '';

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
