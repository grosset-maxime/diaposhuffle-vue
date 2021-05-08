<template>
  <div class="tagger">
    <div class="selected-tags">
      <TagsList
        :tags="selectedTags"
        :selected="selectedIds"
        :text-filter="filters.text"
        :edit-mode="editMode"
        closable-tags
        @unselect="onUnselectSelected"
        @closeTag="onUnselectSelected"
        @editTag="showEditTagModal"
      />
    </div>

    <div
      v-if="!selectedTags.length"
      class="selected-tags-empty"
    >
      No tags selected
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
      />
    </div>

    <v-divider class="separator" />

    <!-- TODO: Allow focus tags and select/unselect by using keyboard -->
    <!-- TODO: Allow to navigate through tags section using keyboard -->
    <!-- TODO: Highlight matching text with filtering text -->
    <div class="unselected-tags">
      <TagsList
        ref="unselectedTagsList"
        :tags="unselectedTags"
        :selected="selectedIds"
        :categories-filter="filters.categories"
        :text-filter="filters.text"
        :edit-mode="editMode"
        show-no-tags
        @select="onSelectUnselected"
        @unselect="onUnselectUnselected"
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
      :tag="editTagModal.tag"
      @delete="onDeleteEditTagModal"
      @confirm="onConfirmEditTagModal"
      @cancel="onCancelEditTagModal"
    />
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
import CategoriesList from './CategoriesList.vue';
import CircularLoading from '../CircularLoading.vue';
import TagsList from './TagsList.vue';
import EditTagModal from './EditTagModal.vue';

export default {
  name: 'Tagger',

  components: {
    CategoriesList,
    CircularLoading,
    TagsList,
    EditTagModal,
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
    tagsList: [],

    categoriesList: [],

    selectedTags: [],

    unselectedTags: [],

    selectedIds: {},
    selectedCategoriesIds: {},

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

    isLoading: true,

    editTagModal: {
      show: false,
      add: false,
      tag: undefined,
    },
  }),

  computed: {
    NS () { return 'tagger' },

    nbSelected () { return this.selectedTags.length },

    tagsListStore () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS_LIST}`] },

    categoriesListStore () { return this.$store.getters[`${this.NS}/${TAGGER_G_CATEGORIES_LIST}`] },
  },

  watch: {},

  mounted () {
    // TODO: TEMP: only for testing purpose
    setTimeout(() => { if (this.isLoading) { this.onShow() } }, 2000);
  },

  methods: {
    onShow () {
      this.attachKeyboardShortcuts();

      this.fetchTags()
        .then(() => {
          this.onFetchTags();
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    onFetchTags () {
      this.tagsList = this.tagsListStore.map((tag) => deepClone(tag));
      this.categoriesList = this.categoriesListStore.map((cat) => deepClone(cat));

      this.updateSelectedIds();

      this.unselectedTags = this.tagsList.filter((tag) => !this.selectedIds[tag.id]);
      this.selectedTags = this.tagsList.filter((tag) => this.selectedIds[tag.id]);
      this.unselectedCategories = this.categoriesList;
    },

    onHide () { this.removeKeyboardShortcuts() },

    onSelectUnselected (tagId) {
      this.$set(this.selectedIds, tagId, true);
      this.$emit('select', tagId);
    },

    onUnselectUnselected (tagId) {
      this.$delete(this.selectedIds, tagId);
      this.$emit('unselect', tagId);
    },

    onUnselectSelected (tagId) {
      this.$delete(this.selectedIds, tagId);
      this.selectedTags = this.selectedTags.filter((tag) => tagId !== tag.id);
      this.unselectedTags = this.tagsList.filter((tag) => !this.selectedIds[tag.id]);

      this.$emit('unselect', tagId);
    },

    onCancel () {
      this.$emit('cancel');
    },

    onSelectCategory (catId) {
      this.$set(this.selectedCategoriesIds, catId, true);
      this.$set(this.filters.categories, catId, true);
    },

    onUnselectCategory (catId) {
      this.$delete(this.selectedCategoriesIds, catId);
      this.$delete(this.filters.categories, catId);
    },

    onUnselectAll () { this.selectedTags = [] },

    onFilterTextFocus () {
      this.isFilterTextHasFocus = true;
    },

    onFilterTextBlur () {
      this.isFilterTextHasFocus = false;
    },

    onDeleteEditTagModal () {
      // TODO: delete tag.
      this.hideEditTagModal();
    },

    onConfirmEditTagModal () {
      // TODO: add new tag or edit tag.
      this.hideEditTagModal();
    },

    onCancelEditTagModal () {
      this.hideEditTagModal();
    },

    showEditTagModal (tagId) {
      this.removeKeyboardShortcuts();
      this.editTagModal.show = true;
      this.editTagModal.add = false;
      this.editTagModal.tag = this.tagsList.find((tag) => tag.id === tagId);
    },

    hideEditTagModal () {
      this.editTagModal.show = false;
      this.attachKeyboardShortcuts();
    },

    clearFilterText () {
      this.filters.text = '';
    },

    setFilterTextFocus () {
      this.$refs.filterText.focus();
    },

    selectRandom () {
      this.$refs.unselectedTagsList.selectRandom();
      this.setFilterTextFocus();
    },

    fetchTags () {
      return Promise.all([
        this.$store.dispatch(`${this.NS}/${TAGGER_A_FETCH_TAGS}`),
        this.$store.dispatch(`${this.NS}/${TAGGER_A_FETCH_CATEGORIES}`),
      ]);
    },

    updateSelectedIds () {
      this.selectedIds = Object.fromEntries(
        this.selected.map((tag) => [tag.id, true]),
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

  .selected-tags-empty {
    text-align: center;
    padding: 4px;
    color: $grey-6;
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
