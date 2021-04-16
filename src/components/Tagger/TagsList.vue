<template>
  <div class="tags-list">
    <TagChip
      v-for="(tag) in filteredTags"
      :key="tag.id"
      :tag="tag"
      @onClick="onSelect"
    />
  </div>
</template>

<script>
import TagChip from '../TagChip.vue';
import { isEmptyObj } from '../../utils/utils';

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
      type: Array,
      default: () => ([]),
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
    filteredTags () {
      const hasCategoriesFilter = !isEmptyObj(this.categoriesFilter);
      const hasTextFilter = !!this.textFilter;

      if (!hasCategoriesFilter && !hasTextFilter) {
        return this.tags;
      }

      return this.tags.filter((tag) => {
        let matchCategoriesFilter = true;
        let matchTextFilter = true;

        if (hasCategoriesFilter) {
          matchCategoriesFilter = !!this.categoriesFilter[tag.category];
        }

        if (hasTextFilter) {
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
    onShow () {},

    onHide () {},

    onSelect (tagId) {
      this.$emit('onSelect', tagId);
    },

    getColor (isSelected) {
      return isSelected ? 'orange' : undefined;
    },
  },

  beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
.tags-list {
  display: flex;
  flex-wrap: wrap;
}
</style>
