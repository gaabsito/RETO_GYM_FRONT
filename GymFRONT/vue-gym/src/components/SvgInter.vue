<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: String,
  text: String,
  icon: String
});

const size = ref(60);
const chartSize = ref(50);
const isHovered = ref(false);
const rotation = ref(0);
const iconColor = ref('#333');

const hoverEffect = (state) => {
  isHovered.value = state;
  iconColor.value = state ? '#ff5733' : '#333';
};

const rotateIcon = () => {
  rotation.value += 45;
};
</script>

<template>
  <div class="svg-container">
    <div class="svg-inter-card">
      <svg v-if="icon === 'weight'"
        class="svg-inter-icon"
        :width="size"
        :height="size"
        viewBox="0 0 100 100"
        @click="rotateIcon"
        @mouseover="hoverEffect(true)"
        @mouseleave="hoverEffect(false)"
        :style="{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }"
      >
        <rect x="20" y="45" width="60" height="10" :fill="iconColor" />
        <rect x="10" y="40" width="8" height="20" :fill="iconColor" />
        <rect x="5" y="35" width="5" height="30" :fill="iconColor" />
        <rect x="82" y="40" width="8" height="20" :fill="iconColor" />
        <rect x="90" y="35" width="5" height="30" :fill="iconColor" />
      </svg>
      
      <svg v-else-if="icon === 'users'" class="svg-inter-icon" :width="size" :height="size" viewBox="0 0 100 100" fill="none">
        <circle cx="30" cy="40" r="12" :stroke="iconColor" stroke-width="6" fill="none" />
        <circle cx="70" cy="40" r="12" :stroke="iconColor" stroke-width="6" fill="none" />
        <circle cx="50" cy="60" r="15" :stroke="iconColor" stroke-width="6" fill="none" />
      </svg>
      
      <svg v-else-if="icon === 'chart'" class="svg-inter-icon" :width="chartSize" :height="chartSize" viewBox="0 0 100 100" fill="none">
        <polyline points="10,75 40,55 70,65 90,35" :stroke="iconColor" stroke-width="6" fill="none" />
        <line x1="10" y1="85" x2="10" y2="15" :stroke="iconColor" stroke-width="6" />
        <line x1="10" y1="85" x2="90" y2="85" :stroke="iconColor" stroke-width="6" />
      </svg>
      
      <h3 class="svg-inter-title">{{ title }}</h3>
      <p class="svg-inter-text">{{ text }}</p>
    </div>
  </div>
</template>

<style scoped>
.svg-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.svg-inter-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px; /* Igual que los v-card */
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
  transition: transform 0.3s ease;
  flex: 1;
  max-width: 650px; /* Aumenta el ancho para que sea similar */
  min-height: 200px; /* Ajusta la altura */
}

.svg-inter-card:hover {
  transform: scale(1.05);
}

.svg-inter-icon {
  cursor: pointer;
  margin-bottom: 16px; /* Aumenta el margen inferior */
  width: 64px; /* Ajusta el tamaño del ícono */
  height: 64px;
  display: flex;
  justify-content: center;
}


.svg-inter-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.svg-inter-text {
  font-size: 1rem;
  color: #666;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

@media (max-width: 768px) {
  .svg-container {
    flex-direction: column;
  }
}
</style>
