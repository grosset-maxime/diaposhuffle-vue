<template>
  <div
    :class="['the-player', {
      'video-item': playingItem.isVideo,
      'show-ui': shouldShowUI,
    }]"
    @mousemove="showUIDuring()"
  >
    <PinWrapper
      :class="['the-loop-pin-wrapper', {
        pined: loop.pined
      }]"
      :is-pined="loop.pined"
      icon-position="center"
      icon-position-top="-37px"
      @click="togglePinUI('loop')"
      @mouseover="onMouseOverUI"
      @mouseout="onMouseOutUI"
    >
      <TheLoop
        ref="TheLoop"
        :duration="loopDuration"
        :dense="!loop.pined && !shouldShowUI"
        :show-duration-time="playingItem.isVideo"
        show-remaining-time
        @end="goToNextItem"
      />
    </PinWrapper>

    <PauseBtn
      v-show="pause"
      class="the-pause-btn"
      @click="resumePlaying"
      @mouseover="onMouseOverUI"
      @mouseout="onMouseOutUI"
    />

    <v-alert
      class="alert"
      :value="alert.show"
      :type="alert.severity"
      dismissible
      prominent
      transition="slide-x-transition"
      @input="hideAlert()"
    >
      <v-row align="center">
        <v-col class="grow">
          {{ alert.publicMessage }}
        </v-col>
        <v-col
          class="shrink"
          v-if="alert.showDeleteBtn"
        >
          <v-btn @click="showDeleteModal({ itemData: loadErrorItem.data, showOptions: true })">
            Delete
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>

    <PinWrapper
      :class="['the-history-chip-pin-wrapper', {
        pined: historyChip.pined
      }]"
      :is-pined="historyChip.pined"
      icon-position="top right"
      @click="togglePinUI('historyChip')"
      @mouseover="onMouseOverUI"
      @mouseout="onMouseOutUI"
    >
      <HistoryChip
        v-show="showTheHistoryChip"
        class="the-history-chip"
        @click="pausePlaying"
      />
    </PinWrapper>

    <PinWrapper
      v-if="hasItems"
      :class="['the-items-info-chip-pin-wrapper', {
        pined: itemsInfoChip.pined
      }]"
      :is-pined="itemsInfoChip.pined"
      icon-position="top right"
      @click="togglePinUI('itemsInfoChip')"
      @mouseover="onMouseOverUI"
      @mouseout="onMouseOutUI"
    >
      <ItemsInfoChip
        class="the-items-info-chip"
        @click="pausePlaying"
      />
    </PinWrapper>

    <PinWrapper
      :class="['the-tags-list-pin-wrapper', {
        pined: tagsList.pined
      }]"
      :is-pined="tagsList.pined"
      icon-position="top right"
      @click="togglePinUI('tagsList')"
      @mouseover="onMouseOverUI"
      @mouseout="onMouseOutUI"
    >
      <TagsList
        v-if="options.showTags"
        v-show="showTheTagsList"
        :tags-ids="playingItemTags"
        class="the-tags-list"
        @click="showTaggerModal"
      />
    </PinWrapper>

    <DeleteModal
      :show="deleteModal.show"
      :show-options="deleteModal.showOptions"
      :show-preview="!!deleteModal.itemData"
      :show-src="!!deleteModal.itemData"
      @confirm="hideDeleteModal({ ...$event, deleteItem: true })"
      @cancel="hideDeleteModal"
      @click:outside="hideDeleteModal"
    >
      <template
        v-if="!!deleteModal.itemData"
        v-slot:preview
      >
        <img
          v-if="!!deleteModal.itemData.isImage"
          class="preview"
          :src="deleteModal.itemData.src"
        >
        <video
          v-if="!!deleteModal.itemData.isVideo"
          class="preview"
          :src="deleteModal.itemData.src"
        />
      </template>
      <template v-slot:message>
        Delete this item?
      </template>
      <template v-slot:src>
        {{ deleteSrcText }}
      </template>
    </DeleteModal>

    <ItemsPlayer
      ref="ItemsPlayer"
      class="the-items-player"
      :mute-video="muteVideoOption"
      @click="onItemsPlayerClick"
      @currentItem:loaded="onPlayingItemLoaded"
      @currentItem:error="onPlayingItemError"
    />

    <PinWrapper
      :class="['the-item-path-chip-pin-wrapper', {
        pined: itemPathChip.pined
      }]"
      :is-pined="itemPathChip.pined"
      icon-position="top left"
      @click="togglePinUI('itemPathChip')"
      @mouseover="onMouseOverUI"
      @mouseout="onMouseOutUI"
    >
      <!-- TODO: FEATURE: add a dense/contracted mode which will expand on mouse hover -->
      <ItemPathChip
        v-if="options.showPath"
        v-show="showTheItemPathChip"
        class="the-item-path-chip"
        :path-start="playingItemSelectedPath"
        :path-end="playingItemRandomPath"
        @click="pausePlaying"
        @mouseover="onMouseOverUI"
        @mouseout="onMouseOutUI"
      />
    </PinWrapper>

    <TaggerModal
      :show="taggerModal.show"
      :selected-tag-ids="playingItemTags"
      @close="hideTaggerModal"
      @save="onSaveTaggerModal"
    />
  </div>
