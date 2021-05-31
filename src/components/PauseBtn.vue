<template>
  <v-btn
    class="pause-btn"
    icon
    @click="onClick"
    @mouseover="$emit('mouseover', $event)"
    @mouseout="$emit('mouseout', $event)"
  >
    <div class="pause-icon">
      <div class="stick" />
      <div class="stick" />
    </div>
  </v-btn>
</template>

<script>
export default {
  name: 'PauseBtn',

  props: {},

  emits: {
    click: null,
  },

  data: () => ({}),

  methods: {
    onClick () { this.$emit('click') },
  },
};
</script>

<style lang="scss" scoped>
.pause-btn {
  color: $grey-0;

  .pause-icon {
    display: flex;
    justify-content: center;
    align-items: center;

    .stick {
      width: 5px;
      height: 16px;
      margin: auto 1px;
      background: $grey-0;
      border: 1px solid $grey-7;
    }
  }
}
</style>
