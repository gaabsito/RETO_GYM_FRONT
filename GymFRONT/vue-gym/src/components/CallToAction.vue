<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
}>()
</script>

<template>
  <v-container class="cta-section">
    <v-row align="center" justify="center" class="cta-row">
      <v-col cols="12" md="8" class="text-center">
        <h2 class="text-h4 text-white mb-6">
          {{ title }}
        </h2>
        <p class="text-h6 font-weight-regular text-white mb-6">
          {{ subtitle }}
        </p>
        <v-btn size="x-large" :to="buttonLink" class="cta-button">
          {{ buttonText }}
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.cta-section {
  background-color: black;
  border-radius: $border-radius;
  margin-bottom: 2rem;
  width: 100%;
}

.cta-row {
  padding: 2rem 0 !important;
}

.v-btn {
  padding-right: 1rem !important;
  padding-left: 1rem !important;
}

.cta-button {
  color: $primary-color;
  font-family: $font-family-base;
  
  &:hover {
    transform: translateY(-2px);
  }
}

.v-col-md-8 {
  padding-top: 2rem !important;
  padding-bottom: 2rem !important;
}
</style>