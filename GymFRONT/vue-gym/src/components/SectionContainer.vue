<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  backgroundColor?: string
}>()
</script>

<template>
  <v-container class="section-container" :style="{ backgroundColor }">
    <div v-if="title || subtitle" class="text-center section-header">
      <h2 v-if="title" class="text-h4 mb-4">{{ title }}</h2>
      <p v-if="subtitle" class="text-body-1 mx-auto section-subtitle">{{ subtitle }}</p>
    </div>
    <slot></slot>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.section-container {
  padding: 2rem !important;
  margin-bottom: 2rem;
  border-radius: $border-radius;
}

.section-header {
  margin-bottom: 2.5rem;
}

.section-subtitle {
  max-width: 800px;
  font-family: $font-family-text;
  opacity: 0.85;
  line-height: 1.6;
}

h2 {
  font-family: $font-family-base;
}

@media (max-width: 600px) {
  .section-container {
    padding-top: 2rem !important;
    padding-bottom: 2rem !important;
  }
  
  .section-header {
    margin-bottom: 1.5rem;
  }
}
</style>