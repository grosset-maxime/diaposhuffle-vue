<template>
  <v-container class="help-diaposhuffle-ctn">
    <v-expansion-panels
      multiple
      focusable
      v-model="openedPanels"
    >
      <v-expansion-panel
        v-for="panel in panels"
        :key="panel.title"
      >
        <v-expansion-panel-header>{{ panel.title }}</v-expansion-panel-header>
        <v-expansion-panel-content class="pt-1">
          <v-row
            v-for="(item, i) in panel.content"
            :key="i"
            dense
            class="item-row"
            align="center"
          >
            <v-col>
              {{ item.shortcut }}
            </v-col>
            <v-col>
              {{ item.description }}
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>

const panels = [{
  // Options - shortcuts
  // ===================
  title: 'Options - shortcuts',
  opened: true,
  content: [{
    shortcut: 'h',
    description: 'Show DiapoShuffle help.',
  }, {
    shortcut: 'SPACE / p',
    description: 'Start playing.',
  }, {
    shortcut: 'b',
    description: 'Open Folder browser.',
  }, {
    shortcut: 't',
    description: 'Open Tagger.',
  }],
}, {
  // Player - shortcuts
  // ==================
  title: 'Player - shortcuts',
  opened: true,
  content: [{
    shortcut: 'h',
    description: 'Show DiapoShuffle help.',
  }, {
    shortcut: 'ESC',
    description: 'Stop playing, return to options.',
  }, {
    shortcut: 'SPACE / down arrow',
    description: 'Pause playing.',
  }, {
    shortcut: 'i / up arrow',
    description: 'Open Inside folder of current picture/video modal.',
  }, {
    shortcut: 'a',
    description: 'Open Add the folder\'s picture/video to the random list folder modal.',
  }, {
    shortcut: 'd / SUPP',
    description: 'Delete the current picture/video.',
  }, {
    shortcut: 'p',
    description: 'Pin the current picture/video.',
  }, {
    shortcut: 'm',
    description: 'Toggle playing method between "Random" and "Normal".',
  }, {
    shortcut: 'left arrow',
    description: 'Show previous picture/video.',
  }, {
    shortcut: 'right arrow',
    description: 'Show next picture/video.',
  }, {
    shortcut: '/',
    description: 'Reset to original picture/video size.',
  }, {
    shortcut: '*',
    description: 'Scale picture/video size to window size.',
  }, {
    shortcut: '+',
    description: 'Zoom in picture/video size.',
  }, {
    shortcut: '-',
    description: 'Zoom out picture/video size.',
  }],
}, {
  // Folder browser - shortucts
  // ==========================
  title: 'Folder browser - shortucts',
  opened: true,
  content: [{
    shortcut: 'Enter / ESC',
    description: 'Close Folder browser.',
  }],
}, {
  // Tagger - shortucts
  // ==================
  title: 'Tagger - shortucts',
  opened: true,
  content: [{
    shortcut: 'CTRL / mouse down',
    description: 'See through Tagger modal.',
  }, {
    shortcut: 'ESC.',
    description: 'Clear tag search filter.',
  }],
}];

export default {
  name: 'HelpDiapoShuffle',
  data: () => ({
    openedPanels: panels
      .map((panel, index) => (panel.opened ? index : -1))
      .filter((v) => v >= 0),
    panels,
  }),
};
</script>

<style lang="scss" scoped>
.v-item--active {
  .v-expansion-panel-header {
    min-height: 48px;
    background-color: $orange-1;
    color: $grey-8;
    font-weight: bold;
  }
}

.item-row {
  padding-left: 10px;
  border-radius: 3px;

  &:hover {
    background-color: $grey-7;
  }
}
</style>
