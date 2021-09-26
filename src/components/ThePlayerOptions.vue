<template>
  <v-container class="the-player-options">
    <v-tabs
      class="tabs"
      v-model="tab"
    >
      <v-tab href="#source">
        <v-icon left>
          mdi-file-tree
        </v-icon>
        Source
      </v-tab>

      <v-tab href="#player">
        <v-icon left>
          mdi-motion-play-outline
        </v-icon>
        Player
      </v-tab>

      <v-tab href="#ui">
        <v-icon left>
          mdi-monitor-screenshot
        </v-icon>
        UI
      </v-tab>

      <v-tabs-items
        class="tabs-items"
        v-model="tab"
      >
        <v-tab-item
          key="1"
          value="source"
        >
          <SourceOptions
            ref="sourceOptions"
            @showFolderBrowser="onShowFolderBrowser"
            @hideFolderBrowser="onHideFolderBrowser"
            @showTaggerModal="onShowTaggerModal"
            @hideTaggerModal="onHideTaggerModal"
          />
        </v-tab-item>

        <v-tab-item
          key="2"
          value="player"
        >
          <PlayerOptions />
        </v-tab-item>

        <v-tab-item
          key="3"
          value="ui"
        >
          <UIOptions />
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
  </v-container>
</template>

<script>
// TODO: Feature: save in user preferences (bdd or localstorage) the choosen options.
import {
  INDEX_G_SHOW_THE_PLAYER,
  INDEX_G_SHOW_THE_HELP,

  INDEX_A_PLAYER_START,
} from '../store/types';
import { getKey } from '../utils/utils';
import SourceOptions from './ThePlayerOptions/SourceOptions.vue';
import PlayerOptions from './ThePlayerOptions/PlayerOptions.vue';
import UIOptions from './ThePlayerOptions/UIOptions.vue';

export default {
  name: 'ThePlayerOptions',

  components: {
    SourceOptions,
    PlayerOptions,
    UIOptions,
  },

  emits: {
    showTheHelp: null,
  },

  data: () => ({
    // Default tab to display.
    tab: 'source',

    keyboardShortcuts: {
      main: () => {},
    },
  }),

  computed: {
    NS () { return 'player' },

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
  padding-top: 3px;
  @include w-scrollbar;

  .tabs {
    border-radius: 5px;
  }

  .tabs-items {
    background-color: transparent;
    padding-top: 6px;
  }
}
</style>
