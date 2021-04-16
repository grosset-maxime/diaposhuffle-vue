<template>
  <div
    class="tag-chip"
    :class="['tag', {
      selected: isSelected,
      'has-no-category': !hasCategory
    }]"
    :style="styles"
    @click="onClick"
  >
    <span>
      {{ tag.name }}
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
  },

  emits: {
    onClick: null,
  },

  data: () => ({
    styles: {},
  }),

  computed: {
    NS () { return 'tagger' },

    isSelected () { return this.tag.selected },

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
        color = this.isSelected
          ? `#${this.categoryColor}FF`
          : `#${this.categoryColor}FF`;
      }
      return color;
    },

    tagBgColor () {
      let color;
      if (this.hasCategory) {
        color = this.isSelected
          ? `#${this.categoryColor}AA`
          : `#${this.categoryColor}20`;
      } else if (this.tag.selected) {
        color = '#FFFFFF80';
      }
      return color;
    },

    tagBoxShadow () {
      let boxShadow;

      if (this.isSelected) {
        if (this.hasCategory) {
          boxShadow = `0 0 7px 0 ${this.tagColor}`;
        } else {
          boxShadow = '0 0 7px 0 #FFFFFF';
        }
      }

      return boxShadow;
    },

    tagFontWeight () {
      let weight;

      if (this.isSelected) {
        weight = 'bold';
      }

      return weight;
    },
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
        'font-weight': this.tagFontWeight,
      };
    },

    onClick () {
      this.$set(this.tag, 'selected', !this.isSelected);
      this.setStyles();
      this.$emit('onClick', this.tag.id);
    },
  },
};
</script>

<style lang="scss" scoped>
.tag-chip {
  position: relative;
  display: flex;
  cursor: pointer;
  height: 32px;
  border-radius: 16px;
  border: 1px solid #ffffff;
  padding: 0 12px;
  margin: 0 8px 10px 0;
  line-height: 32px;
  user-select: none;

  &.has-no-category {
    border-style: dashed;
  }

  &.selected {
  }
}
</style>
