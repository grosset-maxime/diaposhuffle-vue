<template>
  <div
    class="category-chip"
    :class="['category', {
      selected,
      clickable: true
    }]"
    :style="styles"
    @click="onClick"
  >
    <span class="category-content">
      {{ category.name }}

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
import { TAGGER_G_CATEGORY_COLOR } from '../../store/types';

export default {
  name: 'CategoryChip',

  props: {
    category: {
      type: Object,
      default: () => ({}),
    },

    selected: {
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
    'click:edit': null,
  },

  data: () => ({
    styles: {},
  }),

  computed: {
    NS () { return 'tagger' },

    categoryColor () {
      return this.$store.getters[
        `${this.NS}/${TAGGER_G_CATEGORY_COLOR}`
      ](this.category.id);
    },

    chipColor () {
      return this.selected
        ? `#${this.categoryColor}FF`
        : `#${this.categoryColor}FF`;
    },

    chipBgColor () {
      return this.selected
        ? `#${this.categoryColor}AA`
        : `#${this.categoryColor}20`;
    },

    chipBoxShadow () {
      let boxShadow;

      if (this.selected) {
        boxShadow = `0 0 7px 0 ${this.chipColor}`;
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
        'background-color': this.chipBgColor,
        'border-color': this.chipColor,
        'box-shadow': this.chipBoxShadow,
      };
    },

    onClick () {
      this.$emit('click', this.category.id);
    },
  },
};
</script>

<style lang="scss" scoped>
.category-chip {
  position: relative;
  display: inline-flex;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #ffffff;
  padding: 0 12px;
  margin: 5px 8px 5px 0;
  user-select: none;

  .category-content {
    height: 100%;
    display: inline-flex;
    align-items: center;

    .edit-btn {
      margin-left: 6px;
      margin-right: -4px;

      .edit-icon:hover {
        opacity: 0.72;
      }
    }
  }

  &.clickable {
    cursor: pointer;
  }

  &.selected {
    text-shadow: 0 0 1px #ffffff;
  }
}
</style>