</template>

<script>
// TODO: Enh: Display duration time for video at bottom corner?
// TODO: Feature: For small video try to not fit the screen and apply a scale instead.
// TODO: Feature: Show nb items and index of current item on playing from bdd items.
// TODO: Feature: Add options to play items not randomly but in row.
import {
  ERROR_SEVERITY_INFO,
  buildError,
} from '../api/api';
import { deepClone, getKey } from '../utils/utils';
import {
  INDEX_G_SHOW_THE_HELP,
  INDEX_M_SHOW_THE_HELP,
  INDEX_A_PLAYER_STOP,

  PLAYER_G_OPTIONS,
  PLAYER_G_FILTERS,

  PLAYER_G_HISTORY,
  PLAYER_G_HISTORY_INDEX,
  PLAYER_G_HISTORY_LENGTH,
  PLAYER_G_HISTORY_ITEM,

  PLAYER_G_ITEMS_LENGTH,

  PLAYER_M_SET_HISTORY_INDEX,
  PLAYER_M_ADD_HISTORY_ITEM,
  PLAYER_M_EDIT_HISTORY_ITEM,
  PLAYER_M_DELETE_HISTORY_ITEM,

  PLAYER_A_FETCH_NEXT,
  PLAYER_A_DELETE_ITEM,
  PLAYER_A_FETCH_ITEMS_FROM_BDD,
  PLAYER_A_FETCH_ITEMS_FROM_RANDOM,
  PLAYER_A_SET_ITEM_TAGS,

  TAGGER_A_FETCH_TAGS,
  TAGGER_A_FETCH_CATEGORIES,
} from '../store/types';
import TheLoop from './TheLoop.vue';
import PauseBtn from './PauseBtn.vue';
import DeleteModal from './DeleteModal.vue';
import TaggerModal from './Tagger/TaggerModal.vue';
import ItemPathChip from './ItemPathChip.vue';
import ItemsPlayer from './ItemsPlayer.vue';
import TagsList from './ThePlayer/TagsList.vue';
import HistoryChip from './ThePlayer/HistoryChip.vue';
import ItemsInfoChip from './ThePlayer/ItemsInfoChipChip.vue';
import PinWrapper from './ThePlayer/PinWrapper.vue';

const HISTORY_GO_NEXT = 'next';
const HISTORY_GO_PREVIOUS = 'previous';

