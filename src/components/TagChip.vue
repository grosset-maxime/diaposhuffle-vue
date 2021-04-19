<template>
  <div
    class="tag-chip"
    :class="['tag', {
      selected,
      clickable,
      'has-no-category': !hasCategory
    }]"
    :style="styles"
    @click="click"
  >
    <span class="tag-content">
      {{ tag.name }}

      <v-btn
        v-if="close"
        icon
        x-small
        class="close-btn"
      >
        <v-icon
          @click="$emit('click:close', tag.id)"
          class="close-icon"
        >
          mdi-close-circle
        </v-icon>
      </v-btn>

      <v-btn
        v-if="edit"
        icon
        x-small
        class="edit-btn"
      >
        <v-icon
          @click="$emit('click:edit', tag.id)"
          class="edit-icon"
        >
          mdi-pencil
        </v-icon>
      </v-btn>
    </span>
  </div>
</template>

<script>
import {
  TAGGER_G_CATEGORY,
  TAGGER_G_CATEGORY_COLOR,
} from '../store/types';

export default {
  name: 'TagChip',

  props: {
    tag: {
      type: Object,
      default: () => ({}),
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

  data: () => ({
    styles: {},
  }),

  computed: {
    NS () { return 'tagger' },

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

  watch: {
    selected () { this.setStyles() },
  },

  mounted () {
    this.setStyles();
  },

  methods: {
    setStyles () {
      this.styles = {
        'background-color': this.tagBgColor,
        'border-color': this.tagColor,
        'box-shadow': this.tagBoxShadow,
      };
    },

    click () { this.$emit('click', this.tag.id) },
  },
};
</script>

<style lang="scss" scoped>
.tag-chip {
  position: relative;
  display: inline-flex;
  height: 32px;
  border-radius: 16px;
  border: 1px solid #ffffff;
  padding: 0 12px;
  margin: 5px 8px 5px 0;
  user-select: none;

  .tag-content {
    height: 100%;
    display: inline-flex;
    align-items: center;

    .close-btn,
    .edit-btn {
      margin-left: 6px;
      margin-right: -4px;

      .close-icon:hover,
      .edit-icon:hover {
        opacity: 0.72;
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
