<template>
  <div
    class="tag-chip"
    :class="['tag', {
      selected,
      clickable,
      'has-no-category': !hasCategory
    }]"
    :style="{
      'background-color': tagBgColor,
      'border-color': tagColor,
      'box-shadow': tagBoxShadow,
    }"
    @click="$emit('click', tagId)"
  >
    <span class="tag-content">
      {{ tag.name }}

      <v-btn
        v-if="edit"
        icon
        x-small
        class="edit-btn"
      >
        <v-icon
          @click.stop="$emit('click:edit', tagId)"
          class="edit-icon"
        >
          mdi-pencil
        </v-icon>
      </v-btn>

      <v-btn
        v-if="close"
        icon
        x-small
        class="close-btn"
      >
        <v-icon
          @click.stop="$emit('click:close', tagId)"
          class="close-icon"
        >
          mdi-close-circle
        </v-icon>
      </v-btn>
    </span>
  </div>
</template>

<script>
import {
  TAGGER_G_TAG,
  TAGGER_G_CATEGORY,
  TAGGER_G_CATEGORY_COLOR,
} from '../store/types';

export default {
  name: 'TagChip',

  props: {
    tagId: {
      type: String,
      default: '',
    },

    selected: {
      type: Boolean,
      default: false,
    },

    clickable: {
      type: Boolean,
      default: false,
    },

    close: {
      type: Boolean,
      default: false,
    },

    edit: {
      type: Boolean,
      default: false,
    },
  },

  emits: {
    click: null,
    'click:close': null,
    'click:edit': null,
  },

  data: () => ({}),

  computed: {
    NS () { return 'tagger' },

    tag () { return this.$store.getters[`${this.NS}/${TAGGER_G_TAG}`](this.tagId) },

    categoryId () { return this.tag.category },

    hasCategory () {
      return this.$store.getters[
        `${this.NS}/${TAGGER_G_CATEGORY}`
      ](this.categoryId);
    },

    categoryColor () {
      return this.$store.getters[
        `${this.NS}/${TAGGER_G_CATEGORY_COLOR}`
      ](this.categoryId);
    },

    tagColor () {
      let color;

      if (this.hasCategory) {
        color = this.selected
          ? `#${this.categoryColor}FF`
          : `#${this.categoryColor}FF`;
      }

      return color;
    },

    tagBgColor () {
      let color;

      if (this.hasCategory) {
        color = this.selected
          ? `#${this.categoryColor}AA`
          : `#${this.categoryColor}20`;
      } else if (this.tag.selected) {
        color = '#FFFFFF80';
      }

      return color;
    },

    tagBoxShadow () {
      let boxShadow;

      if (this.selected) {
        if (this.hasCategory) {
          boxShadow = `0 0 7px 0 ${this.tagColor}`;
        } else {
          boxShadow = '0 0 7px 0 #FFFFFF';
        }
      }

      return boxShadow;
    },
  },
};
</script>

<style lang="scss" scoped>
.tag-chip {
  position: relative;
  display: inline-flex;
  height: $tag-height;
  border-radius: 16px;
  border: 1px solid #ffffff;
  padding: 0 12px;
  margin: $tag-margin;
  user-select: none;

  .tag-content {
    height: 100%;
    display: inline-flex;
    align-items: center;

    .close-btn,
    .edit-btn {
      margin-left: 6px;
      margin-right: -4px;
    }

    .close-btn {
      .close-icon:hover {
        opacity: 0.72;
      }
    }

    .edit-btn {
      color: $grey-6;

      &:hover {
        color: white;
      }

      .edit-icon {
        font-size: 14px;
      }
    }
  }

  &.clickable {
    cursor: pointer;
  }

  &.has-no-category {
    border-style: dashed;
  }

  &.selected {
    text-shadow: 0 0 1px #ffffff;
  }
}
</style>
