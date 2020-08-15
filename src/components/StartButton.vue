<template>
  <v-btn
    class="start-btn"
    :color="bgColor"
    @click="action"
  >
    {{ content }}
  </v-btn>
</template>

<script>
import { pages } from '../router/pages';
import { INDEX_A_START_PLAYING } from '../store/types';

const pagesInfo = {};
pagesInfo[pages.diapoShuffle.name] = {
  content: 'Start',
  action: INDEX_A_START_PLAYING,
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
    pageInfo () {
      return this.pagesInfo[this.$route.name] || {};
    },
    content () {
      return this.pageInfo.content || '';
    },
    bgColor () {
      return this.pageInfo.bgColor || '';
    },
  },
  methods: {
    action () {
      this.$store.dispatch(this.pageInfo.action);
    },
  },
};
</script>

<style lang="scss" scoped>
.start-btn {
  width: 100%;
}
</style>
