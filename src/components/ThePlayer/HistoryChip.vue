<template>
  <v-chip
    class="history"
    small
    @click="onClick"
  >
    {{ historyIndex + 1 }} / {{ historyLength }} | {{ currentItemCount }}
  </v-chip>
</template>

<script>
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

  methods: {
    onClick () { this.$emit('click') },
  },
};
</script>

<style lang="scss" scoped>
.history {
  padding: 0 6px;
  color: $grey-5;
  transition: color 0.3 ease;

  &.v-chip {
    background-color: $grey-7#{80};
  }

  &:hover {
    color: $grey-0;
  }
}
</style>
