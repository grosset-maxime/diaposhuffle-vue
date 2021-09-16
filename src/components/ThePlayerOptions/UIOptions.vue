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

    <v-row align="center">
      <v-col>
        <v-switch
          v-model="showHistory"
          label="Show history"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="pinHistory"
          label="Pin history"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <v-switch
          v-model="showListIndex"
          label="Show list index"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="pinListIndex"
          label="Pin list index"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <v-switch
          v-model="showLoop"
          label="Show loop"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="pinLoop"
          label="Pin loop"
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
  PLAYER_OPTS_UI_G_SHOW_HISTORY,
  PLAYER_OPTS_UI_G_PIN_HISTORY,
  PLAYER_OPTS_UI_G_SHOW_LIST_INDEX,
  PLAYER_OPTS_UI_G_PIN_LIST_INDEX,
  PLAYER_OPTS_UI_G_SHOW_LOOP,
  PLAYER_OPTS_UI_G_PIN_LOOP,

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

    showHistory: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_OPTS_UI_G_SHOW_HISTORY}`] },
      set (showHistory) {
        this.$store.commit(`${this.NS}/${PLAYER_OPTS_UI_M_UI_OPTIONS}`, { showHistory });
      },
    },

    pinHistory: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_OPTS_UI_G_PIN_HISTORY}`] },
      set (pinHistory) {
        this.$store.commit(`${this.NS}/${PLAYER_OPTS_UI_M_UI_OPTIONS}`, { pinHistory });
      },
    },

    showListIndex: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_OPTS_UI_G_SHOW_LIST_INDEX}`] },
      set (showListIndex) {
        this.$store.commit(`${this.NS}/${PLAYER_OPTS_UI_M_UI_OPTIONS}`, { showListIndex });
      },
    },

    pinListIndex: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_OPTS_UI_G_PIN_LIST_INDEX}`] },
      set (pinListIndex) {
        this.$store.commit(`${this.NS}/${PLAYER_OPTS_UI_M_UI_OPTIONS}`, { pinListIndex });
      },
    },

    showLoop: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_OPTS_UI_G_SHOW_LOOP}`] },
      set (showLoop) {
        this.$store.commit(`${this.NS}/${PLAYER_OPTS_UI_M_UI_OPTIONS}`, { showLoop });
      },
    },

    pinLoop: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_OPTS_UI_G_PIN_LOOP}`] },
      set (pinLoop) {
        this.$store.commit(`${this.NS}/${PLAYER_OPTS_UI_M_UI_OPTIONS}`, { pinLoop });
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
