<template>
  <v-container class="the-player-options">
    <v-row>
      <SourceOptions
        ref="sourceOptions"
        @showFolderBrowser="onShowFolderBrowser"
        @hideFolderBrowser="onHideFolderBrowser"
        @showTaggerModal="onShowTaggerModal"
        @hideTaggerModal="onHideTaggerModal"
      />
    </v-row>

    <v-row
      class="mt-4"
      align="center"
    >
      <v-col class="interval-col">
        <v-slider
          v-model="interval"
          min="1"
          max="60"
          label="Interval"
          @click:append="resetInterval"
          append-icon="mdi-close"
          thumb-label="always"
          thumb-size="24"
          hint="1 - 60 seconds"
          persistent-hint
          ticks
          dense
        />
      </v-col>
    </v-row>

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

    <v-row
      align="center"
      v-if="false"
    >
      <v-col>
        <v-switch
          v-model="showFromPined"
          label="Show pined items"
          class="ma-0 pa-0"
          disabled
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
          v-model="muteVideo"
          label="Mute video"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
    </v-row>

    <v-row align="center">
      <v-col>
        <v-switch
          v-model="fetchItemRandomly"
          label="Fetch Item Randomly"
          class="ma-0 pa-0"
          hide-details
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// TODO: Feature: save in user preferences (bdd or localstorage) the choosen options.
// TODO: Feature: Add an option to play in infinite loop for video item.
// TODO: Feature: Add play pined items feature
// TODO: Feature: Seperate filters from options at UI side and at component side too, to be able to show options in player view. Create sections.
// TODO: Feature: Add an option to force pin the player UI. Should propound an option to allow to pin all pinable elements ?
import {
  INDEX_G_SHOW_THE_PLAYER,
  INDEX_G_SHOW_THE_HELP,
  INDEX_A_PLAYER_START,

  PLAYER_G_OPTIONS,

  PLAYER_M_OPTIONS,
  PLAYER_M_RESET_INTERVAL,
} from '../store/types';
import { getKey } from '../utils/utils';
import SourceOptions from './ThePlayerOptions/SourceOptions.vue';

export default {
  name: 'ThePlayerOptions',

  components: {
    SourceOptions,
  },

  emits: {
    showTheHelp: null,
  },

  data: () => ({
    keyboardShortcuts: {
      main: () => {},
    },
  }),

  computed: {
    NS () { return 'player' },

    interval: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].interval },
      set (interval) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { interval }) },
    },

    showPath: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].showPath },
      set (showPath) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { showPath }) },
    },

    pinPath: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].pinPath },
      set (pinPath) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { pinPath }) },
    },

    showFromPined: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].showFromPined },
      set (showFromPined) {
        this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { showFromPined });
      },
    },

    showTags: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].showTags },
      set (showTags) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { showTags }) },
    },

    pinTags: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].pinTags },
      set (pinTags) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { pinTags }) },
    },

    muteVideo: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].muteVideo },
      set (muteVideo) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { muteVideo }) },
    },

    fetchItemRandomly: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`].fetchItemRandomly },
      set (fetchItemRandomly) { this.$store.commit(`${this.NS}/${PLAYER_M_OPTIONS}`, { fetchItemRandomly }) },
    },

    thePlayer () { return this.$store.getters[INDEX_G_SHOW_THE_PLAYER] },

    theHelp () { return this.$store.getters[INDEX_G_SHOW_THE_HELP] },
  },

  watch: {
    thePlayer (onShow) {
      if (onShow) {
        this.removeKeyboardShortcuts();
      } else {
        this.attachKeyboardShortcuts();
      }
    },

    theHelp (onShow) {
      if (onShow) {
        this.removeKeyboardShortcuts();
      } else if (!this.thePlayer) {
        this.attachKeyboardShortcuts();
      }
    },
  },

  mounted () {
    this.attachKeyboardShortcuts();
  },

  methods: {
    showFolderBrowser () {
      this.$refs.sourceOptions.showFolderBrowser();
    },

    onShowFolderBrowser () {
      this.removeKeyboardShortcuts();
    },

    onHideFolderBrowser () {
      this.attachKeyboardShortcuts();
    },

    showTaggerModal () {
      this.$refs.sourceOptions.showTaggerModal();
    },

    onShowTaggerModal () {
      this.removeKeyboardShortcuts();
    },

    onHideTaggerModal () {
      this.attachKeyboardShortcuts();
    },

    resetInterval () { this.$store.commit(`${this.NS}/${PLAYER_M_RESET_INTERVAL}`) },

    attachKeyboardShortcuts () {
      this.keyboardShortcuts.main = (e) => {
        const key = getKey(e);

        switch (key) {
          case 'Space':
          case 'Enter':
            this.$store.dispatch(INDEX_A_PLAYER_START);
            break;
          case 'b':
            this.showFolderBrowser();
            break;
          case 'h':
            this.$emit('showTheHelp');
            break;
          case 't':
            this.showTaggerModal();
            break;
          default:
        }
      };

      window.addEventListener('keydown', this.keyboardShortcuts.main);
    },

    removeKeyboardShortcuts () {
      window.removeEventListener('keydown', this.keyboardShortcuts.main);
    },
  },

  beforeDestroy () {
    this.removeKeyboardShortcuts();
  },
};
</script>

<style lang="scss" scoped>
.the-player-options {
  height: 100%;
  overflow: auto;
  margin-right: 5px;
  @include w-scrollbar;
}

.v-label {
  margin-right: 20px;
}

.interval-col {
  padding-right: 20%;
}
</style>
