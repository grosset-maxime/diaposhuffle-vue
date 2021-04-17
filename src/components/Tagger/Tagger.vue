<template>
  <div class="tagger">
    <div class="selected-tags">
      <TagsList
        :tags="selectedTags"
      />
    </div>

    <div
      v-if="!selectedTags.length"
      class="selected-tags-empty"
    >
      No tags selected
    </div>

    <v-divider class="separator" />

    <div class="filter-form">
      <v-text-field
        :value="filters.text"
        @input="filters.text = ($event || '').toLowerCase()"
        @focus="onFilterTextFocus"
        @blur="onFilterTextBlur"
        ref="filterText"
        label="Filter tags"
        prepend-icon="mdi-magnify"
        clearable
      />
    </div>

    <div class="categories-list">
      <CategoriesList
        :categories="categoriesList"
        @onSelect="onSelectCategory"
        @onUnselect="onUnselectCategory"
      />
    </div>

    <v-divider class="separator" />

    <div class="unselected-tags">
      <TagsList
        :tags="unselectedTags"
        :selected="selectedTagsIds"
        :key="key"
        :categories-filter="filters.categories"
        :text-filter="filters.text"
        @onSelect="onSelect"
        @onUnselect="onUnselect"
      />
    </div>
  </div>
</template>

<script>
import {
  TAGGER_G_TAGS_LIST,
  TAGGER_G_CATEGORIES_LIST,
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

  emits: {
    onCancel: null,
    onSelect: null,
    onUnselect: null,
  },

  data: () => ({
    tagsList: [],

    categoriesList: [],

    selectedTags: [],

    unselectedTags: [],

    selectedTagsIds: {},

    selectedCategories: [],

    unselectedCategories: [],

    filters: {
      text: '',
      categories: {},
    },

    isFilterTextHasFocus: false,

    keyboardShortcuts: {
      main: () => {},
    },

    key: Date.now(),
  }),

  computed: {
    NS () { return 'tagger' },

    nbSelected () { return this.selectedTags.length },

    tagsListStore () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS_LIST}`] },

    categoriesListStore () { return this.$store.getters[`${this.NS}/${TAGGER_G_CATEGORIES_LIST}`] },
  },

  watch: {},

  mounted () {
    this.fetchTags();
  },

  methods: {
    onShow () {
      this.attachKeyboardShortcuts();

      this.tagsList = this.tagsListStore.map((tag) => deepClone(tag));
      this.categoriesList = this.categoriesListStore.map((cat) => deepClone(cat));

      this.unselectedTags = this.tagsList;
      this.unselectedCategories = this.categoriesList;

      // TODO: find a way to update the view when modal is hide and then show again.
      this.key = Date.now();

      this.$refs.filterText.focus();
    },

    onHide () { this.removeKeyboardShortcuts() },

    onSelect (tagId) {
      this.$set(this.selectedTagsIds, tagId, true);
      this.$emit('onSelect', tagId);
    },

    onUnselect (tagId) {
      this.$delete(this.selectedTagsIds, tagId);
      this.$emit('onUnselect', tagId);
    },

    onCancel () {
      this.$emit('onCancel');
    },

    onSelectCategory (catId) {
      this.$set(this.filters.categories, catId, true);
    },

    onUnselectCategory (catId) {
      this.$delete(this.filters.categories, catId);
    },

    onUnselectAll () { this.selectedTags = [] },

    onFilterTextFocus () {
      this.isFilterTextHasFocus = true;
    },

    onFilterTextBlur () {
      this.isFilterTextHasFocus = false;
    },

    clearFilterText () {
      this.filters.text = '';
    },

    fetchTags () {
      this.$store.dispatch(`${this.NS}/${TAGGER_A_FETCH_CATEGORIES}`);
      this.$store.dispatch(`${this.NS}/${TAGGER_A_FETCH_TAGS}`);
    },

    attachKeyboardShortcuts () {
      this.keyboardShortcuts.main = (e) => {
        const key = getKey(e);
        switch (key) {
          case 'Enter':
            // this.onSave();
            break;

          case 'Escape':
            if (!this.isFilterTextHasFocus) {
              this.onCancel();
            }
            if (this.isFilterTextHasFocus) {
              this.clearFilterText();
            }
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
  padding: 4px;

  .selected-tags-empty {
    text-align: center;
    padding: 4px;
    color: $grey-6;
  }

  .filter-form {
    margin-bottom: 4px;
    margin-left: 8px;
    width: 250px;
  }

  .categories-list {
    margin-top: 10px;
  }

  .separator {
    margin: 8px 8px;
  }
}
</style>
