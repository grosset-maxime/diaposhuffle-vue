<template>
  <v-dialog
    content-class="folder-browser"
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
            @click="onSave"
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

    onSave () {
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
