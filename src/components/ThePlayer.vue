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
  },
  computed: {
  },
};
</script>

<style lang="scss" scoped>

</style>
