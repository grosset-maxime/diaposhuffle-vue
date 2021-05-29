<template>
  <v-dialog
    content-class="the-help"
    :value="show"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card class="the-help-card">
      <v-toolbar height="56">
        <v-toolbar-title>
          Help - {{ pageTitle }}
        </v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            icon
            @click="close"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <component
        v-if="show"
        class="help-component-ctn"
        :is="currentHelp"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import { getKey } from '../utils/utils';
import { pages, getPageFromPath } from '../router/pages';
import {
  INDEX_G_SHOW_THE_HELP,
  INDEX_M_SHOW_THE_HELP,
} from '../store/types';
import HelpDiapoShuffle from './HelpDiapoShuffle.vue';

const pageHelpComponent = {};
pageHelpComponent[pages.diapoShuffle.path] = HelpDiapoShuffle;

export default {
  name: 'TheHelp',

  components: {
    HelpDiapoShuffle,
  },

  data: () => ({
    keyboardShortcuts: {
      main: () => {},
    },
  }),

  computed: {
    show: {
      get () { return this.$store.getters[INDEX_G_SHOW_THE_HELP] },
      set (show) { this.$store.commit(INDEX_M_SHOW_THE_HELP, show) },
    },

    routePath () {
      return this.$route.path;
    },
    currentHelp () {
      return pageHelpComponent[this.routePath];
    },
    pageTitle () {
      return (getPageFromPath(this.routePath) || {}).title || '';
    },
  },

  watch: {
    show (onShow) {
      if (onShow) {
        this.attachKeyboardShortcuts();
      } else {
        this.removeKeyboardShortcuts();
      }
    },
  },

  mounted () {},

  methods: {
    close () { this.show = false },

    attachKeyboardShortcuts () {
      this.keyboardShortcuts.main = (e) => {
        // console.log('TheHelp e:', e);

        const key = getKey(e);
        switch (key) {
          case 'Escape':
          case 'h':
            this.close();
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

<style lang="scss">
$toolbar-height: 56px;

.the-help {
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .the-help-card {
    height: 100%;
  }

  .help-component-ctn {
    height: calc(100% - #{$toolbar-height});
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding-bottom: 50px;
    @include w-scrollbar;
  }
}
</style>
