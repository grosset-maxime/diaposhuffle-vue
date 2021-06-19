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
      v-for="tagId in tagIds"
      :key="`tag-${tagId}`"
      :tag-id="tagId"
      :focused="focused.id === tagId"
      :masked="!!masked[tagId]"
      :edit="editMode"
      :close="closableTags"
      clickable
      @click="$emit('clickTag', tagId)"
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
import TagChip from '../TagChip.vue';

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

    focused: {
      type: Object,
      default: () => ({}),
    },

    masked: {
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
    clickTag: null,
    closeTag: null,
    editTag: null,
    addTag: null,
  },

  data: () => ({}),

  computed: {
    hasTags () { return this.tagIds.length > 0 },
  },
};
</script>

<style lang="scss" scoped>
.tags-list {
  display: flex;
  flex-wrap: wrap;
  height: 100%;

  .add-tag-btn {
    width: $tag-height;
    height: $tag-height;
    margin: $tag-margin;
    z-index: 2;
  }

  .no-tags {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $grey-6;
    width: 100%;
    z-index: 1;
  }
}
</style>
