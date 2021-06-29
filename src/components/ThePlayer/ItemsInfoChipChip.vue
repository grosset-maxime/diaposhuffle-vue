<template>
  <v-chip
    class="history"
    small
    @click="$emit('click')"
  >
    {{ currentItemIndex + 1 }} / {{ itemsLength }}
  </v-chip>
</template>

<script>
// TODO: Feature: On click on the chip show the list of items and allow to navigate through it with arrow key. Also display an item preview.
import {
  PLAYER_G_CURRENT_ITEM_INDEX,
  PLAYER_G_ITEMS_LENGTH,
} from '../../store/types';

export default {
  name: 'ItemsInfoChip',

  props: {},

  emits: {
    click: null,
  },

  data: () => ({}),

  computed: {
    NS () { return 'player' },

    itemsLength () { return this.$store.getters[`${this.NS}/${PLAYER_G_ITEMS_LENGTH}`] },

    currentItemIndex () { return this.$store.getters[`${this.NS}/${PLAYER_G_CURRENT_ITEM_INDEX}`] },
  },
};
</script>

<style lang="scss" scoped>
.history {
  padding: 0 6px;
  color: $grey-3;
  transition: color 0.3 ease;

  &.v-chip {
    background-color: $grey-7#{80};
  }

  &:hover {
    color: $grey-0;
  }
}
</style>
