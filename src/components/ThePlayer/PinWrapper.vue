<template>
  <div
    :class="['pin-wrapper', {
      pined: isPined
    }]"
    @mouseover="$emit('mouseover', $event)"
    @mouseout="$emit('mouseout', $event)"
  >
    <v-btn
      :class="['pin-icon', positionClasses.join(' ')]"
      icon
      small
      @click="$emit('click')"
    >
      <v-icon
        small
        class="icon"
      >
        {{ isPined ? 'mdi-pin-outline' : 'mdi-pin-off-outline' }}
      </v-icon>
    </v-btn>
    <slot />
  </div>
</template>

<script>
// TODO: ENH: Add possiblity to set the location offset (left: -30px, top: 50px)
export default {
  name: 'PinWrapper',

  props: {
    isPined: {
      type: Boolean,
      default: false,
    },

    iconPosition: {
      type: String,
      default: 'bottom right',
    },
  },

  emits: {
    click: null,
    mouseover: null,
    mouseout: null,
  },

  data: () => ({}),

  computed: {
    positionClasses () {
      const classes = [];
      if (this.iconPosition.includes('top')) { classes.push('pos-top') }
      if (this.iconPosition.includes('bottom')) { classes.push('pos-bottom') }
      if (this.iconPosition.includes('right')) { classes.push('pos-right') }
      if (this.iconPosition.includes('left')) { classes.push('pos-left') }
      return classes;
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
.pin-wrapper {
  $pin-icon-size: 28px;

  &:hover {
    .pin-icon {
      display: block;
    }
  }

  &.pined {
    .pin-icon {
      display: block;
      transform: scale(0.7);
      color: $grey-6;

      &:hover {
        transform: scale(1);
        color: $grey-5;
      }
    }
  }

  .pin-icon {
    display: none;
    position: absolute;
    cursor: pointer;
    z-index: 1000;
    opacity: 0.6;

    &:hover {
      opacity: 1;
    }

    &.pos-top {
      top: -$pin-icon-size / 2;
    }

    &.pos-bottom {
      bottom: -$pin-icon-size / 2;
    }

    &.pos-right {
      right: -$pin-icon-size / 2;
    }

    &.pos-left {
      left: -$pin-icon-size / 2;
    }

    &.pos-top.pos-right .icon {
      transform: rotate(45deg);
    }

    &.pos-top.pos-left .icon {
      transform: rotate(-45deg);
    }

    &.pos-bottom.pos-left .icon {
      transform: rotate(225deg);
    }

    &.pos-bottom.pos-right .icon {
      transform: rotate(135deg);
    }

    &.pose .icon {
      transform: rotate(45deg);
      color: $grey-5;
    }
  }
}
</style>
