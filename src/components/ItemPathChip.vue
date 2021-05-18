<template>
  <div
    class="item-path-chip"
    @click="onClick"
  >
    <span class="path-start">
      {{ pathStart }}
    </span>

    <span
      class="path-end"
      v-show="pathEnd"
    >
      {{ pathEnd }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'ItemPathChip',

  props: {
    pathStart: {
      type: String,
      default: '',
    },

    pathEnd: {
      type: String,
      default: '',
    },
  },

  emits: {
    click: null,
  },

  data: () => ({}),

  computed: {},

  methods: {
    onClick () { this.$emit('click') },
  },
};
</script>

<style lang="scss" scoped>
.item-path-chip {
  word-break: break-all;
  color: $grey-5;
  background-color: $grey-7#{80};
  padding: 0 3px;
  border-radius: 5px;
  cursor: text;

  &:hover {
    color: $grey-0;
  }

  .path-start {
    font-size: 0.5em;
    margin-right: 4px;
  }

  .path-end {
    font-size: 1em;
    font-weight: bold;
  }
}
</style>
