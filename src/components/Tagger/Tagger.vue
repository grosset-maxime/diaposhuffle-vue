<template>
  <div class="tagger">
    <div
      :class="['selected-tags', {
        shake: shake.selectedTags
      }]"
    >
      <TagsList
        :tag-ids="selectedTagIds"
        :focused="focused.section === SELECTED_FOCUSED_SECTION_NAME ? focused : undefined"
        :edit-mode="editMode"
        :no-tags-text="noSelectedTagsText"
        :masked="notFilteredSelectedTagIdsMap"
        closable-tags
        @clickTag="onTagClick"
        @closeTag="onTagClick"
        @addTag="showAddTagModal"
        @editTag="showEditTagModal"
      />
    </div>

    <v-divider class="separator" />

    <div class="actions-bar">
      <div class="filter-form input-action">
        <v-text-field
          ref="filterText"
          :value="filters.text"
          label="Filter tags"
          prepend-icon="mdi-magnify"
          clearable
          autofocus
          hide-details
          color="orange"
          @input="filters.text = $event || ''"
          @focus="onFilterTextFocus"
          @blur="onFilterTextBlur"
          @click:prepend="setFilterTextFocus"
        />
      </div>

      <div class="sort-by-field input-action">
        <v-select
          ref="sortByField"
          :value="sorts.field"
          :items="sorts.fieldItems"
          color="orange"
          label="Sort By"
          hide-details
          prepend-icon="mdi-sort"
          @input="sorts.field = $event || ''"
        />
      </div>

      <div class="sort-direction input-action">
        <v-select
          ref="sortDirection"
          :value="sorts.direction"
          :items="sorts.directionItems"
          label="Sort Direction"
          hide-details
          color="orange"
          prepend-icon="mdi-sort-alphabetical-variant"
          @input="sorts.direction = $event || ''"
        />
      </div>
    </div>

    <!-- TODO: Feature: Show latest used tags -->
    <!-- TODO: Feature: on filtering latest used tags, do not hide it but set opacity. -->

    <!-- TODO: Feature: Mask none selected category when at least one category is selected -->
    <div class="categories-list">
      <CategoriesList
        :category-ids="categoryIds"
        :selected-ids="selectedCategoryIdsMap"
        :nb-tags="nbTagsMap"
        :masked="notFilteredCategoryIdsMap"
        :edit-mode="editMode"
        @select="onSelectCategory"
        @unselect="onUnselectCategory"
        @addCategory="showAddCategoryModal"
        @editCategory="showEditCategoryModal"
      />
    </div>

    <v-divider class="separator" />

    <div
      :class="['last-used-unselected-tags', {
        shake: shake.lastUsedUnselectedTags
      }]"
    >
      <TagsList
        ref="lastUsedTagsList"
        :tag-ids="lastUsedTagIds"
        :focused="focused.section === LAST_USED_FOCUSED_SECTION_NAME ? focused : undefined"
        :masked="notFilteredLastUsedTagIdsMap"
        :edit-mode="false"
        :no-tags-text="noLastUsedTagsText"
        @clickTag="onTagClick"
        @addTag="showAddTagModal"
        @editTag="showEditTagModal"
      />
    </div>

    <v-divider class="separator" />

    <!-- TODO: Feature: Highlight matching text with filtering text -->
    <div
      :class="['unselected-tags', {
        shake: shake.unselectedTags
      }]"
    >
      <TagsList
        ref="unselectedTagsList"
        :tag-ids="unselectedTagIds"
        :focused="focused.section === UNSELECTED_FOCUSED_SECTION_NAME ? focused : undefined"
        :masked="notFilteredUnselectedTagIdsMap"
        :edit-mode="editMode"
        :no-tags-text="noUnselectedTagsText"
        @clickTag="onTagClick"
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
// TODO: Enh: On tag focus change, scroll to the focused tag.
// TODO: Enh: On filter by category update focused tag position.
// TODO: Enh: On sort update focused tag position.
// TODO: Feature: On up/down keydown, focus above/below tags section.
// TODO: Enh: On up/down left/right keydown set tag focus to right tag.
// TODO: Bug: Error on set tag when items come from the bdd.
import Fuse from 'fuse.js';
import {
  TAGGER_G_TAGS,
  TAGGER_G_LAST_USED_TAG_IDS,
  TAGGER_G_CATEGORIES,

  TAGGER_M_ADD_LAST_USED_TAG_ID,

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
  SHAKE_ANIMATION_TIME,
  getKey,
  isEmptyObj,
  getRandomElement,
  deepClone,
} from '../../utils/utils';
import CategoriesList from './CategoriesList.vue';
import CircularLoading from '../CircularLoading.vue';
import TagsList from './TagsList.vue';
import EditTagModal from './EditTagModal.vue';
import EditCategoryModal from './EditCategoryModal.vue';

