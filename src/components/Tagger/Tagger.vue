<template>
  <div class="tagger">
    <div class="selected-tags">
      <TagsList
        :tag-ids="selectedTagIds"
        :selected-ids="selectedTagIdsMap"
        :text-filter="filters.text"
        :edit-mode="editMode"
        :no-tags-text="noSelectedTagsText"
        closable-tags
        @unselect="onUnselectSelected"
        @closeTag="onUnselectSelected"
        @addTag="showAddTagModal"
        @editTag="showEditTagModal"
      />
    </div>

    <v-divider class="separator" />

    <div class="actions-bar">
      <div class="filter-form input-action">
        <v-text-field
          :value="filters.text"
          ref="filterText"
          label="Filter tags"
          prepend-icon="mdi-magnify"
          clearable
          autofocus
          hide-details
          @input="filters.text = $event || ''"
          @focus="onFilterTextFocus"
          @blur="onFilterTextBlur"
          @click:prepend="setFilterTextFocus"
        />
      </div>

      <div class="sort-by-field input-action">
        <v-select
          :value="sorts.field"
          :items="sorts.fieldItems"
          label="By"
          hide-details
          prepend-icon="mdi-sort"
          @input="sorts.field = $event || ''"
        />
      </div>

      <div class="sort-by-field input-action">
        <v-select
          class="sort-direction"
          :value="sorts.direction"
          :items="sorts.directionItems"
          label="Direction"
          hide-details
          prepend-icon="mdi-sort-alphabetical-variant"
          @input="sorts.direction = $event || ''"
        />
      </div>
    </div>

    <!-- TODO: Show latest used tags -->
    <!-- TODO: on filtering latest used tags, do not hide it but set opacity. -->

    <!-- TODO: Show nb tags per categories -->
    <!-- TODO: on filtering show remaining tags per categories -->
    <!-- TODO: on filtering, do not hide category but set opacity -->
    <div class="categories-list">
      <CategoriesList
        :category-ids="categoryIds"
        :selected-ids="selectedCategoryIdsMap"
        :edit-mode="editMode"
        @select="onSelectCategory"
        @unselect="onUnselectCategory"
        @addCategory="showAddCategoryModal"
        @editCategory="showEditCategoryModal"
      />
    </div>

    <v-divider class="separator" />

    <!-- TODO: Allow focus tags and select/unselect by using keyboard -->
    <!-- TODO: Allow to navigate through tags section using keyboard -->
    <!-- TODO: Highlight matching text with filtering text -->
    <div class="unselected-tags">
      <TagsList
        ref="unselectedTagsList"
        :tag-ids="unselectedTagIds"
        :selected-ids="selectedTagIdsMap"
        :edit-mode="editMode"
        :no-tags-text="noUnselectedTagsText"
        @select="onSelectUnselected"
        @unselect="onUnselectUnselected"
        @addTag="showAddTagModal"
        @editTag="showEditTagModal"
      />

      <CircularLoading
        v-if="isLoading"
        indeterminate
      />
    </div>

    <EditTagModal
      :show="editTagModal.show"
      :add="editTagModal.add"
      :tag-id="editTagModal.tagId"
      @delete="onDeleteEditTagModal"
      @confirm="onConfirmEditTagModal"
      @cancel="onCancelEditTagModal"
    />

    <EditCategoryModal
      :show="editCategoryModal.show"
      :add="editCategoryModal.add"
      :category-id="editCategoryModal.categoryId"
      @delete="onDeleteEditCategoryModal"
      @confirm="onConfirmEditCategoryModal"
      @cancel="onCancelEditCategoryModal"
    />
  </div>
</template>

<script>
import Fuse from 'fuse.js';
import {
  TAGGER_G_TAGS,
  TAGGER_G_CATEGORIES,
  TAGGER_A_FETCH_TAGS,
  TAGGER_A_ADD_TAG,
  TAGGER_A_UPDATE_TAG,
  TAGGER_A_DELETE_TAG,
  TAGGER_A_FETCH_CATEGORIES,
  TAGGER_A_ADD_CATEGORY,
  TAGGER_A_UPDATE_CATEGORY,
  TAGGER_A_DELETE_CATEGORY,
} from '../../store/types';
import {
  getKey,
  isEmptyObj,
  getRandomElement,
} from '../../utils/utils';
import CategoriesList from './CategoriesList.vue';
import CircularLoading from '../CircularLoading.vue';
import TagsList from './TagsList.vue';
import EditTagModal from './EditTagModal.vue';
import EditCategoryModal from './EditCategoryModal.vue';

