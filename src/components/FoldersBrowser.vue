<template>
  <v-dialog
    content-class="folders-browser"
    :value="show"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-toolbar>
        <v-btn
          icon
          @click="onCancel"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Folders browser</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            text
            @click="onSave"
          >
            Save
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <div
        class="ctn"
      >
        <FoldersBrowserList
          :folders="folders"
          @fetch="fetchFolderList"
        />
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { FOLDERS_BROWSER_A_FETCH_FOLDERS } from '../store/types';
import { getKey } from '../utils/utils';
import FoldersBrowserList from './FolderBrowserList.vue';

export default {
  name: 'FoldersBrowser',

  components: {
    FoldersBrowserList,
  },

  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },

  emits: {
    onClose: null,
  },

  data: () => ({
    folders: {},

    keyboardShortcuts: {
      main: () => {},
    },
  }),

  computed: {
    NS () { return 'foldersBrowser' },
  },

  watch: {
    show (onShow) {
      if (onShow) {
        this.attachKeyboardShortcuts();
        this.$store.dispatch(`${this.NS}/${FOLDERS_BROWSER_A_FETCH_FOLDERS}`)
          .then((folders) => {
            this.folders = folders;
          });
      } else {
        this.removeKeyboardShortcuts();
      }
    },
  },

  mounted () {
  },

  methods: {
    onSave () {
      this.onClose();
    },
    onCancel () {
      this.onClose();
    },
    onClose () {
      this.$emit('onClose');
    },

    fetchFolderList (path) {
      this.$store.dispatch(`${this.NS}/${FOLDERS_BROWSER_A_FETCH_FOLDERS}`, path)
        .then((folders) => {
          this.folders = folders;
        });
    },

    attachKeyboardShortcuts () {
      this.keyboardShortcuts.main = (e) => {
        // console.log('FoldersBrowser e:', e);

        const key = getKey(e);
        switch (key) {
          case 'Enter':
            this.onSave();
            break;

          case 'Escape':
            this.onCancel();
            break;
          default:
        }
      };

      window.addEventListener('keyup', this.keyboardShortcuts.main);
    },

    removeKeyboardShortcuts () {
      window.removeEventListener('keyup', this.keyboardShortcuts.main);
    },
  },

  beforeDestroy () {
    this.removeKeyboardShortcuts();
  },
};
</script>

<style lang="scss" scoped>
</style>

<style lang="scss">
.folders-browser {
  .ctn {
    // 56px (v-toolbar-title height) + 24px (v-container padding top + bottom)
    height: calc(100vh - 64px);
    overflow: auto;
    padding: 10px;
    padding-bottom: 40px;
  }
}
</style>
