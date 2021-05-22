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
1. Install p7zip utils: 
    ```
    brew install p7zip
    ```
1. Run in local:
    ```
    yarn build-nas
    ```
1. Copy manually `./scripts/prd-nas.sh` file to `/var/services/web/diaposhuffle-vue`.
1. Copy manually 7z file `dist.7z` to maxou home `/volume1/homes/maxou`.
1. Run in nas:
    ```
    bash /var/services/web/diaposhuffle-vue/prd-nas.sh
    ```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