export default {
  name: 'ThePlayer',

  components: {
    TheLoop,
    PauseBtn,
    DeleteModal,
    TaggerModal,
    ItemPathChip,
    ItemsPlayer,
    TagsList,
    HistoryChip,
    ItemsInfoChip,
    PinWrapper,
  },

  data: () => ({
    loop: {
      duration: 0,
      pined: false,
    },

    pause: false,
    stop: true,

    playingItem: {
      data: undefined,
      isVideo: false,
    },

    nextItem: {
      data: undefined,
      isSet: false,
    },

    loadErrorItem: {
      data: undefined,
    },

    deleteModal: {
      show: false,
      showOptions: false,
      itemData: undefined,
    },

    taggerModal: {
      show: false,
    },

    tagsList: {
      pined: false,
    },

    historyChip: {
      pined: false,
    },

    itemsInfoChip: {
      pined: false,
    },

    itemPathChip: {
      pined: false,
    },

    keyboardShortcuts: {
      player: () => {},
    },

    alert: {
      show: false,
      publicMessage: '',
      severity: 'error',
      showDeleteBtn: false,
      onClose: () => {},
    },

    fetchNextItemPromise: undefined,

    shouldShowUI: false,
    showUITimeout: undefined,
    preventHideUI: false,
  }),

  computed: {
    NS () { return 'player' },

    TAGGER_NS () { return 'tagger' },

    TheLoop () { return this.$refs.TheLoop },

    ItemsPlayer () { return this.$refs.ItemsPlayer },

    options () { return this.$store.getters[`${this.NS}/${PLAYER_G_OPTIONS}`] },

    filters () { return this.$store.getters[`${this.NS}/${PLAYER_G_FILTERS}`] },

    muteVideoOption () { return this.options.muteVideo },

    intervalOptions () { return this.options.interval * 1000 },

    loopDuration () { return this.loop.duration },

    playingItemData () { return this.playingItem.data },

    playingItemSelectedPath () { return this.playingItemData?.customFolderPath || '' },

    playingItemRandomPath () { return this.playingItemData?.randomPublicPath || '' },

    playingItemTags () { return this.playingItemData?.tags || [] },

    showTheItemPathChip () { return !!this.playingItemData },

    showTheTagsList () { return !!this.playingItemData },

    showTheHistoryChip () { return !!this.historyLength },

    history () { return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY}`] },

    historyLength () { return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_LENGTH}`] },

    historyIndex: {
      get () { return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_INDEX}`] },
      set (index) { this.$store.commit(`${this.NS}/${PLAYER_M_SET_HISTORY_INDEX}`, index) },
    },

    hasItems () { return !!this.$store.getters[`${this.NS}/${PLAYER_G_ITEMS_LENGTH}`] },

    deleteSrcText () {
      return `Src: ${this.deleteModal.itemData?.src}`;
    },

    theHelp () { return this.$store.getters[INDEX_G_SHOW_THE_HELP] },
  },

  watch: {
    theHelp (onShow) {
      if (onShow) {
        this.removeKeyboardPlayerShortcuts();
      } else {
        this.attachKeyboardPlayerShortcuts();
      }
    },
  },

  async mounted () {
    this.attachKeyboardPlayerShortcuts();

    // Reset history index.
    this.historyIndex = this.historyLength - 1;

    this.stop = false;
    this.pause = false;

    const fetchTagsAndCategoriesPromise = this.fetchTagsAndCategories();

    if (this.filters.tags.length || this.filters.fileTypes.length) {
      this.setLoopIndeterminate(true);
      try {
        await this.$store.dispatch(`${this.NS}/${PLAYER_A_FETCH_ITEMS_FROM_BDD}`);
      } catch (e) {
        const error = buildError(e);

        this.setLoopIndeterminate(false);
        this.showAlert({ ...error, onClose: this.stopPlaying });

        if (error.severity === ERROR_SEVERITY_INFO) {
          return Promise.resolve();
        }

        throw error;
      }
    } else {
      await this.$store.dispatch(`${this.NS}/${PLAYER_A_FETCH_ITEMS_FROM_RANDOM}`);
    }

    await fetchTagsAndCategoriesPromise;

    this.goToNextItem();

    return Promise.resolve();
  },

  beforeDestroy () {
    this.removeKeyboardPlayerShortcuts();
    this.stopPlaying();
  },

  methods: {
    startPlaying ({ startLooping = true, playItem = true } = {}) {
      this.stop = false;
      this.pause = false;

      this.TheLoop.goToLoopStart();

      if (playItem) { this.startPlayingItem() }
      if (startLooping) { this.TheLoop.startLooping() }
    },

    stopPlaying () {
      this.stop = true;

      this.stopPlayingItem();

      this.TheLoop.stopLooping();

      this.$store.dispatch(`${INDEX_A_PLAYER_STOP}`);
    },

    pausePlaying ({ pauseItem = true, pauseLooping = true } = {}) {
      this.pause = true;

      if (pauseItem) { this.pausePlayingItem() }
      if (pauseLooping) { this.TheLoop.pauseLooping() }
    },

    resumePlaying ({ resumeItem = true, resumeLooping = true } = {}) {
      this.stop = false;
      this.pause = false;

      if (resumeItem) { this.resumePlayingItem() }
      if (resumeLooping) { this.TheLoop.resumeLooping() }
    },

    setLoopIndeterminate (state) { this.TheLoop.setIndeterminate(state) },

    async onLoopEnd () {
      await this.TheLoop.stopLooping();

      if (this.stop) { return Promise.resolve() }

      this.setLoopIndeterminate(true);

      let itemData;
      const isNextItemSet = this.nextItem.isSet;
      try {
        if (this.nextItem.data) {
          itemData = deepClone(this.nextItem.data);
        } else {
          itemData = await (this.fetchNextItemPromise || this.fetchItem());
        }
      } catch (e) {
        const error = buildError(e);
        this.pausePlaying();
        this.showAlert(error);
        throw error;
      }

      if (this.stop) { return Promise.resolve() }

      this.fetchNextItem();

      this.setLoopIndeterminate(false);

      return this.showAndPlayNextItem(itemData, { isNextItemSet, animate: true });
    },

    async onPlayingItemLoaded () {
      if (!this.nextItem.data) {
        await this.fetchNextItemPromise;
      }
      this.setNextItemData(this.nextItem.data);
    },

    onPlayingItemError ({ item }) {
      this.$set(this.loadErrorItem, 'data', item.data);

      this.pausePlaying();

      this.showAlert({
        publicMessage: `Fail to load item: ${item.data.src}`,
        showDeleteBtn: true,
        onClose: this.goToNextItem,
      });

      this.onPlayingItemLoaded();
    },

    onItemsPlayerClick () {
      if (this.pause) {
        this.resumePlaying();
      } else {
        this.pausePlaying();
      }
    },

    onMouseOverUI () {
      this.preventHideUI = true;
      this.showUI();

      clearTimeout(this.showUITimeout);
      this.showUITimeout = undefined;
    },

    onMouseOutUI () {
      this.preventHideUI = false;
      this.showUIDuring();
    },

    setNextItemData (itemData) {
      this.ItemsPlayer.setNextItemData(itemData);
      this.$set(this.nextItem, 'isSet', true);
    },

    async showAndPlayNextItem (itemData, { isNextItemSet = false, animate = false } = {}) {
      if (this.stop) { return Promise.resolve() }

      if (!isNextItemSet) { this.setNextItemData(itemData) }

      // Await for next tick to let the next item to load.
      await this.$nextTick();

      if (this.stop) { return Promise.resolve() }

      // Switch to the next item.
      await this.ItemsPlayer.showNextItem({ animate });

      this.$set(this.playingItem, 'data', itemData);
      this.$set(this.playingItem, 'isVideo', this.ItemsPlayer.isItemVideo());

      if (this.stop) { return Promise.resolve() }

      return this.playNextItem();
    },

    startPlayingItem () { this.ItemsPlayer.playItem() },

    stopPlayingItem () { this.pausePlayingItem() },

    pausePlayingItem () { this.ItemsPlayer.pauseItem() },

    resumePlayingItem () { this.ItemsPlayer.playItem() },

    setLoopDuration () {
      const itemDuration = this.ItemsPlayer.getItemDuration();
      const duration = Math.max(itemDuration, this.intervalOptions);

      this.$set(this.loop, 'duration', duration);
    },

    async fetchItem () {
      let item;
      let error;

      try {
        item = await this.$store.dispatch(
          `${this.NS}/${PLAYER_A_FETCH_NEXT}`,
        );
      } catch (e) {
        error = buildError(e);
        this.showAlert(error);
        throw error;
      }

      // Return next item data.
      return item;
    },

    fetchNextItem () {
      // Start fetching the next item of the current next item.
      this.$set(this.nextItem, 'data', undefined);
      this.$set(this.nextItem, 'isSet', false);

      this.fetchNextItemPromise = this.fetchItem()
        .then((nextItemData) => {
          this.$set(this.nextItem, 'data', nextItemData);
          return nextItemData;
        })
        .catch((e) => {
          console.error('On fetch next Item:', e);

          // TODO: Enh: manage the error, do not try to load next item, and display error message when trying to display next item.
          const error = buildError(e);
          this.pausePlaying();
          this.showAlert(error);
          throw error;
        });

      return this.fetchNextItemPromise;
    },

    async goToNextItem ({ pausePlayingIfStillInHistory = false } = {}) {
      if (this.isLoadingItem) { return Promise.resolve() }

      this.isLoadingItem = true;

      return this.goToHistoryItem(HISTORY_GO_NEXT, { pausePlayingIfStillInHistory })
        .finally(() => { this.isLoadingItem = false });
    },

    async goToPreviousItem () {
      if (this.isLoadingItem) { return Promise.resolve() }

      this.isLoadingItem = true;

      this.pausePlaying();

      return this.goToHistoryItem(HISTORY_GO_PREVIOUS)
        .finally(() => { this.isLoadingItem = false });
    },

    async goToHistoryItem (direction, { pausePlayingIfStillInHistory = false } = {}) {
      if (this.stop) { return Promise.resolve() }

      this.pausePlayingItem();

      const historyIndex = this.historyIndex + (direction === HISTORY_GO_NEXT ? 1 : -1);

      if (historyIndex < 0) {
        this.historyIndex = 0;
        return Promise.resolve();
      }

      // If requested history's index is greater than history length,
      // call onLoopEnd to fetch next item and then add it to the history list.
      if (historyIndex >= this.historyLength) {
        // Set stop and pause to false.
        this.resumePlaying({ resumeItem: false, resumeLooping: false });

        this.historyIndex = this.historyLength - 1;

        return this.onLoopEnd()
          .then(() => {
            if (this.stop) { return }

            this.addHistoryItem(this.playingItemData);
            this.historyIndex = this.historyLength - 1;
          })
          .catch((e) => {
            const error = buildError(e);

            this.pausePlaying();
            this.showAlert(error);

            throw error;
          });
      }

      if (pausePlayingIfStillInHistory) {
        this.pausePlaying({ pauseItem: false, pauseLooping: false });
      }

      await this.TheLoop.stopLooping();

      if (this.stop) { return Promise.resolve() }

      this.historyIndex = historyIndex;

      // Get item data.
      const itemData = this.getHistoryItem(this.historyIndex);

      const nextItemData = this.getHistoryItem(this.historyIndex + 1);
      if (nextItemData) {
        this.$set(this.nextItem, 'isSet', false);
        this.$set(this.nextItem, 'data', nextItemData);
      } else {
        this.fetchNextItem();
      }

      return this.showAndPlayNextItem(itemData);
    },

    getHistoryItem (index) {
      return this.$store.getters[`${this.NS}/${PLAYER_G_HISTORY_ITEM}`](index);
    },

    addHistoryItem (item) {
      return this.$store.commit(`${this.NS}/${PLAYER_M_ADD_HISTORY_ITEM}`, deepClone(item));
    },

    editHistoryItem (index, item) {
      return this.$store.commit(
        `${this.NS}/${PLAYER_M_EDIT_HISTORY_ITEM}`,
        { index, item: deepClone(item) },
      );
    },

    showDeleteModal ({ itemData, showOptions = false } = {}) {
      this.showUI();
      this.pausePlaying();
      this.removeKeyboardPlayerShortcuts();

      this.$set(this.deleteModal, 'itemData', itemData);
      this.$set(this.deleteModal, 'showOptions', showOptions);
      this.$set(this.deleteModal, 'show', true);
    },

    hideDeleteModal ({ deleteItem = false, fromBddOnly, ignoreIfNotExist } = {}) {
      const itemSrc = this.deleteModal.itemData.src;

      this.hideUI();

      this.$set(this.deleteModal, 'show', false);
      this.$set(this.deleteModal, 'itemData', undefined);

      this.attachKeyboardPlayerShortcuts();

      if (deleteItem) {
        this.deleteItem({
          itemSrc,
          fromBddOnly,
          ignoreIfNotExist,
        }).catch((e) => {
          const error = buildError(e);

          this.pausePlaying();
          this.showAlert(error);

          throw error;
        });
      }
    },

    showTaggerModal () {
      this.pausePlaying();
      this.removeKeyboardPlayerShortcuts();
      this.$set(this.taggerModal, 'show', true);
    },

    hideTaggerModal () {
      this.$set(this.taggerModal, 'show', false);
      this.attachKeyboardPlayerShortcuts();
      this.showUIDuring(3000);
    },

    onSaveTaggerModal (selectedTagIds) {
      const tags = deepClone(selectedTagIds);
      const item = this.playingItem.data;

      this.$set(item, 'tags', tags);

      this.editHistoryItem(this.historyIndex, item);

      this.$store.dispatch(
        `${this.NS}/${PLAYER_A_SET_ITEM_TAGS}`, { item: deepClone(item) },
      ).catch((e) => {
        const error = buildError(e);

        this.pausePlaying();
        this.showAlert(error);

        throw error;
      });
    },

    async deleteItem ({ itemSrc, fromBddOnly, ignoreIfNotExist }) {
      if (!itemSrc) { return Promise.resolve() }

      this.$store.commit(`${this.NS}/${PLAYER_M_DELETE_HISTORY_ITEM}`, itemSrc);

      this.goToNextItem({ pausePlayingIfStillInHistory: true });

      let response;
      let error;

      try {
        response = await this.$store.dispatch(
          `${this.NS}/${PLAYER_A_DELETE_ITEM}`,
          { itemSrc, fromBddOnly, ignoreIfNotExist },
        );
      } catch (e) {
        error = buildError(e);

        this.pausePlaying();
        this.showAlert(error);

        throw error;
      }

      return response;
    },

    showTheHelp () { this.$store.commit(INDEX_M_SHOW_THE_HELP, true) },

    showAlert ({
      publicMessage = 'Unknow error.',
      severity = 'error',
      showDeleteBtn = false,
      onClose = () => {},
    } = {}) {
      this.$set(this, 'alert', {
        publicMessage, severity, showDeleteBtn, onClose, show: true,
      });
    },

    hideAlert () {
      this.$set(this.alert, 'show', false);

      // eslint-disable-next-line no-unused-expressions
      this.alert.onClose?.();
    },

    attachKeyboardPlayerShortcuts () {
      this.keyboardShortcuts.player = (e) => {
        // console.log('ThePlayer e:', e);

        const key = getKey(e);
        switch (key) {
          case 'Space':
            if (this.pause) {
              this.resumePlaying();
            } else {
              this.pausePlaying();
            }
            break;

          // On ArrowDown only pause/resume looping to allow to play video in
          // infinite loop if wanted.
          case 'ArrowDown':
            if (this.pause) {
              this.resumePlaying({ resumeItem: false });
            } else {
              this.pausePlaying({ pauseItem: false });
            }
            break;

          case 'Escape':
            this.stopPlaying();
            break;

          case 'ArrowRight':
            this.goToNextItem({ pausePlayingIfStillInHistory: true });
            break;

          case 'ArrowLeft':
            this.goToPreviousItem();
            break;

          case 'Delete':
            if (this.TheLoop.value < this.loopDuration || this.pause) {
              this.showDeleteModal({ itemData: this.playingItemData });
            }
            break;

          case 'h':
            this.pausePlaying();
            this.showTheHelp();
            break;

          case 't':
            if (this.TheLoop.value < this.loopDuration || this.pause) {
              this.showTaggerModal();
            }
            break;
          default:
        }
      };

      window.addEventListener('keydown', this.keyboardShortcuts.player);
    },

    removeKeyboardPlayerShortcuts () {
      window.removeEventListener('keydown', this.keyboardShortcuts.player);
    },

    async playNextItem () {
      await this.TheLoop.goToLoopStart();

      this.setLoopDuration();

      if (this.pause) {
        this.TheLoop.pauseLooping();
      } else {
        this.TheLoop.startLooping();
      }

      this.startPlayingItem();
    },

    showUIDuring (time = 2000) {
      this.shouldShowUI = true;

      if (this.preventHideUI) { return }

      clearTimeout(this.showUITimeout);
      this.showUITimeout = setTimeout(() => {
        if (this.preventHideUI) { return }
        this.hideUI();
      }, time);
    },

    showUI () { this.shouldShowUI = true },

    hideUI () { this.shouldShowUI = false },

    togglePinUI (uiName) {
      this.$set(this[uiName], 'pined', !this[uiName].pined);
    },

    fetchTagsAndCategories () {
      return Promise.all([
        this.$store.dispatch(`${this.TAGGER_NS}/${TAGGER_A_FETCH_TAGS}`),
        this.$store.dispatch(`${this.TAGGER_NS}/${TAGGER_A_FETCH_CATEGORIES}`),
      ]);
    },
  },
};
</script>

<style lang="scss" scoped>
.the-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  background-color: $grey-8;
  cursor: none;

  &.show-ui {
    cursor: default;

    .the-history-chip-pin-wrapper,
    .the-items-info-chip-pin-wrapper,
    .the-tags-list-pin-wrapper,
    .the-item-path-chip-pin-wrapper {
      transform: translateX(0);
    }
  }

  &.video-item {
    .the-item-path-chip-pin-wrapper {
      bottom: 80px; // To not cover the video controls.
    }
  }

  .the-pause-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 1000;
  }

  .alert {
    $margin: 10px;
    z-index: 2000;
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - #{$margin * 2});
    margin: $margin;
  }

  .the-loop-pin-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1000;
    width: 100%;
  }

  .the-history-chip-pin-wrapper {
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: 1000;
    transform: translateX(-150%);
    transition: transform 0.3s ease;

    &.pined {
      transform: none;
    }
  }

  .the-items-info-chip-pin-wrapper {
    position: absolute;
    top: 35px;
    left: 5px;
    z-index: 1000;
    transform: translateX(-150%);
    transition: transform 0.3s ease;

    &.pined {
      transform: none;
    }
  }

  .the-tags-list-pin-wrapper {
    position: absolute;
    top: 80px;
    left: 5px;
    z-index: 1000;
    transform: translateX(-150%);
    transition: transform 0.3s ease;

    &.pined {
      transform: none;
    }

    .the-tags-list {
      cursor: pointer;
    }
  }

  .the-item-path-chip-pin-wrapper {
    position: absolute;
    bottom: 25px;
    right: 5px;
    z-index: 1000;
    transform: translateX(110%);
    transition: transform 0.3s ease;

    &.pined {
      transform: none;
    }
  }

  .the-items-player {
    position: relative;
  }
}
</style>
