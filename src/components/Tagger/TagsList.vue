<template>
  <div class="tags-list">
    <div
      v-for="(tag) in tags"
      :key="tag.id"
      class="tag"
      @click="onSelect(tag)"
    >
      {{ tag.name }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'TagsList',

  components: {

  },

  props: {
    tags: {
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

    onSelect () {},
  },

  beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
.tags-list {
  display: flex;
  flex-wrap: wrap;

  .tag {
    display: flex;
    border: 1px solid #ccc;
    padding: 5px;
    margin: 4px;
    border-radius: 3px;
    box-shadow: 1px 1px 2px #ccc;
    cursor: pointer;
    transition: color 0.4s, background-color 0.4s;
    position: relative;
  }
}
</style>
