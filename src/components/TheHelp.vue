<template>
  <div class="the-help">
    <v-btn
      icon
      @click="closeTheHelp"
      class="close-btn"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-container class="help-component-ctn">
      <v-card-title class="main-title">
        Help - {{ pageTitle }}
      </v-card-title>
      <component :is="currentHelp" />
    </v-container>
  </div>
</template>

<script>
import pages from '../router/pages';
import { SHOW_THE_HELP } from '../store/mutations-types';
import HelpDiapoShuffle from './HelpDiapoShuffle.vue';

const pageHelpComponent = {};
pageHelpComponent[pages.diapoShuffle.path] = HelpDiapoShuffle;

export default {
  name: 'TheHelp',
  components: {
    HelpDiapoShuffle,
  },
  data: () => ({
  }),
  computed: {
    routePath() {
      return this.$route.path;
    },
    currentHelp() {
      return pageHelpComponent[this.routePath];
    },
    pageTitle() {
      return (pages.getPageFromPath(this.routePath) || {}).title || '';
    },
  },
  methods: {
    closeTheHelp() {
      this.$store.commit(SHOW_THE_HELP, false);
    },
  },
};
</script>

<style lang="scss" scoped>
.the-help {
  width: 100vw;
  height: 100vh;
  position: relative;
}
.close-btn {
  position: absolute;
  top: 28px;
  right: 22px;
}
.main-title {
  justify-content: center;
}
.help-component-ctn {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
