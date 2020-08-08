<template>
  <v-navigation-drawer
    v-model="drawer"
    app
  >
    <v-list dense>
      <v-list-item link>
        <v-list-item-action>
          <v-icon>mdi-shuffle-variant</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>DiapoShuffle</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link>
        <v-list-item-action>
          <v-icon>mdi-database-export</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Export</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item link>
        <v-list-item-action>
          <v-icon>mdi-cog</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>

export default {
  name: 'TheLeftMenuNavigationDrawer',
};
</script>

<style lang="scss">

</style>
