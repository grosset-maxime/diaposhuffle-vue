<template>
  <div
    class="category-chip"
    :class="['category', {
      selected,
      clickable: true
    }]"
    :style="{
      'background-color': chipBgColor,
      'border-color': chipColor,
      'box-shadow': chipBoxShadow,
    }"
    @click="$emit('click', categoryId)"
  >
    <span class="category-content">
      {{ category.name }}

      <div class="nb-tags">
        {{ nbTags }}
      </div>

      <v-btn
        v-if="edit"
        icon
        x-small
        class="edit-btn"
      >
        <v-icon
          class="edit-icon"
          @click.stop="$emit('click:edit', categoryId)"
        >
          mdi-pencil
        </v-icon>
      </v-btn>
    </span>
  </div>
</template>

<script>
import { TAGGER_G_CATEGORY, TAGGER_G_CATEGORY_COLOR } from '../../store/types';

export default {
  name: 'CategoryChip',

  props: {
    categoryId: {
      type: String,
      default: '',
    },

    selected: {
      type: Boolean,
      default: false,
    },

    nbTags: {
      type: Number,
      default: 0,
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

  data: () => ({}),

  computed: {
    NS () { return 'tagger' },

    category () {
      return this.$store.getters[
        `${this.NS}/${TAGGER_G_CATEGORY}`
      ](this.categoryId);
    },

    categoryColor () {
      return this.$store.getters[
        `${this.NS}/${TAGGER_G_CATEGORY_COLOR}`
      ](this.categoryId);
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
};
</script>

<style lang="scss" scoped>
.category-chip {
  position: relative;
  display: inline-flex;
  height: $category-height;
  border-radius: 4px;
  border: 1px solid #ffffff;
  padding: 0 6px;
  margin: $category-margin;
  user-select: none;

  .category-content {
    height: 100%;
    display: inline-flex;
    align-items: center;

    .nb-tags {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: $grey-1;
      color: $grey-8;
      opacity: 0.5;
      border-radius: 50px;
      font-size: x-small;
      font-weight: bold;
      padding: 0 3px;
      margin-left: 7px;
      min-width: 15px;
    }

    .edit-btn {
      margin-left: 4px;
      margin-right: -4px;
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

  &.selected {
    text-shadow: 0 0 1px #ffffff;
  }
}
</style>
