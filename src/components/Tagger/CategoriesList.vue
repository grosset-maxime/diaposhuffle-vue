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
      v-for="(cat) in categories"
      :key="`cat-${cat.id}`"
      :category="cat"
      :selected="selected[cat.id]"
      :edit="editMode"
      @click="onCategoryClick"
      @click:edit="onCategoryEditClick"
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
    categories: {
      type: Array,
      default: () => ([]),
    },

    selected: {
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

  computed: {},

  watch: {},

  mounted () {},

  methods: {
    onCategoryClick (catId) {
      if (!this.selected[catId]) {
        this.$emit('select', catId);
      } else {
        this.$emit('unselect', catId);
      }
    },

    onCategoryEditClick (catId) {
      this.$emit('editCategory', catId);
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
