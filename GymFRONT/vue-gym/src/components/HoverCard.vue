<script setup lang="ts">
defineProps<{
  title: string
  description: string
  icon?: string
  iconColor?: string
}>()
</script>

<template>
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <v-card v-bind="hoverProps" :elevation="isHovering ? 12 : 2" class="hover-card transition-swing pa-6 h-100">
      <div class="d-flex flex-column align-center">
        <v-icon v-if="icon" :icon="icon" size="64" :color="iconColor || 'primary'" class="mb-4"></v-icon>
        <h3 class="text-h5 mb-4">{{ title }}</h3>
        <p class="text-body-1 text-center">{{ description }}</p>
        <slot name="extra-content"></slot>
      </div>
    </v-card>
  </v-hover>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.hover-card {
  border-radius: $border-radius;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.text-h5 {
  font-family: $font-family-base;
}

.text-body-1 {
  font-family: $font-family-text;
  line-height: 1.6;
}
</style>