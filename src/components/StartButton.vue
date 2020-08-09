<template>
  <v-btn
    class="start-btn"
    :color="'primary'"
  >
    {{ content }}
  </v-btn>
</template>

<script>
import pages from '../pages';

const pagesInfo = {};
pagesInfo[pages.diapoShuffle.path] = {
  content: 'Start',
  action: '',
};
pagesInfo[pages.export.path] = {
  content: 'Export',
  action: '',
};
pagesInfo[pages.settings.path] = {
  content: 'Save',
  action: '',
};

export default {
  name: 'StartBtn',
  data: () => ({
    pagesInfo,
  }),
  computed: {
    currentPagePath() {
      return this.$route.path;
    },
    isDiapoShufflePage() {
      return this.currentPagePath === pages.diapoShuffle.path;
    },
    isExportPage() {
      return this.currentPagePath === pages.export.path;
    },
    isSettingsPage() {
      return this.currentPagePath === pages.settings.path;
    },
    content() {
      return (this.pagesInfo[this.currentPagePath] || {}).content || '';
    },
  },
  methods: {
    action() {
    },
  },
};
</script>

<style lang="scss" scoped>
.start-btn {
  width: 100%;
}
</style>
