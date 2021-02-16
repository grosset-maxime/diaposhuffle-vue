<template>
  <v-dialog
    content-class="tagger-modal"
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
        <v-toolbar-title>Tagger</v-toolbar-title>
        <v-spacer />
        <v-toolbar-items>
          <v-btn
            class="cancel-btn"
            text
            @click="onCancel"
          >
            Cancel
          </v-btn>
          <v-btn
            text
            @click="onSave"
          >
            Save
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <Tagger
        ref="Tagger"
        :selected="selected"
        @onSelect="onSelect"
        @onUnselect="onUnselect"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import {
  TAGGER_A_FETCH_TAGS,
  TAGGER_G_TAGS,
} from '../../store/types';
import { getKey } from '../../utils/utils';
import Tagger from './Tagger.vue';

export default {
  name: 'TaggerModal',

  components: {
    Tagger,
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
    selectedTags: [],

    keyboardShortcuts: {
      main: () => {},
    },
  }),

  computed: {
    NS () { return 'tagger' },

    nbSelected () { return this.selectedTags.length },

    tags () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS}`] },
  },

  watch: {
    show (onShow) { return onShow ? this.onShow() : this.onHide() },
  },

  mounted () {
    this.fetchTags();
  },

  methods: {
    onShow () {
      // this.attachKeyboardShortcuts();

      // this.tags = [...this.selected];

      // Wait for v-dialog transition end before continuing.
      setTimeout(() => {
        this.$refs.Tagger.onShow();
      }, 300);
    },

    onHide () { /* this.removeKeyboardShortcuts() */ },

    onSave () {
      this.$emit(
        'onSave',
        [...this.selectedTags],
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

    onSelect (tag) {
      if (!this.selectedTags.includes(tag)) {
        this.selectedTags.push(tag);
      }
    },

    onUnselect (tag) {
      this.selectedTags = this.selectedTags.filter((t) => t !== tag);
    },

    onUnselectAll () { this.selectedTags = [] },

    fetchTags () {
      this.$store.dispatch(`${this.NS}/${TAGGER_A_FETCH_TAGS}`);
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
    // this.removeKeyboardShortcuts();
  },
};
</script>

<style lang="scss" scoped></style>

<style lang="scss">
.tagger-modal {
  .ctn {
    // 56px (v-toolbar-title height) + 24px (v-container padding top + bottom)
    height: calc(100vh - 64px);
    overflow: auto;
    padding: 10px;
    padding-bottom: 40px;
  }

  .cancel-btn {
    text-transform: none;
    color: $grey-6;
    &:hover {
      color: white;
    }
  }
}
</style>
