<script setup lang="ts">
import { defineProps, ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { Workout } from '@/types/Workout';
import WorkoutCard from '@/components/WorkoutCard.vue';
  
const props = defineProps<{ workouts: Workout[] }>();
const currentIndex = ref(0);
const autoplayInterval = ref<number | null>(null);
const isTransitioning = ref(false);
const trackRef = ref<HTMLElement | null>(null);

// Crear un array reactivo que podamos extender dinámicamente
const extendedWorkouts = ref<Workout[]>([]);

// Inicializar el array extendido
const initializeExtendedWorkouts = () => {
  if (!props.workouts.length) {
    extendedWorkouts.value = [];
    return;
  }
  // Iniciar con varias copias para permitir scroll en ambas direcciones
  extendedWorkouts.value = [...props.workouts, ...props.workouts, ...props.workouts, ...props.workouts, ...props.workouts];
};

// Display index for indicators - siempre muestra la posición correcta independientemente de cuántas copias tengamos
const realIndex = computed(() => {
  if (!props.workouts.length) return 0;
  // Usar módulo para obtener el índice real entre 0 y workouts.length-1
  return Math.abs(currentIndex.value % props.workouts.length);
});

// Autoplay functionality
const startAutoplay = () => {
  stopAutoplay(); // Clear any existing interval first
  autoplayInterval.value = window.setInterval(() => {
    goToNext();
  }, 4000); // Change slide every 4 seconds
};

const stopAutoplay = () => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
    autoplayInterval.value = null;
  }
};

// Initialize the carousel at the middle of the extended workouts
onMounted(() => {
  initializeExtendedWorkouts();
  
  if (props.workouts.length > 1) {
    // Comenzar en medio del array extendido para permitir scroll infinito en ambas direcciones
    currentIndex.value = Math.floor(extendedWorkouts.value.length / 2);
    startAutoplay();
  }
});

const goToNext = () => {
  if (isTransitioning.value || !props.workouts.length) return;
  
  isTransitioning.value = true;
  currentIndex.value++;
  
  // Si hemos llegado cerca del final del array extendido, añadir más slides
  if (currentIndex.value >= extendedWorkouts.value.length - props.workouts.length) {
    // Si nos acercamos al final, agregar más copias para asegurar scroll infinito
    extendedWorkouts.value = [...extendedWorkouts.value, ...props.workouts];
  }
  
  setTimeout(() => {
    isTransitioning.value = false;
  }, 500);
};

const goToPrev = () => {
  if (isTransitioning.value || !props.workouts.length) return;
  
  // Si estamos cerca del inicio, agregar más slides al principio y ajustar el índice
  if (currentIndex.value <= props.workouts.length) {
    const newSlides = [...props.workouts];
    extendedWorkouts.value = [...newSlides, ...extendedWorkouts.value];
    // Ajustar el índice actual para compensar los nuevos slides añadidos al principio
    currentIndex.value += props.workouts.length;
  }
  
  isTransitioning.value = true;
  currentIndex.value--;
  
  setTimeout(() => {
    isTransitioning.value = false;
  }, 500);
};

const goToSlide = (index: number) => {
  if (isTransitioning.value || realIndex.value === index) return;
  
  isTransitioning.value = true;
  
  // Calculate the nearest occurrence of this index in our extended array
  // This prevents unnecessary scrolling
  const currentSet = Math.floor(currentIndex.value / props.workouts.length);
  currentIndex.value = (currentSet * props.workouts.length) + index;
  
  setTimeout(() => {
    isTransitioning.value = false;
  }, 500);
};

onBeforeUnmount(() => {
  stopAutoplay();
});
</script>

<template>
  <div class="fitness-carousel-container">
    <h2 class="carousel-title"></h2>
    
    <div v-if="workouts.length" class="fitness-carousel">
      <!-- Main carousel display with true infinite loop -->
      <div 
        ref="trackRef" 
        class="carousel-track" 
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div 
          v-for="(workout, index) in extendedWorkouts" 
          :key="`${workout.entrenamientoID}-${index}`" 
          class="carousel-slide"
        >
          <div class="workout-card-wrapper">
            <WorkoutCard :workout="workout" class="workout-card" />
          </div>
        </div>
      </div>
      
      <!-- Navigation arrows with orange background -->
      <button 
        class="carousel-arrow prev" 
        @click="goToPrev" 
        @mouseenter="stopAutoplay" 
        @mouseleave="startAutoplay" 
        :disabled="isTransitioning"
      >
        <div class="arrow-circle">
          <v-icon>mdi-chevron-left</v-icon>
        </div>
      </button>
      <button 
        class="carousel-arrow next" 
        @click="goToNext" 
        @mouseenter="stopAutoplay" 
        @mouseleave="startAutoplay" 
        :disabled="isTransitioning"
      >
        <div class="arrow-circle">
          <v-icon>mdi-chevron-right</v-icon>
        </div>
      </button>
      
      <!-- Dot indicators matching the reference image -->
      <div class="carousel-indicators">
        <button 
          v-for="index in workouts.length" 
          :key="index - 1" 
          class="indicator-dot" 
          :class="{ active: realIndex === (index - 1) }"
          @click="goToSlide(index - 1)"
          @mouseenter="stopAutoplay"
          @mouseleave="startAutoplay"
        ></button>
      </div>
    </div>

    <!-- Loading state -->
    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </v-col>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>
.fitness-carousel-container {
  margin: 2rem 0;
  position: relative;
  padding: 0;
  max-width: 100%;
  overflow: hidden;
  background-color: #f9f9f9;
}

.carousel-title {
  text-align: center;
  font-weight: 700;
  font-size: 1.75rem;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #333;
  padding-top: 1.5rem;
}

.fitness-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding-bottom: 3rem;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  height: 100%;
  will-change: transform;
}

.carousel-slide {
  min-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 1rem;
  box-sizing: border-box;
}

.workout-card-wrapper {
  width: 90%;
  max-width: 450px;
  margin: 0 auto;
}

.workout-card {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.carousel-arrow {
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
  background: none;
  border: none;
  z-index: 10;
  cursor: pointer;
  padding: 0;
  
  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
  
  &.prev {
    left: 15px;
  }
  
  &.next {
    right: 15px;
  }

  .arrow-circle {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    
    &:hover {
      background-color: #ff5722; // Orange accent color
      color: white;
    }
  }
}

.carousel-indicators {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 10;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ddd;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0.7;
  
  &.active {
    background-color: #ff5722; // Orange accent color
    opacity: 1;
  }
}

// Make next button orange to match reference image
.carousel-arrow.next .arrow-circle {
  background-color: #ff5722;
  color: white;
}

// Responsive adjustments
@media (max-width: 768px) {
  .carousel-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .workout-card-wrapper {
    width: 95%;
  }
  
  .carousel-indicators {
    bottom: 12px;
  }
  
  .carousel-arrow {
    .arrow-circle {
      width: 40px;
      height: 40px;
    }
  }
}
</style>