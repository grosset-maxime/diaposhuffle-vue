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
    shortcut: 'SPACE / ENTER',
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
    shortcut: 'SPACE',
    description: `Pause/resume playing and pause/resume video too (if current
                  item is a video).`,
  }, {
    shortcut: 'down arrow',
    description: `Pause/resume playing but do not pause or resume video (if
                  current item is a video).`,
  }, {
    shortcut: 'i / up arrow',
    description: 'Open Inside folder of current picture/video modal. (TODO)',
  }, {
    shortcut: 'a',
    description: 'Open Add the folder\'s picture/video to the random list folder modal.',
  }, {
    shortcut: 'd / SUPP',
    description: 'Delete the current picture/video.',
  }, {
    shortcut: 'p',
    description: 'Pin/Unpin the current picture/video.',
  }, {
    shortcut: 'm',
    description: 'Toggle playing method between "Random" and "Normal". (TODO)',
  }, {
    shortcut: 'left arrow',
    description: 'Show previous picture/video.',
  }, {
    shortcut: 'right arrow',
    description: 'Show next picture/video.',
  }, {
    shortcut: '/',
    description: 'Reset to original picture/video size. (TODO)',
  }, {
    shortcut: '*',
    description: 'Scale picture/video size to window size. (TODO)',
  }, {
    shortcut: '+',
    description: 'Zoom in picture/video size. (TODO)',
  }, {
    shortcut: '-',
    description: 'Zoom out picture/video size. (TODO)',
  }],
}, {
  // Folder browser - shortucts
  // ==========================
  title: 'Folder browser - shortucts',
  opened: true,
  content: [{
    shortcut: 'Meta + Escape',
    description: 'Close and cancel Folder browser.',
  }, {
    shortcut: 'Alt + Enter',
    description: 'Close and confirm Folder browser.',
  }],
}, {
  // Tagger - shortucts
  // ==================
  title: 'Tagger - shortucts',
  opened: true,
  content: [{
    shortcut: 'Ctrl',
    description: 'Toggle Tagger modal opacity.',
  }, {
    shortcut: 'Escape',
    description: 'Clear tag search filter (if input has focus).',
  }, {
    shortcut: 'Meta + Escape',
    description: 'Close and cancel the Tagger modal.',
  }, {
    shortcut: 'Alt + Enter',
    description: 'Close and confirm the Tagger modal.',
  }, {
    shortcut: 'Shift + Enter',
    description: 'Select/unselect focused tag but do not clear the search filter.',
  }, {
    shortcut: 'Enter',
    description: 'Select/unselect focused tag and clear the search filter.',
  }, {
    shortcut: 'Any character',
    description: 'Start tag search filtering (set input focus and start filtering).',
  }, {
    shortcut: 'left/right arrow',
    description: 'Navigate into current tags section. Set focus on previous/next tag.',
  }, {
    shortcut: 'up/downs arrow',
    description: 'Navigate through tags section. Set focus on above/below tags section (TODO).',
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
