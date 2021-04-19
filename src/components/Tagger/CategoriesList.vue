<template>
  <div class="categories-list">
    <categoryChip
      v-for="(cat) in categories"
      :key="`cat-${cat.id}`"
      :category="cat"
      :selected="selected[cat.id]"
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
    categories: {
      type: Array,
      default: () => ([]),
    },

    selected: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: {
    onSelect: null,
    onUnselect: null,
  },

  data: () => ({}),

  computed: {},

  watch: {},

  mounted () {},

  methods: {
    onCategoryClick (catId) {
      if (!this.selected[catId]) {
        this.$emit('onSelect', catId);
      } else {
        this.$emit('onUnselect', catId);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.categories-list {
  display: flex;
  flex-wrap: wrap;
}
</style>
