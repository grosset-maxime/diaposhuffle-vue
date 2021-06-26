<template>
  <div
    :class="['tags-list', {
      'no-tags': !hasTags
    }]"
    @click="$emit('click')"
  >
    <template v-if="hasTags">
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="tag"
        :style="getTagStyles(tag.id)"
      >
        {{ tag.name }}
      </div>
    </template>

    <div v-if="!hasTags">
      No tags
    </div>
  </div>
</template>

<script>
import {
  TAGGER_G_TAGS,
  TAGGER_G_TAGS_LIST,
  TAGGER_G_CATEGORY_COLOR,
} from '../../store/types';

export default {
  name: 'TagsList',

  props: {
    tagsIds: {
      type: Array,
      default: () => ([]),
    },
  },

  emits: {
    click: null,
  },

  data: () => ({
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
  }),

  computed: {
    NS () { return 'player' },

    TAGGER_NS () { return 'tagger' },

    tagsIdsMap () {
      return Object.fromEntries(this.tagsIds.map((id) => [id, true]));
    },

    tagsMap () { return this.$store.getters[`${this.TAGGER_NS}/${TAGGER_G_TAGS}`] },

    tagsList () { return this.$store.getters[`${this.TAGGER_NS}/${TAGGER_G_TAGS_LIST}`] },

    tags () {
      return this.tagsList
        .filter((tag) => this.tagsIdsMap[tag.id])
        .sort(
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

    hasTags () { return !!this.tags.length },
  },

  methods: {
    getTagStyles (tagId) {
      const tagCategory = this.tagsMap[tagId].category;
      const hasNoCategory = !tagCategory || tagCategory === '0';

      return {
        'border-color': this.getTagCategoryColor(tagId),
        'border-style': hasNoCategory ? 'dashed' : 'solid',
      };
    },

    getTagCategoryColor (tagId) {
      const categoryColor = this.$store.getters[
        `${this.TAGGER_NS}/${TAGGER_G_CATEGORY_COLOR}`
      ](this.tagsMap[tagId].category);

      return `#${categoryColor || 'FFF'}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.tags-list {
  max-height: calc(100vh - 160px);
  overflow: auto;
  background-color: #{$grey-7 + 'DA'};
  font-size: small;
  padding: 5px;
  border-radius: 5px;

  &.no-tags {
    border: 2px solid red;
  }

  .tag {
    border-width: 0;
    border-left: 3px solid #333;
    padding: 5px;
    margin: 8px 4px;
  }
}
</style>
