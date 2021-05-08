<template>
  <div
    :class="['tags-list', {
      'edit-mode': editMode
    }]"
  >
    <v-btn
      v-if="editMode"
      class="add-tag-btn"
      icon
      outlined
      left
      color="orange"
      @click="$emit('addTag')"
    >
      <v-icon>
        mdi-plus
      </v-icon>
    </v-btn>

    <TagChip
      v-for="(tag) in filteredTags"
      :key="`tag-${tag.id}`"
      :tag="tag"
      :selected="selected[tag.id]"
      :edit="editMode"
      :close="closableTags"
      clickable
      @click="onTagClick"
      @click:close="$emit('closeTag', tag.id)"
      @click:edit="onTagEditClick"
    />

    <div
      v-if="hasNoResults"
      class="no-results"
    >
      No matching tags.
    </div>

    <div
      v-if="!hasTags"
      class="no-tags"
    >
      {{ noTagsText }}
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

    closableTags: {
      type: Boolean,
      default: false,
    },

    noTagsText: {
      type: String,
      default: 'No tags',
    },

    editMode: {
      type: Boolean,
      default: false,
    },
  },

  emits: {
    select: null,
    unselect: null,
    closeTag: null,
    editTag: null,
    addTag: null,
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

    onTagEditClick (tagId) {
      this.$emit('editTag', tagId);
    },
  },

  beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
.tags-list {
  display: flex;
  flex-wrap: wrap;

  .add-tag-btn {
    width: $tag-height;
    height: $tag-height;
    margin: $tag-margin;
    z-index: 2;
  }

  .no-results,
  .no-tags {
    position: absolute;
    text-align: center;
    padding: 8px;
    color: $grey-6;
    width: 100%;
    z-index: 1;
  }
}
</style>
