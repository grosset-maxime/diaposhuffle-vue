<template>
  <div class="tags-list">
    <TagChip
      v-for="(tag) in filteredTags"
      :key="`tag-${tag.id}`"
      :tag="tag"
      :selected="selected[tag.id]"
      clickable
      @click="onTagClick"
    />

    <div
      v-if="hasNoResults"
      class="no-results"
    >
      No matching tags.
    </div>

    <div
      v-if="showNoTags && !hasTags"
      class="no-tags"
    >
      No tags.
    </div>
  </div>
</template>

<script>
import Fuse from 'fuse.js';
import TagChip from '../TagChip.vue';
import { isEmptyObj, getRandomElement } from '../../utils/utils';

export default {
  name: 'TagsList',

  components: {
    TagChip,
  },

  props: {
    tags: {
      type: Array,
      default: () => ([]),
    },

    selected: {
      type: Object,
      default: () => ({}),
    },

    categoriesFilter: {
      type: Object,
      default: undefined,
    },

    textFilter: {
      type: String,
      default: '',
    },

    showNoTags: {
      type: Boolean,
      default: false,
    },
  },

  emits: {
    select: null,
    unselect: null,
  },

  data: () => ({}),

  computed: {
    isFiltering () {
      return this.hasCategoriesFilter || this.hasTextFilter;
    },

    hasCategoriesFilter () { return !isEmptyObj(this.categoriesFilter) },

    hasTextFilter () { return !!this.textFilter },

    hasTags () { return this.tags.length > 0 },

    hasNoResults () {
      return this.hasTags && this.isFiltering && this.filteredTags.length === 0;
    },

    filteredTagsORG () {
      if (!this.isFiltering) { return this.tags }

      return this.tags.filter((tag) => {
        let matchCategoriesFilter = true;
        let matchTextFilter = true;

        if (this.hasCategoriesFilter) {
          matchCategoriesFilter = !!this.categoriesFilter[tag.category];
        }

        if (this.hasTextFilter) {
          matchTextFilter = tag.name.toLowerCase().includes(
            this.textFilter.toLowerCase(),
          );
        }

        return matchCategoriesFilter
          && matchTextFilter;
      });
    },

    filteredTags () {
      if (!this.isFiltering) { return this.tags }

      let filteredTags = this.tags;

      if (this.hasCategoriesFilter) {
        filteredTags = filteredTags.filter((tag) => !!this.categoriesFilter[tag.category]);
      }

      if (this.hasTextFilter) {
        const options = {
          includeScore: true,
          includeMatches: true,
          keys: ['name'],
        };

        const fuse = new Fuse(filteredTags, options);
        filteredTags = fuse.search(this.textFilter).map((r) => r.item);
      }

      return filteredTags;
    },
  },

  watch: {},

  mounted () {},

  methods: {
    onTagClick (tagId) {
      if (this.selected[tagId]) {
        this.$emit('unselect', tagId);
      } else {
        this.$emit('select', tagId);
      }
    },

    getColor (isSelected) {
      return isSelected ? 'orange' : undefined;
    },

    selectRandom () {
      const randomdTag = getRandomElement(
        this.filteredTags.filter((tag) => !this.selected[tag.id]),
      );

      if (randomdTag) {
        this.onTagClick(randomdTag.id);
      }
    },
  },

  beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
.tags-list {
  display: flex;
  flex-wrap: wrap;

  .no-results,
  .no-tags {
    text-align: center;
    padding: 4px;
    color: $grey-6;
    width: 100%;
  }
}
</style>
