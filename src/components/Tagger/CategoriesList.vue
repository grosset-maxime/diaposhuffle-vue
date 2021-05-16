<template>
  <div
    :class="['categories-list', {
      'edit-mode': editMode
    }]"
  >
    <v-btn
      v-if="editMode"
      class="add-category-btn"
      icon
      outlined
      tile
      left
      color="orange"
      @click="$emit('addCategory')"
    >
      <v-icon>
        mdi-plus
      </v-icon>
    </v-btn>

    <CategoryChip
      v-for="catId in categoryIds"
      :key="`cat-${catId}`"
      :category-id="catId"
      :selected="selectedIds[catId]"
      :nb-tags="nbTags[catId]"
      :masked="!!masked[catId]"
      :edit="editMode"
      @click="onCategoryClick"
      @click:edit="$emit('editCategory', catId);"
    />

    <CategoryChip
      key="cat-0"
      category-id="0"
      :selected="selectedIds['0']"
      :nb-tags="nbTags['0']"
      :masked="!!masked['0']"
      @click="onCategoryClick"
    />
  </div>
</template>

<script>
import CategoryChip from './CategoryChip.vue';

export default {
  name: 'CategoriesList',

  components: {
    CategoryChip,
  },

  props: {
    categoryIds: {
      type: Array,
      default: () => ([]),
    },

    selectedIds: {
      type: Object,
      default: () => ({}),
    },

    nbTags: {
      type: Object,
      default: () => ({}),
    },

    masked: {
      type: Object,
      default: () => ({}),
    },

    editMode: {
      type: Boolean,
      default: false,
    },
  },

  emits: {
    select: null,
    unselect: null,
    addCategory: null,
    editCategory: null,
  },

  data: () => ({}),

  mounted () {},

  methods: {
    onCategoryClick (catId) {
      this.$emit(this.selectedIds[catId] ? 'unselect' : 'select', catId);
    },
  },
};
</script>

<style lang="scss" scoped>
.categories-list {
  display: flex;
  flex-wrap: wrap;

  .add-category-btn {
    width: $category-height;
    height: $category-height;
    margin: $category-margin;
  }
}
</style>
