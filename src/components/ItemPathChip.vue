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
    onClick: null,
  },

  data: () => ({}),

  computed: {},

  methods: {
    onClick () { this.$emit('onClick') },
  },
};
</script>

<style lang="scss" scoped>
.item-path-chip {
  word-break: break-all;
  color: $grey-8;
  background-color: $grey-7#{80};
  padding: 0 5px;
  border-radius: 5px;
  transition: transform 0.2s ease, color 0.3s ease;

  &:hover {
    color: $grey-5;
  }

  .path-start {
    font-size: 1em;
    margin-right: 4px;
  }

  .path-end {
    font-size: 1.5em;
    font-weight: bold;
  }
}
</style>
