<template>
  <v-app id="app">
    <TheLeftMenu />

    <v-main>
      <router-view />
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
      :value="showWindowOverlay"
      opacity="0.9"
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
    showWindowOverlay() {
      return this.$store.state.showWindowOverlay;
    },
    showTheHelp() {
      return this.$store.state.showTheHelp;
    },
  },
};
</script>

<style lang="scss">
@import "./styles/_ui.scss";

.the-footer {
  display: flex;
  justify-content: center;

  .start-btn-ctn {
    width: 50%;
    text-align: center;
  }
}
</style>
