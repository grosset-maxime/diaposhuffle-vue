// const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: '@import "@/styles/_myVariables.scss";',
      },
    },
  },
  // configureWebpack: {
  //   plugins: [new VuetifyLoaderPlugin()],
  // },
};
