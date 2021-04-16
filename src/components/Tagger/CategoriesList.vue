<template>
  <div class="categories-list">
    <categoryChip
      v-for="(cat) in categories"
      :key="`${cat.id}-${Date.now()}`"
      :category="cat"
      @onClick="onClick"
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
  },

  emits: {
    onSelect: null,
    onUnselect: null,
  },

  data: () => ({
    selected: {},
  }),

  computed: {},

  watch: {},

  mounted () {},

  methods: {
    onShow () {},

    onHide () {},

    onClick (catId) {
      this.$set(this.selected, catId, !this.selected[catId]);

      if (this.selected[catId]) {
        this.$emit('onSelect', catId);
      } else {
        this.$emit('onUnselect', catId);
      }
    },
  },

  beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
.categories-list {
  display: flex;
  flex-wrap: wrap;

  .category {
    position: relative;
    display: flex;
    cursor: pointer;

    &.selected {
    }
  }
}
</style>
