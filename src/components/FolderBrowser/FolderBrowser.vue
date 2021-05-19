<template>
  <v-dialog
    content-class="folder-browser"
    :value="show"
    fullscreen
    hide-overlay
    transition="dialog-bottom-transition"
    persistent
    no-click-animation
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
        <div
          v-if="nbSelected"
          class="nb-selected"
        >
          Selected: {{ nbSelected }}
        </div>
        <v-toolbar-items>
          <v-btn
            v-if="nbSelected"
            class="unselect-all-btn"
            text
            @click="onUnselectAll"
          >
            Unselect All
          </v-btn>
          <v-btn
            text
            @click="onConfirm"
          >
            Save
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <div
        class="ctn"
      >
        <FolderList
          ref="FolderList"
          :selected="selectedFolders"
          @select="onSelect"
          @unselect="onUnSelect"
        />
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
// TODO: Enh: Prefetch the first level of folders.
// TODO: Feature: Add navigation with arrow keys and select/unselect with enter key.
// TODO: Feature: Add a input search to filter the view.
// TODO: Feature: Add section with 5 or 10 latest selected pathes.
// TODO: Feature: Allow to search a folder by its name which has not been fetch yet (Need a new backend API).
import { getKey } from '../../utils/utils';
import FolderList from './FolderList.vue';

export default {
  name: 'FolderBrowser',

  components: {
    FolderList,
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
    close: null,
    save: null,
  },

  data: () => ({
    selectedFolders: [],

    keyboardShortcuts: {
      main: () => {},
    },
  }),

  computed: {
    nbSelected () { return this.selectedFolders.length },
  },

  watch: {
    show (onShow) { return onShow ? this.onShow() : this.onHide() },
  },

  mounted () {},

  methods: {
    onShow () {
      this.attachKeyboardShortcuts();

      this.selectedFolders = [...this.selected];

      // Wait for v-dialog transition end before continuing.
      setTimeout(() => {
        this.$refs.FolderList.onShow();
      }, 300);
    },

    onHide () { this.removeKeyboardShortcuts() },

    onConfirm () {
      this.$emit(
        'save',
        [...this.selectedFolders],
      );
      this.onClose();
    },

    onCancel () {
      this.onClose();
    },

    onClose () {
      this.onHide();
      this.$emit('close');
    },

    onSelect (path) {
      if (!this.selectedFolders.includes(path)) {
        this.selectedFolders.push(path);
      }
    },

    onUnSelect (path) {
      this.selectedFolders = this.selectedFolders.filter((p) => p !== path);
    },

    onUnselectAll () { this.selectedFolders = [] },

    attachKeyboardShortcuts () {
      this.keyboardShortcuts.main = (e) => {
        const key = getKey(e);
        let preventDefault = false;
        const stopPropagation = false;

        if (e.altKey) {
          switch (key) {
            // On windows, Meta + Enter does not trigger a keydown event,
            // So, set Alt + Enter to validate.
            case 'Enter':
              this.onConfirm();
              preventDefault = true;
              break;

            default:
          }
        } else if (e.metaKey) {
          // On windows, Alt + Escape does not trigger a keydown event,
          // So, set Meta + Escape to cancel.
          switch (key) {
            case 'Escape':
              this.onCancel();
              preventDefault = true;
              break;

            default:
          }
        }

        if (preventDefault) { e.preventDefault() }
        if (stopPropagation) { e.stopPropagation() }
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
</style>

<style lang="scss">
.folder-browser {
  .ctn {
    // 56px (v-toolbar-title height) + 24px (v-container padding top + bottom)
    height: calc(100vh - 64px);
    overflow: auto;
    padding: 10px;
    padding-bottom: 40px;
  }

  .nb-selected {
    margin-right: 10px;
  }

  .unselect-all-btn {
    text-transform: none;
    color: $grey-6;
    &:hover {
      color: white;
    }
  }
}
</style>
