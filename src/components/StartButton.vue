<template>
  <v-btn
    class="start-btn"
    :color="bgColor"
  >
    {{ content }}
  </v-btn>
</template>

<script>
import pages from '../router/pages';

const pagesInfo = {};
pagesInfo[pages.diapoShuffle.name] = {
  content: 'Start',
  action: '',
  bgColor: 'primary',
};
pagesInfo[pages.export.name] = {
  content: 'Export',
  action: '',
  bgColor: '#57B847', // $green-1
};
pagesInfo[pages.settings.name] = {
  content: 'Save',
  action: '',
  bgColor: '#F564A3', // $pink-dv-0:
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
    currentPageName() {
      return this.$route.name;
    },
    isDiapoShufflePage() {
      return this.currentPageName === pages.diapoShuffle.name;
    },
    isExportPage() {
      return this.currentPageName === pages.export.name;
    },
    isSettingsPage() {
      return this.currentPageName === pages.settings.name;
    },
    content() {
      return (this.pagesInfo[this.currentPageName] || {}).content || '';
    },
    bgColor() {
      return (this.pagesInfo[this.currentPageName] || {}).bgColor || '';
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
