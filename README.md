# diaposhuffle-vue

## Project setup
```
yarn
cp ./.env.development.local.dist ./.env.development.local
```

### Compiles and hot-reloads for development
```
yarn dev
```

### Compiles and minifies for production
1. Install p7zip utils: `brew install p7zip`
1. Run in local:
    ```
    yarn build-nas
    ```
1. Copy manually 7z file `dist.7z` to maxou home.
1. Run in nas:
    ```
    cd /var/services/web/diaposhuffle-vue/public
    rm -dR /var/services/web/diaposhuffle-vue/public/temp
    mkdir /var/services/web/diaposhuffle-vue/public/temp
    mv /var/services/web/diaposhuffle-vue/public/js /var/services/web/diaposhuffle-vue/public/temp
    mv /var/services/web/diaposhuffle-vue/public/css /var/services/web/diaposhuffle-vue/public/temp
    mv /var/services/web/diaposhuffle-vue/public/index.php /var/services/web/diaposhuffle-vue/public/temp
    7z x /volume1/homes/maxou/dist.7z
    ```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
