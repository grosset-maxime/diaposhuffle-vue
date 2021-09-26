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
  PLAYER_G_CURRENT_PINED_ITEM_INDEX,
  PLAYER_G_PINEDS_LENGTH,
  PLAYER_G_IS_FETCH_NEXT_FROM_PINEDS,
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

    PLAYER_OPTS_SRC_NS () { return 'playerOptionsSource' },

    itemsLength () {
      return this.$store.getters[
        this.isFromPinedSource
          ? `${this.NS}/${PLAYER_G_PINEDS_LENGTH}`
          : `${this.NS}/${PLAYER_G_ITEMS_LENGTH}`
      ];
    },

    currentItemIndex () {
      return this.$store.getters[
        this.isFromPinedSource
          ? `${this.NS}/${PLAYER_G_CURRENT_PINED_ITEM_INDEX}`
          : `${this.NS}/${PLAYER_G_CURRENT_ITEM_INDEX}`
      ];
    },

    isFromPinedSource () {
      return this.$store.getters[`${this.NS}/${PLAYER_G_IS_FETCH_NEXT_FROM_PINEDS}`];
    },
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
