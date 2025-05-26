<!-- src/components/LogrosSummaryCard.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useLogrosStore } from '@/stores/logros';
import { useRouter } from 'vue-router';

// Propiedades
const props = defineProps<{
  showLatestOnly?: boolean;
  maxLogros?: number;
}>();

const logrosStore = useLogrosStore();
const router = useRouter();
const loading = ref(false);
const error = ref('');

// Obtener datos al montar
onMounted(async () => {
  try {
    loading.value = true;
    if (props.showLatestOnly) {
      await logrosStore.fetchLogrosRecientes(props.maxLogros || 3);
    } else {
      await logrosStore.fetchLogrosUsuario();
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar logros';
  } finally {
    loading.value = false;
  }
});

// Logros a mostrar (recientes o todos)
const logrosToShow = computed(() => {
  if (props.showLatestOnly) {
    return logrosStore.logrosRecientes;
  } else {
    return logrosStore.logrosUsuario
      .filter(l => l.desbloqueado)
      .sort((a, b) => {
        // Ordenar por fecha de desbloqueo si existe
        if (a.fechaDesbloqueo && b.fechaDesbloqueo) {
          return b.fechaDesbloqueo.getTime() - a.fechaDesbloqueo.getTime();
        }
        return 0;
      })
      .slice(0, props.maxLogros || 3);
  }
});

// Total de logros desbloqueados
const totalDesbloqueados = computed(() => {
  return logrosStore.logrosUsuario.filter(l => l.desbloqueado).length;
});

// Total de logros disponibles
const totalLogros = computed(() => {
  return logrosStore.logrosUsuario.length;
});

// Ver todos los logros
const verTodosLogros = () => {
  router.push('/logros');
};

// Formatear fecha
const formatearFecha = (fecha?: Date) => {
  if (!fecha) return '';
  
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(fecha);
};
</script>

<template>
  <v-card class="logros-summary">
    <!-- Cabecera -->
    <v-card-title class="card-title">
      <v-icon start>mdi-trophy</v-icon>
      Logros
      <v-spacer></v-spacer>
      <v-chip color="primary" size="small">
        {{ totalDesbloqueados }}/{{ totalLogros }}
      </v-chip>
    </v-card-title>
    
    <v-divider></v-divider>
    
    <!-- Estado de carga -->
    <div v-if="loading" class="d-flex justify-center align-center py-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    
    <!-- Error -->
    <v-alert v-else-if="error" type="error" class="ma-4" variant="tonal" density="compact">
      {{ error }}
    </v-alert>
    
    <!-- Sin logros -->
    <v-card-text v-else-if="logrosToShow.length === 0" class="text-center py-8">
      <v-icon size="48" color="grey-lighten-1">mdi-trophy-outline</v-icon>
      <p class="text-body-1 mt-2">Aún no has desbloqueado ningún logro</p>
      <v-btn color="primary" variant="text" @click="verTodosLogros" class="mt-2">
        Descubrir Logros
      </v-btn>
    </v-card-text>
    
    <!-- Lista de logros -->
    <v-card-text v-else class="pa-0">
      <v-list class="logros-list">
        <v-list-item
          v-for="logro in logrosToShow"
          :key="logro.logroID"
          :prepend-avatar="logro.icono"
          :prepend-icon="logro.icono"
          class="logro-item"
        >
          <template v-slot:prepend>
            <v-avatar :color="logro.color" size="36" class="mr-2">
              <v-icon color="white" size="18">{{ logro.icono }}</v-icon>
            </v-avatar>
          </template>
          
          <v-list-item-title class="logro-title">{{ logro.nombre }}</v-list-item-title>
          
          <v-list-item-subtitle class="logro-subtitle d-flex align-center">
            <v-icon size="small" color="grey" class="mr-1">mdi-calendar-check</v-icon>
            {{ formatearFecha(logro.fechaDesbloqueo) }}
          </v-list-item-subtitle>
          
          <template v-slot:append>
            <v-chip size="x-small" color="primary">+{{ logro.experiencia }} XP</v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
    
    <!-- Botón para ver todos -->
    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn color="primary" variant="text" @click="verTodosLogros">
        Ver todos los logros
        <v-icon end>mdi-arrow-right</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.logros-summary {
  border-radius: $border-radius;
  overflow: hidden;
}

.card-title {
  background-color: $primary-color;
  color: white;
  font-family: $font-family-base;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.logros-list {
  .logro-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
    
    .logro-title {
      font-weight: 500;
      font-family: $font-family-base;
    }
    
    .logro-subtitle {
      font-size: 0.8rem;
      opacity: 0.7;
    }
  }
}

// Mobile optimizations
@media (max-width: 600px) {
  .card-title {
    padding: 12px 16px;
    font-size: 1.1rem;
  }
  
  .logros-list {
    .logro-item {
      padding: 8px 12px;
      
      .logro-title {
        font-size: 0.9rem;
      }
    }
  }
}
</style>