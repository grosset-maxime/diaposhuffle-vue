<template>
  <v-container class="ui-options">
    <v-row align="center">
      <v-col>
        <v-switch
          v-model="showPath"
          label="Show path"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="pinPath"
          label="Pin path"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <v-switch
          v-model="showTags"
          label="Show tags"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="pinTags"
          label="Pin tags"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// TODO: Feature: Add an option to force pin the player UI. Should propound an option to allow to pin all pinable elements ?
import {
  PLAYER_OPTS_UI_G_SHOW_PATH,
  PLAYER_OPTS_UI_G_PIN_PATH,
  PLAYER_OPTS_UI_G_SHOW_TAGS,
  PLAYER_OPTS_UI_G_PIN_TAGS,

  PLAYER_OPTS_UI_M_UI_OPTIONS,
} from '../../store/types';

export default {
  name: 'UIOptions',

  // components: {},

  emits: {},

  data: () => ({}),

  computed: {
    NS () { return 'playerOptionsUI' },

    showPath: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_OPTS_UI_G_SHOW_PATH}`] },
      set (showPath) {
        this.$store.commit(`${this.NS}/${PLAYER_OPTS_UI_M_UI_OPTIONS}`, { showPath });
      },
    },

    pinPath: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_OPTS_UI_G_PIN_PATH}`] },
      set (pinPath) {
        this.$store.commit(`${this.NS}/${PLAYER_OPTS_UI_M_UI_OPTIONS}`, { pinPath });
      },
    },

    showTags: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_OPTS_UI_G_SHOW_TAGS}`] },
      set (showTags) {
        this.$store.commit(`${this.NS}/${PLAYER_OPTS_UI_M_UI_OPTIONS}`, { showTags });
      },
    },

    pinTags: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_OPTS_UI_G_PIN_TAGS}`] },
      set (pinTags) {
        this.$store.commit(`${this.NS}/${PLAYER_OPTS_UI_M_UI_OPTIONS}`, { pinTags });
      },
    },
  },

  // watch: {},

  // mounted () {},

  // methods: {},

  // beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
.ui-options {
  .v-label {
    margin-right: 20px;
  }
}
</style>
