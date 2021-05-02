<template>
  <div
    class="items-player"
    @click="onClick"
  >
    <div
      v-for="(item, i) in getItems()"
      :key="getItemName(i)"
      :ref="getItemName(i)"
      :class="['item-ctn transition', getItemName(i)]"
      :style="item.styles"
    >
      <img
        v-if="item.src && (item.data || {}).isImage"
        :src="item.src"
        class="item img"
        @load="onItemLoaded(getItemName(i))"
      >
      <video
        v-if="item.src && (item.data || {}).isVideo"
        :src="item.src"
        class="item vid"
        :autoplay="item.videoOptions.autoplay"
        :loop="item.videoOptions.loop"
        :muted="muteVideo"
        :controls="item.videoOptions.controls"
        :controlsList="item.videoOptions.controlsList"
        disablePictureInPicture
        @canplay="onItemLoaded(getItemName(i))"
        @pause="onPauseVideo()"
        @play="onPlayVideo()"
      />
    </div>
  </div>
</template>

<script>
const defaultVideoOptions = {
  autoplay: false,
  loop: true,
  muted: true,
  controls: true,
  controlsList: ['nofullscreen', 'nodownload', 'noremoteplayback'].join(' '),
};

export default {
  name: 'ItemsPlayer',

  props: {
    triggerShowNextItem: {
      type: Boolean,
      default: () => false,
    },

    triggerPauseItem: {
      type: Boolean,
      default: false,
    },

    triggerPlayItem: {
      type: Boolean,
      default: false,
    },

    nextItemData: {
      type: Object,
      default: undefined,
    },

    animateSwitchItems: {
      type: Boolean,
      default: true,
    },

    muteVideo: {
      type: Boolean,
      default: true,
    },
  },

  emits: {
    triggerShowNextItem: null,
    triggerPauseItem: null,
    triggerPlayItem: null,

    click: null,
    pauseVideo: null,
    playVideo: null,
    playingNextItem: null,
  },

  data: () => ({
    item1: {
      name: 'item1',
      src: '',
      data: undefined,
      styles: { opacity: 1, 'z-index': 500 },
      videoOptions: { ...defaultVideoOptions },
      onLoadPromise: undefined,
      onLoadResolve: undefined,
      onLoad: () => {},
    },

    item2: {
      name: 'item2',
      src: '',
      data: undefined,
      styles: { opacity: 0, 'z-index': 1 },
      videoOptions: { ...defaultVideoOptions },
      onLoadPromise: undefined,
      onLoadResolve: undefined,
      onLoad: () => {},
    },

    currentItemName: 'item1',
    isTheFirstOneItem: true,
  }),

  computed: {
    currentItemData () { return this[this.currentItemName].data },

    nextItemName () { return this.currentItemName === 'item1' ? 'item2' : 'item1' },
  },

  watch: {
    triggerShowNextItem (showNextItem) { if (showNextItem) { this.showNextItem() } },

    triggerPauseItem (shouldPause) {
      if (shouldPause) {
        this.pauseItem();
        this.$emit('update:triggerPauseItem', false);
      }
    },

    triggerPlayItem (shouldPlay) {
      if (shouldPlay) {
        this.playItem();
        this.$emit('update:triggerPlayItem', false);
      }
    },

    nextItemData (data) {
      this.isTheFirstOneItem = !!(!this.currentItemData && !this.getItemData(this.nextItemName));

      this.setItemData(
        this.isTheFirstOneItem ? this.currentItemName : this.nextItemName,
        data,
      );
    },
  },

  mounted () {
    this.item1.onLoad = this.onLoadItem1;
    this.item2.onLoad = this.onLoadItem2;
  },

  methods: {
    getItemName (i) { return `item${i + 1}` },

    getItems () { return [this.item1, this.item2] },

    getItem (itemName = this.currentItemName) { return this[itemName] },

    getItemRef (itemName = this.currentItemName) { return this.$refs[itemName][0] },

    getItemData (itemName = this.currentItemName) {
      return this.getItem(itemName).data;
    },

    getImageEl (itemName = this.currentItemName) {
      return this.getItemRef(itemName).querySelector('.item.img');
    },

    getVideoEl (itemName = this.currentItemName) {
      return this.getItemRef(itemName).querySelector('.item.vid');
    },

    setItemDataDuration (itemName = this.currentItemName) {
      const item = this.getItem(itemName);

      if (item.data.duration) { return }

      let duration = 0;

      if (this.isItemVideo(itemName)) {
        const videoEl = this.getVideoEl(itemName);
        duration = (videoEl.duration || 0) * 1000;
      }

      item.data.duration = duration;
    },

    getCurrentItemSrc () { return this.currentItemData.src },

    isItemImage (itemName = this.currentItemName) { return !this.isItemVideo(itemName) },

    isItemVideo (itemName = this.currentItemName) {
      return (this.getItemData(itemName) || {}).isVideo;
    },

    createLoadItemPromise (itemName = this.currentItemName) {
      return new Promise(
        (resolve) => { this.getItem(itemName).onLoadResolve = resolve },
      );
    },

    clearItemOnLoad (itemName = this.currentItemName) {
      this.getItem(itemName).onLoadResolve = null;
    },

    setItemData (itemName, data) {
      const item = this.getItem(itemName);

      item.onLoadPromise = this.createLoadItemPromise(itemName);

      // To force item.data.src to be always different from previous item
      // even if it is the same item src.
      item.src = `${data.src}?b=${Date.now()}`;
      item.data = data;
    },

    async showNextItem () {
      this.$emit('update:triggerShowNextItem', false);

      if (!this.isTheFirstOneItem) {
        await this.switchItems();
      }

      if (!this.currentItemData) {
        throw new Error(`Missing data for item: ${this.currentItemName}.`);
      }

      await this.getItem(this.currentItemName).onLoadPromise;

      this.$emit('playingNextItem', this.currentItemData);
    },

    pauseItem (itemName = this.currentItemName) {
      if (this.isItemVideo(itemName)) { this.pauseVideo(itemName) }
    },

    playItem (itemName = this.currentItemName) {
      if (this.isItemVideo(itemName)) { this.playVideo(itemName) }
    },

    pauseVideo (itemName = this.currentItemName) { this.getVideoEl(itemName).pause() },

    playVideo (itemName = this.currentItemName) { this.getVideoEl(itemName).play() },

    async switchItems () {
      let animateItemsPromise = Promise.resolve();

      if (this.animateSwitchItems) {
        let currentItemPromiseResolve;

        animateItemsPromise = new Promise(
          (resolveCurrent) => { currentItemPromiseResolve = resolveCurrent },
        );
        const currentItemRef = this.getItemRef(this.currentItemName);

        const onTransitionEndCurrentItem = () => {
          currentItemRef.removeEventListener('transitionend', onTransitionEndCurrentItem);
          currentItemPromiseResolve();
        };

        currentItemRef.addEventListener('transitionend', onTransitionEndCurrentItem, false);
      }

      this.pauseItem();

      this.getItem(this.nextItemName).styles = {
        'z-index': 500,
        opacity: 1,
      };
      this.getItem(this.currentItemName).styles = {
        'z-index': 1,
        opacity: 0,
      };

      await animateItemsPromise;

      this.currentItemName = this.nextItemName;
    },

    onItemLoaded (itemName) {
      this.setItemDataDuration(itemName);
      this.getItem(itemName).onLoad();
    },

    onLoadItem1 () { this.item1.onLoadResolve() },

    onLoadItem2 () { this.item2.onLoadResolve() },

    onClick () { this.$emit('click') },

    onPauseVideo () { this.$emit('pauseVideo') },

    onPlayVideo () { this.$emit('playVideo') },
  },
};
</script>

<style lang="scss" scoped>
.items-player {
  width: 100%;
  height: 100%;
  position: relative;

  .item-ctn {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;

    &.transition {
      transition: opacity 300ms linear;
    }

    .item {
      object-fit: contain;
      width: 100%;
      height: 100%;
      outline: none;
    }

    .item.vid {
      &::-webkit-media-controls-fullscreen-button,
      &::-webkit-media-controls-download-button {
        display: none;
      }
    }
  }
}
</style>
