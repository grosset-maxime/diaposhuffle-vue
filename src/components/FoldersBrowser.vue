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
          ref="FolderBrowserList"
          :selected="selectedFolders"
          @onSelect="onSelect"
          @onUnselect="onUnSelect"
        />
        <div>
          Selected: {{ selected }}
        </div>
        <div>
          Selected folders: {{ selectedFolders }}
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
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

    selected: {
      type: Array,
      default: () => ([]),
    },
  },

  emits: {
    onClose: null,
    onSave: null,
  },

  data: () => ({
    selectedFolders: [],

    keyboardShortcuts: {
      main: () => {},
    },
  }),

  computed: {},

  watch: {
    show (onShow) { return onShow ? this.onShow() : this.onHide() },
  },

  mounted () {},

  methods: {
    onShow () {
      this.attachKeyboardShortcuts();

      // this.selected.forEach((path) => { this.$set(this.selectedFolders, path, true) });
      this.selectedFolders = [...this.selected];

      // Wait for v-dialog transition end before continuing.
      setTimeout(() => {
        this.$refs.FolderBrowserList.onShow();
      }, 300);
    },

    onHide () { this.removeKeyboardShortcuts() },

    onSave () {
      this.$emit(
        'onSave',
        [...this.selectedFolders],
      );
      this.onClose();
    },

    onCancel () {
      this.onClose();
    },

    onClose () {
      this.onHide();
      this.$emit('onClose');
    },

    onSelect (path) {
      if (!this.selectedFolders.includes(path)) {
        this.selectedFolders.push(path);
      }
    },

    onUnSelect (path) {
      this.selectedFolders = this.selectedFolders.filter((p) => p !== path);
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
