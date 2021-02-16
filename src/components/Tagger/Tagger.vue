<template>
  <div class="tagger">
    <div class="selected-tags">
      <TagsList
        :tags="selectedTags"
      />
    </div>

    <div class="filter-form">
      <input type="text">
    </div>

    <div class="unselected-tags">
      <TagsList
        :tags="unselectedTags"
      />
    </div>
  </div>
</template>

<script>
import {
  TAGGER_A_FETCH_TAGS,
  TAGGER_G_TAGS,
} from '../../store/types';
import { getKey } from '../../utils/utils';
import TagsList from './TagsList.vue';

export default {
  name: 'Tagger',

  components: {
    TagsList,
  },

  props: {
    selected: {
      type: Array,
      default: () => ([]),
    },
  },

  emits: {},

  data: () => ({
    selectedTags: [],

    unselectedTags: [],

    keyboardShortcuts: {
      main: () => {},
    },
  }),

  computed: {
    NS () { return 'tagger' },

    nbSelected () { return this.selectedTags.length },

    tags () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS}`] },
  },

  watch: {},

  mounted () {},

  methods: {
    onShow () {
      // this.attachKeyboardShortcuts();

      // this.tags = [...this.selected];

      // Wait for v-dialog transition end before continuing.
      setTimeout(() => {
        // this.$refs.FolderList.onShow();
      }, 300);

      this.unselectedTags = this.tags;
    },

    onHide () { /* this.removeKeyboardShortcuts() */ },

    onSelect () {},

    onUnSelect () {},

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
    this.removeKeyboardShortcuts();
  },
};
</script>

<style lang="scss" scoped>
.tagger {
}
</style>