export default {
  name: 'Tagger',

  components: {
    CategoriesList,
    CircularLoading,
    TagsList,
    EditTagModal,
    EditCategoryModal,
  },

  props: {
    selected: {
      type: Array,
      default: () => ([]),
    },

    editMode: {
      type: Boolean,
      default: false,
    },
  },

  emits: {
    cancel: null,
    select: null,
    unselect: null,
  },

  data: () => ({
    selectedTagIdsMap: {},
    selectedCategoryIdsMap: {},

    filters: {
      text: '',
      categories: {},
    },

    sorts: {
      field: 'name',
      direction: 'asc',

      fieldItems: [
        { text: 'Name', value: 'name' },
        { text: 'Category', value: 'category' },
      ],

      directionItems: [
        { text: 'A - Z', value: 'asc' },
        { text: 'Z - A', value: 'desc' },
      ],
    },

    isFilterTextHasFocus: false,

    keyboardShortcuts: {
      main: () => {},
    },

    isLoading: true,

    editTagModal: {
      show: false,
      add: false,
      tagId: undefined,
    },

    editCategoryModal: {
      show: false,
      add: false,
      categoryId: undefined,
    },
  }),

  computed: {
    NS () { return 'tagger' },

    tagsMap () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS}`] },

    tags () {
      return Object.values(this.tagsMap).sort(
        (tagA, tagB) => {
          let sort = 0;
          const direction = this.sorts.direction === 'asc' ? 1 : -1;
          const field = this.sorts.field || 'name';

          if (field === 'name') {
            sort = tagA.name.localeCompare(tagB.name);
          } if (field === 'category') {
            sort = tagA.category - tagB.category;
          }

          return direction * sort;
        },
      );
    },

    categoriesMap () {
      return this.$store.getters[`${this.NS}/${TAGGER_G_CATEGORIES}`];
    },

    categoryIds () {
      return Object.values(this.categoriesMap).sort(
        (catA, catB) => {
          let sort = 0;
          const direction = this.sorts.direction === 'asc' ? 1 : -1;
          const field = this.sorts.field || 'name';

          if (field === 'name') {
            sort = catA.name.localeCompare(catB.name);
          } if (field === 'category') {
            sort = catA.id - catB.id;
          }

          return direction * sort;
        },
      ).map((cat) => cat.id);
    },

    selectedTagIds () {
      let { tags } = this;

      tags = tags.filter((tag) => !!this.selectedTagIdsMap[tag.id]);

      if (this.isFiltering) {
        if (this.hasCategoriesFilter) {
          tags = this.applyCategoriesFilter(tags);
        }

        if (this.filters.text) {
          tags = this.applyTextFilter(tags);
        }
      }

      return tags.map((tag) => tag.id);
    },

    unselectedTagIds () {
      let { tags } = this;

      tags = tags.filter((tag) => !this.selectedTagIdsMap[tag.id]);

      if (this.isFiltering) {
        if (this.hasCategoriesFilter) {
          tags = this.applyCategoriesFilter(tags);
        }

        if (this.filters.text) {
          tags = this.applyTextFilter(tags);
        }
      }

      return tags.map((tag) => tag.id);
    },

    isFiltering () {
      return this.hasCategoriesFilter || this.filters.text;
    },

    hasCategoriesFilter () { return !isEmptyObj(this.filters.categories) },

    noSelectedTagsText () {
      return this.isFiltering && !isEmptyObj(this.selectedTagIdsMap)
        ? 'No tags results'
        : 'No tags selected';
    },

    noUnselectedTagsText () { return this.isFiltering ? 'No tags results' : '' },
  },

  mounted () {
    // TODO: TEMP: only for testing purpose
    setTimeout(() => { if (this.isLoading) { this.onShow() } }, 2000);
  },

  methods: {
    async onShow () {
      this.attachKeyboardShortcuts();

      try {
        await this.fetchTagsAndCategories();
        this.onFetchTags();
      // eslint-disable-next-line no-empty
      } catch (e) {}

      this.isLoading = false;
    },

    onFetchTags () { this.updateSelectedTagIdsMap() },

    onHide () { this.removeKeyboardShortcuts() },

    onSelectUnselected (tagId) {
      this.$set(this.selectedTagIdsMap, tagId, true);
      this.$emit('select', tagId);
    },

    onUnselectUnselected (tagId) {
      this.$delete(this.selectedTagIdsMap, tagId);
      this.$emit('unselect', tagId);
    },

    onUnselectSelected (tagId) {
      this.$delete(this.selectedTagIdsMap, tagId);
      this.$emit('unselect', tagId);
    },

    onCancel () { this.$emit('cancel') },

    onSelectCategory (catId) {
      this.$set(this.selectedCategoryIdsMap, catId, true);
      this.$set(this.filters.categories, catId, true);
    },

    onUnselectCategory (catId) {
      this.$delete(this.selectedCategoryIdsMap, catId);
      this.$delete(this.filters.categories, catId);
    },

    onFilterTextFocus () { this.isFilterTextHasFocus = true },

    onFilterTextBlur () { this.isFilterTextHasFocus = false },

    async onDeleteEditTagModal (tagId) {
      await this.$store.dispatch(`${this.NS}/${TAGGER_A_DELETE_TAG}`, tagId);

      this.onFetchTags();
      this.hideEditTagModal();
    },

    async onConfirmEditTagModal (tag) {
      if (this.editTagModal.add) {
        await this.$store.dispatch(`${this.NS}/${TAGGER_A_ADD_TAG}`, tag);
      } else {
        await this.$store.dispatch(`${this.NS}/${TAGGER_A_UPDATE_TAG}`, tag);
      }

      this.onFetchTags();
      this.hideEditTagModal();
    },

    onCancelEditTagModal () { this.hideEditTagModal() },

    showAddTagModal () {
      this.removeKeyboardShortcuts();
      this.editTagModal.add = true;
      this.editTagModal.tagId = undefined;
      this.editTagModal.show = true;
    },

    showEditTagModal (tagId) {
      this.removeKeyboardShortcuts();
      this.editTagModal.add = false;
      this.editTagModal.tagId = tagId;
      this.editTagModal.show = true;
    },

    hideEditTagModal () {
      this.editTagModal.show = false;
      this.attachKeyboardShortcuts();
    },

    async onDeleteEditCategoryModal (catId) {
      await this.$store.dispatch(`${this.NS}/${TAGGER_A_DELETE_CATEGORY}`, catId);

      this.hideEditCategoryModal();
    },

    async onConfirmEditCategoryModal (category) {
      if (this.editCategoryModal.add) {
        await this.$store.dispatch(`${this.NS}/${TAGGER_A_ADD_CATEGORY}`, category);
      } else {
        await this.$store.dispatch(`${this.NS}/${TAGGER_A_UPDATE_CATEGORY}`, category);
      }

      this.hideEditCategoryModal();
    },

    onCancelEditCategoryModal () { this.hideEditCategoryModal() },

    showAddCategoryModal () {
      this.removeKeyboardShortcuts();
      this.editCategoryModal.add = true;
      this.editCategoryModal.categoryId = undefined;
      this.editCategoryModal.show = true;
    },

    showEditCategoryModal (catId) {
      this.removeKeyboardShortcuts();
      this.editCategoryModal.add = false;
      this.editCategoryModal.categoryId = catId;
      this.editCategoryModal.show = true;
    },

    hideEditCategoryModal () {
      this.editCategoryModal.show = false;
      this.attachKeyboardShortcuts();
    },

    clearFilterText () { this.filters.text = '' },

    setFilterTextFocus () { this.$refs.filterText.focus() },

    selectRandom () {
      const randomdTagId = getRandomElement(this.unselectedTagIds);

      if (randomdTagId) { this.onSelectUnselected(randomdTagId) }

      this.setFilterTextFocus();
    },

    applyCategoriesFilter (tags) {
      return tags.filter((tag) => !!this.filters.categories[tag.category]);
    },

    applyTextFilter (tags) {
      const options = {
        includeScore: true,
        includeMatches: true,
        keys: ['name'],
      };

      const fuse = new Fuse(tags, options);
      return fuse.search(this.filters.text).map((r) => r.item);
    },

    fetchTagsAndCategories () {
      return Promise.all([
        this.$store.dispatch(`${this.NS}/${TAGGER_A_FETCH_TAGS}`),
        this.$store.dispatch(`${this.NS}/${TAGGER_A_FETCH_CATEGORIES}`),
      ]);
    },

    updateSelectedTagIdsMap () {
      this.selectedTagIdsMap = Object.fromEntries(
        this.selected.map((tagId) => [tagId, true]),
      );
    },

    attachKeyboardShortcuts () {
      this.keyboardShortcuts.main = (e) => {
        const key = getKey(e);
        // TODO: on any key, focus tag filter input and start filtering.
        // TODO: imagine a combo key (CTRL + enter for example) to trigger save.
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
  padding: 4px 12px;

  .selected-tags {
    min-height: $tag-height;
  }

  .actions-bar {
    display: flex;
    align-items: center;
    margin-bottom: 25px;

    .input-action {
      margin-right: 60px;
    }

    .filter-form {
      width: 300px;
    }

    .sort-by-field,
    .sort-direction {
      width: 150px;
    }
  }

  .categories-list {
    display: flex;
  }

  .separator {
    margin: 8px 0;
  }
}
</style>
