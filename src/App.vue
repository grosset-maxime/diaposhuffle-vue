<template>
  <v-app id="app">
    <TheLeftMenu />

    <v-main>
      <v-container class="the-main-ctn">
        <router-view />
      </v-container>
    </v-main>

    <v-footer
      app
      class="the-footer"
    >
      <div class="start-btn-ctn">
        <StartButton />
      </div>
    </v-footer>

    <TheHelp />

    <ThePlayer v-if="showThePlayer" />
  </v-app>
</template>

<script>
import StartButton from './components/StartButton.vue';
import TheLeftMenu from './components/TheLeftMenu.vue';
import TheHelp from './components/TheHelp.vue';
import ThePlayer from './components/ThePlayer.vue';
import {
  INDEX_G_SHOW_THE_PLAYER,
} from './store/types';

export default {
  name: 'App',

  components: {
    TheLeftMenu,
    StartButton,
    TheHelp,
    ThePlayer,
  },

  data: () => ({}),

  computed: {
    showThePlayer () { return this.$store.getters[INDEX_G_SHOW_THE_PLAYER] },
  },
};
</script>

<style lang="scss">
@import './styles/_ui.scss';

$footer-height: 48px;

.the-main-ctn {
  height: calc(100vh - #{$footer-height});
}

.the-footer {
  display: flex;
  justify-content: center;

  .start-btn-ctn {
    width: 50%;
    text-align: center;
  }
}
</style>
