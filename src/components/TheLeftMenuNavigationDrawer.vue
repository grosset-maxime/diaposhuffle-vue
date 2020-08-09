<template>
  <v-navigation-drawer
    v-model="drawer"
    :width="width"
    app
  >
    <v-list dense>
      <v-list-item
        v-for="item in items"
        :key="item.title"
        :to="item.path"
        link
      >
        <v-list-item-action>
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
import pages from '../pages';

export default {
  name: 'TheLeftMenuNavigationDrawer',

  data: () => ({
    drawer: true,
    width: 200,
    items: [pages.diapoShuffle, pages.export, pages.settings],
  }),
};
</script>

<style lang="scss">

</style>
