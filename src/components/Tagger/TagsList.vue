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
      v-for="(tagId) in tagIds"
      :key="`tag-${tagId}`"
      :tag-id="tagId"
      :selected="selectedIds[tagId]"
      :edit="editMode"
      :close="closableTags"
      clickable
      @click="onTagClick"
      @click:close="$emit('closeTag', tagId)"
      @click:edit="$emit('editTag', tagId);"
    />

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
import { getRandomElement } from '../../utils/utils';

export default {
  name: 'TagsList',

  components: {
    TagChip,
  },

  props: {
    tagIds: {
      type: Array,
      default: () => ([]),
    },

    selectedIds: {
      type: Object,
      default: () => ({}),
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
    hasTags () { return this.tagIds.length > 0 },

    // TODO: move this method to Tagger.vue
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
      this.$emit(this.selectedIds[tagId] ? 'unselect' : 'select', tagId);
    },

    selectRandom () {
      const randomdTagId = getRandomElement(this.tagIds);
      if (randomdTagId) { this.onTagClick(randomdTagId) }
    },

    onTagEditClick (tagId) { this.$emit('editTag', tagId) },
  },
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
