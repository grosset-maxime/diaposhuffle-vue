<template>
  <div class="circular-loading">
    <v-progress-circular
      :size="size"
      :width="10"
      :indeterminate="indeterminate"
      :color="color"
    />
  </div>
</template>

<script>
export default {
  name: 'CircularLoading',

  props: {
    size: {
      type: Number,
      default: () => 100,
    },

    width: {
      type: Number,
      default: () => 10,
    },

    indeterminate: {
      type: Boolean,
      default: () => true,
    },

    color: {
      type: String,
      default: () => 'orange',
    },
  },

  emits: {},

  data: () => ({}),

  computed: {},

  mounted () {},

  methods: {},

  beforeDestroy () {},
};
</script>

<style lang="scss" scoped>
.circular-loading {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
