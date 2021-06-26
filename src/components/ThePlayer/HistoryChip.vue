<template>
  <v-chip
    class="history"
    small
    @click="$emit('click')"
  >
    {{ historyIndex + 1 }} / {{ historyLength }} | {{ currentItemCount }}
  </v-chip>
</template>

<script>
// TODO: Feature: On click on the chip show the list of history and allow to navigate through it with arrow key. Also display an item preview.
import {
  PLAYER_G_HISTORY,
  PLAYER_G_HISTORY_INDEX,
  PLAYER_G_HISTORY_LENGTH,
  PLAYER_G_HISTORY_ITEM,
} from '../../store/types';

export default {
  name: 'HistoryChip',

  props: {},

  emits: {
    click: null,
  },

  data: () => ({}),

  computed: {
    NS () { return 'player' },

    history () { return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY}`] },

    historyLength () { return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_LENGTH}`] },

    historyIndex () { return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_INDEX}`] },

    historyItem () {
      return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_ITEM}`](this.historyIndex);
    },

    currentItemCount () {
      let count = 0;

      if (this.historyItem) {
        this.history.items.forEach((item) => {
          if (item.src === this.historyItem.src) { count += 1 }
        });
      }

      return count;
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
