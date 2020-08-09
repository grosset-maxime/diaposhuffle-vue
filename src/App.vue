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
  </v-app>
</template>

<script>
import StartButton from './components/StartButton.vue';
import TheLeftMenu from './components/TheLeftMenu.vue';

export default {
  name: 'App',
  components: {
    TheLeftMenu,
    StartButton,
  },
  data: () => ({
  }),
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
