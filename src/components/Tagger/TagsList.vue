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
      v-if="!tags.length && false"
      class="no-tags"
    >
      No tags.
    </div>
  </div>
</template>

<script>
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
  },

  emits: {
    onSelect: null,
    onUnselect: null,
  },

  data: () => ({}),

  computed: {
    isFiltering () {
      return this.hasCategoriesFilter || this.hasTextFilter;
    },

    hasCategoriesFilter () {
      return !isEmptyObj(this.categoriesFilter);
    },

    hasTextFilter () {
      return !!this.textFilter;
    },

    hasNoResults () {
      return this.isFiltering && this.filteredTags.length === 0;
    },

    filteredTags () {
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
  },

  watch: {},

  mounted () {},

  methods: {
    onTagClick (tagId) {
      if (this.selected[tagId]) {
        this.$delete(this.selected, tagId);
        this.$emit('onUnselect', tagId);
      } else {
        this.$set(this.selected, tagId, true);
        this.$emit('onSelect', tagId);
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

  .no-results {
    text-align: center;
    padding: 4px;
    color: $grey-6;
    width: 100%;
  }
}
</style>
