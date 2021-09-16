<template>
  <v-container class="ui-options">
    <v-row align="center">
      <v-col>
        <v-switch
          v-model="showHideAll"
          :label="showHideAllLabel"
          class="ma-0 pa-0"
          hide-details
          inset
          @change="toggleShowHideAll"
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="pinUnpinAll"
          :label="pinUnpinAllLabel"
          class="ma-0 pa-0"
          hide-details
          inset
          @change="togglePinUnpinAll"
        />
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <v-divider class="all-separator" />
      </v-col>
      <v-col>
        <v-divider class="all-separator" />
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <v-switch
          v-model="showPath"
          label="Show path"
          class="ma-0 pa-0"
          hide-details
          inset
          @change="onSwitchShowChange"
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="pinPath"
          label="Pin path"
          class="ma-0 pa-0"
          hide-details
          inset
          @change="onSwitchPinChange"
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
          inset
          @change="onSwitchShowChange"
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="pinTags"
          label="Pin tags"
          class="ma-0 pa-0"
          hide-details
          inset
          @change="onSwitchPinChange"
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
          inset
          @change="onSwitchShowChange"
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="pinHistory"
          label="Pin history"
          class="ma-0 pa-0"
          hide-details
          inset
          @change="onSwitchPinChange"
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
          inset
          @change="onSwitchShowChange"
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="pinListIndex"
          label="Pin list index"
          class="ma-0 pa-0"
          hide-details
          inset
          @change="onSwitchPinChange"
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
          inset
          @change="onSwitchShowChange"
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="pinLoop"
          label="Pin loop"
          class="ma-0 pa-0"
          hide-details
          inset
          @change="onSwitchPinChange"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
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
  PLAYER_OPTS_UI_M_TOGGLE_SHOW_HIDE_ALL,
  PLAYER_OPTS_UI_M_TOGGLE_PIN_UNPIN_ALL,
} from '../../store/types';

export default {
  name: 'UIOptions',

  // components: {},

  emits: {},

  data: () => ({
    showHideAll: false,
    pinUnpinAll: false,
  }),

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

    showHideAllLabel () { return this.showHideAll ? 'Hide all' : 'Show all' },
    pinUnpinAllLabel () { return this.pinUnpinAll ? 'Unpin all' : 'Pin all' },
  },

  // watch: {},

  mounted () {
    this.onSwitchShowChange();
    this.onSwitchPinChange();
  },

  methods: {
    toggleShowHideAll (value) {
      this.$store.commit(`${this.NS}/${PLAYER_OPTS_UI_M_TOGGLE_SHOW_HIDE_ALL}`, value);
    },

    togglePinUnpinAll (value) {
      this.$store.commit(`${this.NS}/${PLAYER_OPTS_UI_M_TOGGLE_PIN_UNPIN_ALL}`, value);
    },

    onSwitchShowChange () {
      this.showHideAll = this.showPath
        && this.showTags
        && this.showHistory
        && this.showListIndex
        && this.showLoop;
    },

    onSwitchPinChange () {
      this.pinUnpinAll = this.pinPath
        && this.pinTags
        && this.pinHistory
        && this.pinListIndex
        && this.pinLoop;
    },
  },

  // beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
.ui-options {
  .all-separator {
    opacity: 0.4;
  }
  .v-label {
    margin-right: 20px;
  }
}
</style>