const DEFAULT_FILTERS = {
  text: '',
  categories: {},
};

const SELECTED_FOCUSED_SECTION_NAME = 'selectedTags';
const UNSELECTED_FOCUSED_SECTION_NAME = 'unselectedTags';
const LAST_USED_FOCUSED_SECTION_NAME = 'lastUsedTags';

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
    select: null,
    unselect: null,
    save: null,
    cancel: null,
    toggleOpacity: null,
  },

  data: () => ({
    selectedTagIdsMap: {},
    selectedCategoryIdsMap: {},

    focused: {
      id: '',
      pos: 0,
      section: UNSELECTED_FOCUSED_SECTION_NAME,
    },

    filters: deepClone(DEFAULT_FILTERS),

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

    shake: {},

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

    SELECTED_FOCUSED_SECTION_NAME,
    UNSELECTED_FOCUSED_SECTION_NAME,
    LAST_USED_FOCUSED_SECTION_NAME,
  }),

  computed: {
    NS () { return 'tagger' },

    sectionsNames () {
      return [
        SELECTED_FOCUSED_SECTION_NAME,
        LAST_USED_FOCUSED_SECTION_NAME,
        UNSELECTED_FOCUSED_SECTION_NAME,
      ];
    },

    tagsMap () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAGS}`] },

    tags () { return Object.values(this.tagsMap) },

    sortedTags () {
      return [...this.tags].sort(
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
      let { sortedTags } = this;

      sortedTags = sortedTags.filter((tag) => !!this.selectedTagIdsMap[tag.id]);

      let tagsIds = sortedTags.map((tag) => tag.id);

      if (this.isFiltering) {
        const filteredTagsIds = this.filteredTags
          .filter((tag) => !!this.selectedTagIdsMap[tag.id])
          .map((tag) => tag.id);

        const filteredTagsIdsMap = Object.fromEntries(filteredTagsIds.map((id) => [id, true]));

        tagsIds = tagsIds.filter((id) => !filteredTagsIdsMap[id]);

        tagsIds = filteredTagsIds.concat(tagsIds);
      }

      return tagsIds;
    },

    /**
     * @returns {string[]} - List of last used tags ids.
     */
    lastUsedTagIds () {
      let tagsIds = this.$store.getters[`${this.NS}/${TAGGER_G_LAST_USED_TAG_IDS}`];

      if (this.isFiltering) {
        const filteredTagsIds = this.filteredTags
          .filter((tag) => tagsIds.includes(tag.id))
          .map((tag) => tag.id);

        const filteredTagsIdsMap = Object.fromEntries(filteredTagsIds.map((id) => [id, true]));

        tagsIds = tagsIds.filter((id) => !filteredTagsIdsMap[id]);

        tagsIds = filteredTagsIds.concat(tagsIds);
      }

      return tagsIds.filter((tagId) => !this.selectedTagIdsMap[tagId]);
    },

    /**
     * @returns {string[]} - List of unselected tags ids.
     */
    unselectedTagIds () {
      let { sortedTags } = this;

      sortedTags = sortedTags.filter((tag) => !this.selectedTagIdsMap[tag.id]);

      let tagsIds = sortedTags.map((tag) => tag.id);

      if (this.isFiltering) {
        const filteredTagsIds = this.filteredTags
          .filter((tag) => !this.selectedTagIdsMap[tag.id])
          .map((tag) => tag.id);

        const filteredTagsIdsMap = Object.fromEntries(filteredTagsIds.map((id) => [id, true]));

        tagsIds = tagsIds.filter((id) => !filteredTagsIdsMap[id]);

        tagsIds = filteredTagsIds.concat(tagsIds);
      }

      return tagsIds;
    },

    filteredTags () {
      if (!this.isFiltering) { return [] }

      let { tags } = this;

      if (this.hasCategoriesFilter) {
        tags = this.applyCategoriesFilter(tags);
      }

      if (this.filters.text) {
        const results = this.applyTextFilter(tags);

        // this.filters.textResults = results;

        tags = results.map((r) => {
          // console.log(r);
          const tag = r.item;
          tag.filterInfo = {
            ...r,
          };
          delete tag.filterInfo.item;

          return tag;
        });
      }

      return tags;
    },

    filteredTagsMap () {
      return Object.fromEntries(
        this.filteredTags.map((tag) => [tag.id, tag]),
      );
    },

    notFilteredSelectedTagIdsMap () {
      if (!this.isFiltering) { return {} }

      const notFilteredTagIds = this.selectedTagIds.filter(
        (tagId) => !(tagId in this.filteredTagsMap),
      );

      return Object.fromEntries(notFilteredTagIds.map((tagId) => [tagId, true]));
    },

    notFilteredLastUsedTagIdsMap () {
      if (!this.isFiltering) { return {} }

      const notFilteredTagIds = this.lastUsedTagIds.filter(
        (tagId) => !(tagId in this.filteredTagsMap),
      );

      return Object.fromEntries(notFilteredTagIds.map((tagId) => [tagId, true]));
    },

    notFilteredUnselectedTagIdsMap () {
      if (!this.isFiltering) { return {} }

      const notFilteredTagIds = this.unselectedTagIds.filter(
        (tagId) => !(tagId in this.filteredTagsMap),
      );

      return Object.fromEntries(notFilteredTagIds.map((tagId) => [tagId, true]));
    },

    nbTagsMap () {
      const nbTagsMap = {};
      const tagIds = [].concat(this.selectedTagIds, this.unselectedTagIds);

      Object.keys(this.categoriesMap).forEach((catId) => {
        nbTagsMap[catId] = tagIds
          .filter((tagId) => this.tagsMap[tagId].category === catId)
          .length;
      });

      nbTagsMap['0'] = tagIds
        .filter((tagId) => this.tagsMap[tagId].category === '0')
        .length;

      return nbTagsMap;
    },

    notFilteredCategoryIdsMap () {
      if (!this.filters.text) { return {} }

      const NONE_CATEGORY = {
        id: '0',
        name: 'None',
        color: 'FFFFFF',
      };

      const categoriesMap = deepClone(this.categoriesMap);
      categoriesMap[NONE_CATEGORY.id] = NONE_CATEGORY;

      const categories = Object.values(categoriesMap);

      const matchedCategoryIdsMap = Object.fromEntries(
        this.applyTextFilter(categories)
          .filter((r) => r.score < 0.5)
          .map((r) => [r.item.id, true]),
      );

      const notFilteredCategory = Object.keys(categoriesMap)
        .filter((catId) => !matchedCategoryIdsMap[catId]);

      return Object.fromEntries(
        notFilteredCategory.map((catId) => [catId, true]),
      );
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

    noLastUsedTagsText () {
      return this.isFiltering
        ? 'No tags results'
        : 'No last used tags';
    },

    noUnselectedTagsText () { return this.isFiltering ? 'No tags results' : '' },
  },

  watch: {
    unselectedTagIds () {
      if (!this.focused.id) {
        this.resetFocus();
      }
    },

    isFiltering () {
      this.resetFocus();
    },
  },

  mounted () {
    // TODO: TEMP: only for testing purpose
    setTimeout(() => { if (this.isLoading) { this.onShow() } }, 2000);
    this.$emit('mounted');
  },

  methods: {
    async onShow () {
      this.attachKeyboardShortcuts();
      this.resetFilters();

      try {
        await this.fetchTagsAndCategories();
        this.onFetchTags();
        this.resetFocus();
      } catch (e) {
        // TODO: ENH: show error alert.
        console.error(e);
      }

      this.isLoading = false;
    },

    onFetchTags () { this.updateSelectedTagIdsMap() },

    onHide () { this.removeKeyboardShortcuts() },

    onSelectCategory (catId) {
      this.$set(this.selectedCategoryIdsMap, catId, true);
      this.$set(this.filters.categories, catId, true);
    },

    onUnselectCategory (catId) {
      this.$delete(this.selectedCategoryIdsMap, catId);
      this.$delete(this.filters.categories, catId);
    },

    onTagClick (tagId) {
      if (this.selectedTagIdsMap[tagId]) {
        this.$delete(this.selectedTagIdsMap, tagId);
        this.$emit('unselect', tagId);
      } else {
        this.$set(this.selectedTagIdsMap, tagId, true);
        this.$emit('select', tagId);

        this.addLastUsedTagId(tagId);
      }

      // TODO: ENH: if focused tag, move/update focused position.
      // TODO: ENH: on select last tag from a section, set focus on upper section.
      if (this.focused.pos === this.unselectedTagIds.length) {
        this.focused.pos -= 2;
      } else {
        this.focused.pos -= 1;
      }

      this.setFocusRight();
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

      if (randomdTagId) { this.onTagClick(randomdTagId) }

      this.setFilterTextFocus();
    },

    addLastUsedTagId (tagId) {
      this.$store.commit(`${this.NS}/${TAGGER_M_ADD_LAST_USED_TAG_ID}`, tagId);
    },

    applyCategoriesFilter (tags) {
      return tags.filter((tag) => !!this.filters.categories[tag.category]);
    },

    applyTextFilter (array, keys = ['name']) {
      const options = {
        includeScore: true,
        includeMatches: true,
        keys,
      };

      const fuse = new Fuse(array, options);
      return fuse.search(this.filters.text);
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

    resetFocus () {
      const sectionName = this.focused.section;
      const sectionTagIds = this.getTagIdsFromSectionName(sectionName);
      [this.focused.id] = sectionTagIds;
      this.focused.pos = 0;
    },

    resetFilters () {
      this.$set(this, 'filters', deepClone(DEFAULT_FILTERS));
    },

    checkSectionName (name) {
      this.$set(this.shake, name, true);
      setTimeout(() => {
        this.$set(this.shake, name, false);
      }, SHAKE_ANIMATION_TIME);
    },

    getTagIdsFromSectionName (name) {
      let tagsIds = [];
      if (name === UNSELECTED_FOCUSED_SECTION_NAME) {
        tagsIds = this.unselectedTagIds;
      } else if (name === SELECTED_FOCUSED_SECTION_NAME) {
        tagsIds = this.selectedTagIds;
      } else if (name === LAST_USED_FOCUSED_SECTION_NAME) {
        tagsIds = this.lastUsedTagIds;
      }
      return tagsIds;
    },

    getUpperSectionFrom (name) {
      let upperSectionName = '';
      let sectionTagIds;
      let index = 0;
      const { sectionsNames } = this;
      const indexSectionFrom = sectionsNames.indexOf(name);

      for (let i = 1; i <= sectionsNames.length; i += 1) {
        index = indexSectionFrom - i;
        if (index < 0) {
          index = sectionsNames.length + indexSectionFrom - i;
        }
        upperSectionName = sectionsNames[index];
        sectionTagIds = this.getTagIdsFromSectionName(upperSectionName);
        if (sectionTagIds.length) { break }
      }

      return upperSectionName;
    },

    getDownerSectionFrom (name) {
      let downerSectionName = '';
      let sectionTagIds;
      let index = 0;
      const { sectionsNames } = this;
      const indexSectionFrom = sectionsNames.indexOf(name);

      for (let i = 1; i <= sectionsNames.length; i += 1) {
        index = indexSectionFrom + i;
        if (index >= sectionsNames.length) {
          index = indexSectionFrom + i - sectionsNames.length;
        }
        downerSectionName = sectionsNames[index];
        sectionTagIds = this.getTagIdsFromSectionName(downerSectionName);
        if (sectionTagIds.length) { break }
      }

      return downerSectionName;
    },

    setFocusRight () {
      const sectionName = this.focused.section;
      const sectionTagIds = this.getTagIdsFromSectionName(sectionName);

      this.focused.pos += 1;
      if (this.focused.pos >= sectionTagIds.length) {
        this.focused.pos = 0;
      }
      this.focused.id = sectionTagIds[this.focused.pos];
    },

    setFocusLeft () {
      const sectionName = this.focused.section;
      const sectionTagIds = this.getTagIdsFromSectionName(sectionName);

      this.focused.pos -= 1;
      if (this.focused.pos < 0) {
        this.focused.pos = sectionTagIds.length - 1;
      }
      this.focused.id = sectionTagIds[this.focused.pos];
    },

    setFocusUp () {
      const sectionName = this.focused.section;
      let upperSectionName = this.getUpperSectionFrom(sectionName);

      if (!upperSectionName) {
        upperSectionName = UNSELECTED_FOCUSED_SECTION_NAME;
      }

      if (sectionName !== upperSectionName) {
        this.focused.section = upperSectionName;
        this.resetFocus();
      } else {
        this.checkSectionName(sectionName);
      }
    },

    setFocusDown () {
      const sectionName = this.focused.section;
      let downerSectionName = this.getDownerSectionFrom(sectionName);

      if (!downerSectionName) {
        downerSectionName = UNSELECTED_FOCUSED_SECTION_NAME;
      }

      if (sectionName !== downerSectionName) {
        this.focused.section = downerSectionName;
        this.resetFocus();
      } else {
        this.checkSectionName(sectionName);
      }
    },

    attachKeyboardShortcuts () {
      this.keyboardShortcuts.main = (e) => {
        let preventDefault = false;
        const stopPropagation = false;
        const key = getKey(e);

        if (e.shiftKey && key !== 'Shift') {
          switch (key) {
            case 'Enter':
              this.onTagClick(this.focused.id);
              break;

            default:
          }
        } else if (e.altKey && key !== 'Alt') {
          switch (key) {
            // On windows, Meta + Enter does not trigger a keydown event,
            // So, set Alt + Enter to validate.
            case 'Enter':
              this.$emit('save');
              preventDefault = true;
              break;

            default:
          }
        } else if (e.metaKey && key !== 'Meta') {
          // On windows, Alt + Escape does not trigger a keydown event,
          // So, set Meta + Escape to cancel.
          switch (key) {
            case 'Escape':
              this.$emit('cancel');
              preventDefault = true;
              break;

            default:
          }
        } else {
          switch (key) {
            case 'ArrowRight':
              this.setFocusRight();
              break;

            case 'ArrowLeft':
              this.setFocusLeft();
              break;

            case 'ArrowUp':
              this.setFocusUp();
              preventDefault = true;
              break;

            case 'ArrowDown':
              this.setFocusDown();
              preventDefault = true;
              break;

            case 'Control':
              this.$emit('toggleOpacity');
              preventDefault = true;
              break;

            case 'Enter':
              this.onTagClick(this.focused.id);
              this.clearFilterText();
              break;

            case 'Escape':
              this.clearFilterText();
              break;

            default:
              // Start filtering only if the pressed key is a letter.
              // Do not focus if pressed key is a control one.
              if (!this.isFilterTextHasFocus && key.length === 1) {
                this.setFilterTextFocus();
                this.filters.text += key;
              }
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
.tagger {
  padding: 4px 12px;
  display: flex;
  flex-direction: column;

  .selected-tags {
    flex-shrink: 0;
    overflow: auto;
    min-height: $tag-height;
    max-height: 40%;
    @include w-scrollbar;
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
      opacity: 0.5;
    }
  }

  .categories-list {
    display: flex;
  }

  .unselected-tags {
    overflow: auto;
    @include w-scrollbar;
  }

  .separator {
    margin: 8px 0;
  }

  .shake {
    @include shake-animation;
  }
}
</style>
