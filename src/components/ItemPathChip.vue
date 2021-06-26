<template>
  <div
    class="item-path-chip"
    @click="$emit('click')"
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
// TODO: Feature: On click add to clipboard the path of the item.
// TODO: Feature: Add a very small icon in order to allow to pin the cmp to force show even if the ui is hidden.
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
};
</script>

<style lang="scss" scoped>
.item-path-chip {
  word-break: break-all;
  color: $grey-3;
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
