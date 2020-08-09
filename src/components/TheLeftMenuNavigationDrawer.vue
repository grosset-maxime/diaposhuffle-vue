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
export default {
  name: 'TheLeftMenuNavigationDrawer',

  data: () => ({
    drawer: true,
    width: 200,
    items: [{
      title: 'DiapoShuffle',
      icon: 'mdi-shuffle-variant',
      path: '/',
    }, {
      title: 'Export',
      icon: 'mdi-database-export',
      path: '/export',
    }, {
      title: 'Settings',
      icon: 'mdi-cog',
      path: '/settings',
    }],
  }),
};
</script>

<style lang="scss">

</style>
