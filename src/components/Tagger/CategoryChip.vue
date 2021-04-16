<template>
  <v-chip
    class="category-chip"
    :class="['category', {
      selected: isSelected
    }]"
    :style="styles"
    @click="onClick"
  >
    <span>
      {{ category.name }}
    </span>
  </v-chip>
</template>

<script>
import { TAGGER_G_CATEGORY_COLOR } from '../../store/types';

export default {
  name: 'CategoryChip',

  props: {
    category: {
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

    isSelected () { return this.category.selected },

    categoryColor () {
      return this.$store.getters[
        `${this.NS}/${TAGGER_G_CATEGORY_COLOR}`
      ](this.category.id);
    },

    chipColor () {
      return this.isSelected
        ? `#${this.categoryColor}FF`
        : `#${this.categoryColor}FF`;
    },

    chipBgColor () {
      return this.isSelected
        ? `#${this.categoryColor}AA`
        : `#${this.categoryColor}20`;
    },

    chipBoxShadow () {
      let boxShadow;

      if (this.isSelected) {
        boxShadow = `0 0 7px 0 ${this.chipColor}`;
      }

      return boxShadow;
    },

    chipFontWeight () {
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
        'background-color': this.chipBgColor,
        'border-color': this.chipColor,
        'box-shadow': this.chipBoxShadow,
        'font-weight': this.chipFontWeight,
      };
    },

    onClick () {
      this.$set(this.category, 'selected', !this.isSelected);
      this.setStyles();
      this.$emit('onClick', this.category.id);
    },
  },
};
</script>

<style lang="scss" scoped>
.category-chip {
  position: relative;
  display: flex;
  cursor: pointer;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #ffffff;
  padding: 0 12px;
  margin: 0 8px 10px 0;
  line-height: 32px;
  user-select: none;

  &.selected {
  }
}
</style>
