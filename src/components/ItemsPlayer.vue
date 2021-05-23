<template>
  <div
    class="items-player"
    @click="onClick"
  >
    <div
      v-for="(item, i) in getItems()"
      :key="getItemName(i)"
      :ref="getItemName(i)"
      :class="['item-ctn', getItemName(i), {
        transition: switchWithTransition
      }]"
      :style="item.styles"
    >
      <img
        v-if="item.src && (item.data || {}).isImage"
        :src="item.src"
        class="item img"
        draggable="false"
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
import { deepClone } from '../utils/utils';

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
    muteVideo: {
      type: Boolean,
      default: true,
    },
  },

  emits: {
    click: null,
    'video:pause': null,
    'video:play': null,
  },

  data: () => ({
    item1: {
      name: 'item1',
      src: '',
      data: undefined,
      styles: { opacity: 1, 'z-index': 2 },
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
    switchWithTransition: false,
  }),

  computed: {
    currentItemData () { return this[this.currentItemName].data },

    nextItemName () { return this.currentItemName === 'item1' ? 'item2' : 'item1' },
  },

  mounted () {
    this.$set(this.item1, 'onLoad', this.onLoadItem1);
    this.$set(this.item2, 'onLoad', this.onLoadItem2);
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

    /**
     * @public
     */
    getItemDuration (itemName = this.currentItemName) {
      let duration = 0;

      if (this.isItemVideo(itemName)) {
        const videoEl = this.getVideoEl(itemName);
        duration = (videoEl.duration || 0) * 1000;
      }

      return duration;
    },

    getCurrentItemSrc () { return this.currentItemData.src },

    isItemImage (itemName = this.currentItemName) { return !this.isItemVideo(itemName) },

    isItemVideo (itemName = this.currentItemName) {
      return this.getItemData(itemName)?.isVideo || false;
    },

    createLoadItemPromise (itemName = this.currentItemName) {
      return new Promise(
        (resolve) => { this.$set(this.getItem(itemName), 'onLoadResolve', resolve) },
      );
    },

    resetItem (itemName) {
      const item = this.getItem(itemName);
      this.$set(item, 'src', '');
      this.$set(item, 'data', undefined);
    },

    setItemData (itemName, data) {
      const item = this.getItem(itemName);

      this.$set(item, 'onLoadPromise', this.createLoadItemPromise(itemName));

      // To force item.data.src to be always different from previous item
      // even if it is the same item src.
      this.$set(item, 'src', `${data.src}?b=${Date.now()}`);

      this.$set(item, 'data', deepClone(data));
    },

    setNextItemData (data) {
      this.isTheFirstOneItem = !this.currentItemData && !this.getItemData(this.nextItemName);

      this.setItemData(
        this.isTheFirstOneItem ? this.currentItemName : this.nextItemName,
        data,
      );
    },

    /**
     * @public
     */
    async showNextItem (itemData, { animate = false } = {}) {
      // Next item will start to load.
      this.setNextItemData(itemData);

      // Next tick need to have time to set itemData before applying switching items.
      await this.$nextTick();

      await this.getItem(this.nextItemName).onLoadPromise;

      if (!this.isTheFirstOneItem) {
        await this.switchItems({ animate });
        this.resetItem(this.nextItemName);
      }
    },

    /**
     * @public
     */
    pauseItem (itemName = this.currentItemName) {
      if (this.isItemVideo(itemName)) { this.pauseVideo(itemName) }
    },

    /**
     * @public
     */
    playItem (itemName = this.currentItemName) {
      if (this.isItemVideo(itemName)) { this.playVideo(itemName) }
    },

    pauseVideo (itemName = this.currentItemName) { this.getVideoEl(itemName).pause() },

    playVideo (itemName = this.currentItemName) { this.getVideoEl(itemName).play() },

    async switchItems ({ animate = false } = {}) {
      this.switchWithTransition = animate;
      let animateItemsPromise = Promise.resolve();

      if (animate) {
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

      this.pauseItem(this.currentItemName);

      this.$set(
        this.getItem(this.nextItemName),
        'styles',
        { opacity: 1, 'z-index': 2 },
      );

      this.$set(
        this.getItem(this.currentItemName),
        'styles',
        { opacity: 0, 'z-index': 1 },
      );

      await animateItemsPromise;

      this.currentItemName = this.nextItemName;
    },

    onItemLoaded (itemName) { this.getItem(itemName).onLoad() },

    onLoadItem1 () { this.item1.onLoadResolve() },

    onLoadItem2 () { this.item2.onLoadResolve() },

    onClick () { this.$emit('click') },

    onPauseVideo () { this.$emit('video:pause') },

    onPlayVideo () { this.$emit('video:play') },
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
