<template>
  <v-navigation-drawer
    v-model="showMenu"
    :width="width"
    app
  >
    <v-list dense>
      <v-list-item
        v-for="item in items"
        :key="item.name"
        :to="item.path"
        link
      >
        <v-list-item-action class="mr-4">
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import pages from '../router/pages';

export default {
  name: 'TheLeftMenuNavigationDrawer',

  data: () => ({
    drawer: true,
    width: 200,
    items: [pages.diapoShuffle, pages.export, pages.settings],
  }),

  computed: {
    showMenu: {
      get() {
        return this.$store.state.showTheLeftMenu;
      },
      set(value) {
        this.$store.commit('showTheLeftMenu', value);
      },
    },
  },
};
</script>

<style lang="scss">

</style>
