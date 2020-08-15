<template>
  <div class="the-player">
    Hello The Player !
    <div v-if="start">
      Starting !!
    </div>
  </div>
</template>

<script>
export default {
  name: 'ThePlayer',
  props: {
    start: {
      type: Boolean,
      default: false,
    },
    pause: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
  },
  mounted () {
    if (this.start) {
      this.startPlaying();
    }
  },
};
</script>

<style lang="scss" scoped>

</style>
