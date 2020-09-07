<template>
  <v-card
    height="100%"
    color="grey darken-4"
    class="main-card"
  >
    <v-card-title>
      <v-app-bar-nav-icon
        @click.stop="toggleTheLeftMenu"
        class="mr-4"
      />

      {{ pageTitle }} - Options

      <v-btn
        class="help"
        icon
        @click="showTheHelp"
      >
        <v-icon>mdi-help-circle-outline</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider class="divider-top ml-3 mr-3" />

    <ThePlayerOptions @showTheHelp="showTheHelp" />
  </v-card>
</template>

<script>
import ThePlayerOptions from '../components/ThePlayerOptions.vue';
import { getPageFromPath } from '../router/pages';
import {
  INDEX_G_SHOW_THE_LEFT_MENU,
  INDEX_M_SHOW_THE_LEFT_MENU,
  INDEX_M_SHOW_THE_HELP,
} from '../store/types';

export default {
  name: 'DiapoShuffle',

  components: {
    ThePlayerOptions,
  },

  data: () => ({
  }),

  computed: {
    pageTitle () { return (getPageFromPath(this.$route.path) || {}).title || '' },
  },

  methods: {
    toggleTheLeftMenu () {
      this.$store.commit(
        INDEX_M_SHOW_THE_LEFT_MENU,
        !this.$store.getters[INDEX_G_SHOW_THE_LEFT_MENU],
      );
    },

    showTheHelp () {
      this.$store.commit(INDEX_M_SHOW_THE_HELP, true);
    },
  },
};
</script>

<style lang="scss" scoped>
.main-card {
  display: flex;
  flex-direction: column;
}
.help {
  position: absolute;
  right: 10px;
}
</style>
