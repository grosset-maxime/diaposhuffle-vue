<template>
  <div class="tagger">
    <div class="selected-tags">
      <TagsList
        :tag-ids="selectedTagIds"
        :selected-ids="selectedTagIdsMap"
        :text-filter="filters.text"
        :edit-mode="editMode"
        :no-tags-text="'No tags selected'"
        closable-tags
        @unselect="onUnselectSelected"
        @closeTag="onUnselectSelected"
        @addTag="showAddTagModal"
        @editTag="showEditTagModal"
      />
    </div>

    <v-divider class="separator" />

    <div class="actions-bar">
      <div class="filter-form">
        <v-text-field
          :value="filters.text"
          ref="filterText"
          label="Filter tags"
          prepend-icon="mdi-magnify"
          clearable
          autofocus
          @input="filters.text = $event || ''"
          @focus="onFilterTextFocus"
          @blur="onFilterTextBlur"
          @click:prepend="setFilterTextFocus"
        />
      </div>

      <!-- TODO: Add sort tags by categories, sort by name (A-Z) and (Z-A) -->

      <v-btn
        class="select-random-btn secondary"
        small
        @click="selectRandom"
      >
        Select random
      </v-btn>
    </div>

    <!-- TODO: Show latest used tags -->
    <!-- TODO: on filtering latest used tags, do not hide it but set opacity. -->

    <!-- TODO: Show nb tags per categories -->
    <!-- TODO: on filtering show remaining tags per categories -->
    <!-- TODO: on filtering, do not hide category but set opacity -->
    <div class="categories-list">
      <CategoriesList
        :categories="categoriesList"
        :selected="selectedCategoriesIds"
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
      :category="editCategoryModal.category"
      @delete="onDeleteEditCategoryModal"
      @confirm="onConfirmEditCategoryModal"
      @cancel="onCancelEditCategoryModal"
    />
  </div>
</template>

<script>
import {
  TAGGER_G_TAGS,
  // TAGGER_G_TAGS_LIST,
  TAGGER_G_CATEGORIES_LIST,
  TAGGER_A_FETCH_TAGS,
  TAGGER_A_ADD_TAG,
  TAGGER_A_UPDATE_TAG,
  TAGGER_A_DELETE_TAG,
  TAGGER_A_FETCH_CATEGORIES,
  TAGGER_A_ADD_CATEGORY,
  TAGGER_A_UPDATE_CATEGORY,
  TAGGER_A_DELETE_CATEGORY,
} from '../../store/types';
import { getKey, deepClone } from '../../utils/utils';
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
    categoriesList: [],

    selectedTagIdsMap: {},
    selectedCategoriesIds: {},

    filters: {
      text: '',
      categories: {},
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
      category: undefined,
    },
  }),

  computed: {
    NS () { return 'tagger' },

    tags () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS}`] },

    tagIds () { return Object.keys(this.tags) },

    categoriesListStore () {
      return this.$store.getters[`${this.NS}/${TAGGER_G_CATEGORIES_LIST}`];
    },

    // TODO: try to filter/sort tags from here instead of from tagsList.vue.
    selectedTagIds () {
      return this.tagIds
        .filter((id) => this.selectedTagIdsMap[id]);
    },

    unselectedTagIds () {
      return this.tagIds
        .filter((id) => !this.selectedTagIdsMap[id]);
    },
  },

  watch: {},

  mounted () {
    // TODO: TEMP: only for testing purpose
    setTimeout(() => { if (this.isLoading) { this.onShow() } }, 2000);
  },

  methods: {
    async onShow () {
      this.attachKeyboardShortcuts();

      try {
        await this.fetchTagsAndCategories();
        this.onFetchCategories();
        this.onFetchTags();
      // eslint-disable-next-line no-empty
      } catch (e) {}

      this.isLoading = false;
    },

    onFetchTags () { this.updateSelectedTagIdsMap() },

    onFetchCategories () {
      this.categoriesList = this.categoriesListStore.map((cat) => deepClone(cat));
    },

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
      this.$set(this.selectedCategoriesIds, catId, true);
      this.$set(this.filters.categories, catId, true);
    },

    onUnselectCategory (catId) {
      this.$delete(this.selectedCategoriesIds, catId);
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

      this.onFetchCategories();
      this.hideEditCategoryModal();
    },

    async onConfirmEditCategoryModal (category) {
      if (this.editCategoryModal.add) {
        await this.$store.dispatch(`${this.NS}/${TAGGER_A_ADD_CATEGORY}`, category);
      } else {
        await this.$store.dispatch(`${this.NS}/${TAGGER_A_UPDATE_CATEGORY}`, category);
      }

      this.onFetchCategories();
      this.hideEditCategoryModal();
    },

    onCancelEditCategoryModal () { this.hideEditCategoryModal() },

    showAddCategoryModal () {
      this.removeKeyboardShortcuts();
      this.editCategoryModal.add = true;
      this.editCategoryModal.category = undefined;
      this.editCategoryModal.show = true;
    },

    showEditCategoryModal (catId) {
      this.removeKeyboardShortcuts();
      this.editCategoryModal.add = false;
      this.editCategoryModal.category = this.categoriesList.find((cat) => cat.id === catId);
      this.editCategoryModal.show = true;
    },

    hideEditCategoryModal () {
      this.editCategoryModal.show = false;
      this.attachKeyboardShortcuts();
    },

    clearFilterText () { this.filters.text = '' },

    setFilterTextFocus () { this.$refs.filterText.focus() },

    selectRandom () {
      this.$refs.unselectedTagsList.selectRandom();
      this.setFilterTextFocus();
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

    .filter-form {
      margin-bottom: 4px;
      width: 250px;
    }

    .select-random-btn,
    .toggle-edit-btn {
      margin-left: 100px;
    }
  }

  .categories-list {
    margin-top: 10px;
  }

  .separator {
    margin: 8px 0;
  }
}
</style>
