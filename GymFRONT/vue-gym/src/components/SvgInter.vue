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
};

const rotateIcon = () => {
  rotation.value += 45;
};
</script>

<template>
  <div class="svg-container">
    <div class="svg-inter-card">
      <svg v-if="icon === 'weight'" class="svg-inter-icon animated-icon" :width="size" :height="size"
        viewBox="0 0 100 100" @click="rotateIcon" @mouseover="hoverEffect(true)" @mouseleave="hoverEffect(false)"
        :style="{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }">
        <rect x="20" y="45" width="60" height="10" :fill="iconColor" />
        <rect x="10" y="40" width="8" height="20" :fill="iconColor" />
        <rect x="5" y="35" width="5" height="30" :fill="iconColor" />
        <rect x="82" y="40" width="8" height="20" :fill="iconColor" />
        <rect x="90" y="35" width="5" height="30" :fill="iconColor" />
      </svg>

      <svg v-else-if="icon === 'users'" class="svg-inter-icon animated-icon" :width="size" :height="size"
        viewBox="0 0 100 100" fill="none">
        <circle cx="30" cy="40" r="12" :stroke="iconColor" stroke-width="6" fill="none" />
        <circle cx="70" cy="40" r="12" :stroke="iconColor" stroke-width="6" fill="none" />
        <circle cx="50" cy="60" r="15" :stroke="iconColor" stroke-width="6" fill="none" />
      </svg>

      <svg v-else-if="icon === 'chart'" class="svg-inter-icon animated-icon" :width="chartSize" :height="chartSize"
        viewBox="0 0 100 100" fill="none">
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
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  flex: 1;
  max-width: 650px;
  min-height: 200px;
}

.svg-inter-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.40);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.355);
}

.svg-inter-icon {
  cursor: pointer;
  margin-bottom: 16px;
  width: 64px;
  height: 64px;
  display: flex;
  justify-content: center;
}

.animated-icon {
  transition: transform 0.3s ease, fill 0.3s ease;
}

.animated-icon:hover {
  animation: bounce 0.5s ease infinite alternate;
}

.animated-icon:active {
  transform: scale(0.9);
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-5px);
  }
}

.svg-inter-title {
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.333;
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
