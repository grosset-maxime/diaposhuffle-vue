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

    <v-overlay
      z-index="10"
      :value="showTheOverlay"
      opacity="0.9"
      class="the-overlay"
    >
      <TheHelp v-if="showTheHelp" />
    </v-overlay>
  </v-app>
</template>

<script>
import StartButton from './components/StartButton.vue';
import TheLeftMenu from './components/TheLeftMenu.vue';
import TheHelp from './components/TheHelp.vue';

export default {
  name: 'App',
  components: {
    TheLeftMenu,
    StartButton,
    TheHelp,
  },

  data: () => ({
  }),

  computed: {
    showTheOverlay() {
      return this.$store.getters.showTheOverlay;
    },
    showTheHelp() {
      return this.$store.getters.showTheHelp;
    },
  },
};
</script>

<style lang="scss">
@import "./styles/_ui.scss";

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
