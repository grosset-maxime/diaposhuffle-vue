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

    <div>
      <CategoriesList
        :categories="unselectedCategories"
      />
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
  TAGGER_G_TAGS,
  TAGGER_G_CATEGORIES,
  TAGGER_A_FETCH_TAGS,
  TAGGER_A_FETCH_CATEGORIES,
} from '../../store/types';
import { getKey, deepClone } from '../../utils/utils';
import TagsList from './TagsList.vue';
import CategoriesList from './CategoriesList.vue';

export default {
  name: 'Tagger',

  components: {
    TagsList,
    CategoriesList,
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

    selectedCategories: [],

    unselectedCategories: [],

    keyboardShortcuts: {
      main: () => {},
    },
  }),

  computed: {
    NS () { return 'tagger' },

    nbSelected () { return this.selectedTags.length },

    tags () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS}`] },

    categories () { return this.$store.getters[`${this.NS}/${TAGGER_G_CATEGORIES}`] },
  },

  watch: {},

  mounted () {
    this.fetchTags();
  },

  methods: {
    onShow () {
      // this.attachKeyboardShortcuts();

      // this.tags = [...this.selected];

      // Wait for v-dialog transition end before continuing.
      setTimeout(() => {
        // this.$refs.FolderList.onShow();
      }, 300);

      this.unselectedTags = this.tags.map((tag) => deepClone(tag));
      this.unselectedCategories = this.categories.map((cat) => deepClone(cat));
    },

    onHide () { /* this.removeKeyboardShortcuts() */ },

    onSelect () {},

    onUnSelect () {},

    onUnselectAll () { this.selectedTags = [] },

    fetchTags () {
      this.$store.dispatch(`${this.NS}/${TAGGER_A_FETCH_CATEGORIES}`);
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
