<template>
  <div class="categories-list">
    <v-chip
      v-for="(cat) in categories"
      :key="cat.id"
      :class="['category mr-1 mt-0 mb-1', {
        selected: cat.selected
      }]"
      :color="getColor(cat.selected)"
      outlined
      filter
      @click="onSelect(cat)"
    >
      {{ cat.name }}
    </v-chip>
  </div>
</template>

<script>
export default {
  name: 'CategoriesList',

  components: {

  },

  props: {
    categories: {
      type: Array,
      default: () => ([]),
    },

    selected: {
      type: Array,
      default: () => ([]),
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
    onShow () {},

    onHide () {},

    onSelect (cat) {
      this.$set(cat, 'selected', !cat.selected);
      this.$emit('onSelect', cat);
    },

    getColor (isSelected) {
      return isSelected ? 'orange' : undefined;
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
