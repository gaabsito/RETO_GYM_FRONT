<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  backgroundImage?: string
}>()
</script>

<template>
  <v-parallax :src="backgroundImage" class="align-center justify-center page-header">
    <div class="d-flex flex-column fill-height justify-center align-center text-white text-center">
      <h1 class="text-h2 font-weight-bold mb-4">{{ title }}</h1>
      <h2 v-if="subtitle" class="text-h5 mb-6">
        {{ subtitle }}
      </h2>
      <slot></slot>
    </div>
  </v-parallax>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.page-header {
  position: relative;
  height: 400px;
  border-radius: $border-radius;
  margin-bottom: 2rem;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
    border-radius: $border-radius;
  }

  .d-flex {
    position: relative;
    z-index: 2;
  }
}

.text-h2 {
  font-family: $font-family-base;
  text-transform: uppercase;
}

.text-h5 {
  font-family: $font-family-text;
}
</style>