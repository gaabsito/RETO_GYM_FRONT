<script setup lang="ts">
defineProps<{
  name: string
  position: string
  description: string
  image: string
}>()
</script>

<template>
  <v-hover v-slot="{ isHovering, props: hoverProps }">
    <v-card v-bind="hoverProps" :elevation="isHovering ? 12 : 2" class="team-card h-100">
      <div class="d-flex flex-column align-center pa-6">
        <v-avatar size="120" class="mb-4">
          <v-img :src="image" cover></v-img>
        </v-avatar>
        <h3 class="text-h5 mb-2">{{ name }}</h3>
        <p class="text-subtitle-1 mb-4 primary--text">{{ position }}</p>
        <p class="text-body-1 text-center">{{ description }}</p>
      </div>
    </v-card>
  </v-hover>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.team-card {
  border-radius: $border-radius;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }

  .v-avatar {
    border: 3px solid $primary-color;
  }
}

.primary--text {
  color: $primary-color !important;
}

h3 {
  font-family: $font-family-base;
}

.text-body-1 {
  font-family: $font-family-text;
}
</style>