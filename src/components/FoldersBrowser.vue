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
    </v-card>
  </v-dialog>
</template>

<script>
import { getKey } from '../utils/utils';

export default {
  name: 'FoldersBrowser',

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
    keyboardShortcuts: {
      main: () => {},
    },
  }),

  watch: {
    show (onShow) {
      if (onShow) {
        this.attachKeyboardShortcuts();
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
  // $margin: 20px;
  // margin: $margin;
  // width: calc(100% - #{$margin * 2});
  // height: calc(100% - #{$margin * 2});
}
</style>
