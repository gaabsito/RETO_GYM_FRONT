<!-- src/components/LogroCard.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import type { UsuarioLogro } from '@/types/Logro';

const props = defineProps<{
  logro: UsuarioLogro;
  showProgress?: boolean;
}>();

// Calcular porcentaje de progreso
const progressPercentage = computed(() => {
  if (props.logro.valorMeta === 0) return 0;
  return Math.min(100, Math.round((props.logro.progresoActual / props.logro.valorMeta) * 100));
});

// Formatear fecha
const formattedDate = computed(() => {
  if (!props.logro.fechaDesbloqueo) return '';
  
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(props.logro.fechaDesbloqueo);
});
</script>

<template>
  <v-card 
    class="logro-card" 
    :class="{ 'logro-desbloqueado': logro.desbloqueado, 'logro-bloqueado': !logro.desbloqueado }" 
    :color="logro.desbloqueado ? undefined : 'grey-lighten-3'"
    elevation="2"
  >
    <!-- Cabecera -->
    <div class="logro-header" :style="{ backgroundColor: logro.color + '22' }">
      <v-avatar :color="logro.desbloqueado ? logro.color : 'grey'" size="48" class="logro-icon">
        <v-icon size="24" :color="logro.desbloqueado ? 'white' : 'grey-darken-1'">{{ logro.icono }}</v-icon>
      </v-avatar>
      
      <div class="logro-title-container">
        <div class="logro-title" :class="{ 'text-grey': !logro.desbloqueado }">
          {{ logro.nombre }}
        </div>
        <div class="logro-category">
          <v-chip size="x-small" :color="logro.desbloqueado ? logro.color : 'grey'" variant="outlined">
            {{ logro.categoria }}
          </v-chip>
          <v-chip v-if="logro.desbloqueado" size="x-small" color="primary" class="ml-1">
            +{{ logro.experiencia }} XP
          </v-chip>
        </div>
      </div>
    </div>
    
    <!-- Contenido -->
    <v-card-text class="logro-content">
      <p class="logro-description" :class="{ 'text-grey': !logro.desbloqueado }">
        {{ logro.descripcion }}
      </p>
      
      <!-- Mostrar progreso solo si se indica en props -->
      <div v-if="showProgress" class="logro-progress mt-2">
        <div class="d-flex justify-space-between">
          <span class="text-caption">Progreso</span>
          <span class="text-caption font-weight-medium">{{ logro.progresoActual }}/{{ logro.valorMeta }}</span>
        </div>
        <v-progress-linear 
          :model-value="progressPercentage" 
          :color="logro.desbloqueado ? logro.color : 'grey'" 
          height="6"
          rounded
        ></v-progress-linear>
      </div>
      
      <!-- Fecha de desbloqueo (solo si está desbloqueado) -->
      <div v-if="logro.desbloqueado && logro.fechaDesbloqueo" class="logro-date mt-2">
        <v-icon size="small" color="grey-darken-1">mdi-calendar-check</v-icon>
        <span class="text-caption ml-1">Desbloqueado: {{ formattedDate }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.logro-card {
  border-radius: $border-radius;
  overflow: hidden;
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.logro-bloqueado {
    .logro-icon, .logro-title, .logro-description {
      filter: grayscale(100%);
    }
  }
}

.logro-header {
  display: flex;
  align-items: center;
  padding: 16px;
  
  .logro-icon {
    margin-right: 16px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
  
  .logro-title-container {
    flex: 1;
    
    .logro-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 4px;
      font-family: $font-family-base;
    }
    
    .logro-category {
      display: flex;
      align-items: center;
    }
  }
}

.logro-content {
  padding: 16px;
  
  .logro-description {
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 0;
    font-family: $font-family-text;
    color: rgba(0, 0, 0, 0.7);
  }
  
  .logro-date {
    display: flex;
    align-items: center;
    color: rgba(0, 0, 0, 0.6);
  }
}

// Mobile optimizations
@media (max-width: 600px) {
  .logro-header {
    padding: 12px;
    
    .logro-icon {
      margin-right: 12px;
    }
    
    .logro-title-container {
      .logro-title {
        font-size: 1rem;
      }
    }
  }
  
  .logro-content {
    padding: 12px;
    
    .logro-description {
      font-size: 0.85rem;
    }
  }
}
</style>