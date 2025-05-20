<!-- src/components/LogroPanel.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useLogrosStore } from '@/stores/logros';
import LogroCard from '@/components/LogroCard.vue';

const props = defineProps<{
  showOnlyUnlocked?: boolean;
  limitPerCategory?: number;
  showProgress?: boolean;
}>();

const logrosStore = useLogrosStore();
const loading = ref(false);
const error = ref('');
const activeCategory = ref('all');

// Categorías disponibles
const categories = computed(() => {
  const cats = new Set<string>();
  
  if (logrosStore.logrosUsuario.length === 0) return ['all'];
  
  // Añadir categoría "Todos"
  cats.add('all');
  
  // Añadir cada categoría única
  logrosStore.logrosUsuario.forEach(logro => {
    cats.add(logro.categoria);
  });
  
  return Array.from(cats);
});

// Logros filtrados por categoría y estado
const filteredLogros = computed(() => {
  let logros = logrosStore.logrosUsuario;
  
  // Filtrar por categoría
  if (activeCategory.value !== 'all') {
    logros = logros.filter(logro => logro.categoria === activeCategory.value);
  }
  // Filtrar por estado de desbloqueo
  if (props.showOnlyUnlocked) {
    logros = logros.filter(logro => logro.desbloqueado);
  }
  
  // Agrupar por categoría
  const categorized = {} as Record<string, typeof logros>;
  
  logros.forEach(logro => {
    if (!categorized[logro.categoria]) {
      categorized[logro.categoria] = [];
    }
    categorized[logro.categoria].push(logro);
  });
  
  // Limitar por categoría si es necesario
  if (props.limitPerCategory) {
    Object.keys(categorized).forEach(category => {
      categorized[category] = categorized[category].slice(0, props.limitPerCategory);
    });
  }
  
  return categorized;
});

// Experiencia y progreso
const experienciaTotal = computed(() => logrosStore.experienciaTotal);
const porcentajeCompletado = computed(() => logrosStore.porcentajeLogrosCompletados);

// Obtener todos los logros al montar
onMounted(async () => {
  try {
    loading.value = true;
    await logrosStore.fetchLogrosUsuario();
    
    // Verificar logros automáticamente
    await logrosStore.verificarLogros();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar logros';
    console.error('Error al cargar logros:', e);
  } finally {
    loading.value = false;
  }
});

// Cambiar categoría activa
const setActiveCategory = (category: string) => {
  activeCategory.value = category;
};

// Obtener icono para la categoría
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'all': return 'mdi-medal-outline';
    case 'entrenamiento': return 'mdi-dumbbell';
    case 'racha': return 'mdi-calendar-check';
    case 'dificultad': return 'mdi-fire';
    case 'rol': return 'mdi-shield-account';
    case 'secreto': return 'mdi-lock';
    default: return 'mdi-trophy-outline';
  }
};

// Obtener nombre para la categoría
const getCategoryName = (category: string) => {
  if (category === 'all') return 'Todos';
  return category.charAt(0).toUpperCase() + category.slice(1);
};
</script>

<template>
  <div class="logro-panel">
    <!-- Resumen -->
    <div class="logro-summary mb-4">
      <v-card elevation="2" class="summary-card">
        <v-card-text>
          <div class="d-flex justify-space-between align-center">
            <div class="summary-section">
              <div class="text-h4 font-weight-bold">{{ experienciaTotal }}</div>
              <div class="text-caption text-medium-emphasis">Puntos XP Totales</div>
            </div>
            
            <v-divider vertical></v-divider>
            
            <div class="summary-section text-center">
              <v-progress-circular
                :model-value="porcentajeCompletado"
                color="primary"
                :width="5"
                size="64"
              >
                {{ porcentajeCompletado }}%
              </v-progress-circular>
              <div class="text-caption text-medium-emphasis mt-1">Logros Completados</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
    
    <!-- Filtros de categoría -->
    <div class="category-filters mb-4">
      <v-sheet class="mx-auto" rounded>
        <v-chip-group 
          v-model="activeCategory" 
          :items="categories" 
          mandatory 
          item-value="category" 
          selected-class="primary"
          class="category-chip-group"
        >
          <v-chip 
            v-for="category in categories" 
            :key="category" 
            :value="category" 
            @click="setActiveCategory(category)"
            :prepend-icon="getCategoryIcon(category)"
            variant="elevated"
            closable
            color="primary"
            class="category-chip"
          >
            {{ getCategoryName(category) }}
          </v-chip>
        </v-chip-group>
      </v-sheet>
    </div>
    
    <!-- Loading state -->
    <v-card v-if="loading" class="pa-4 text-center">
      <v-progress-circular indeterminate color="primary" class="ma-4"></v-progress-circular>
      <div class="text-body-1">Cargando logros...</div>
    </v-card>
    
    <!-- Error state -->
    <v-alert v-else-if="error" type="error" border="start" class="mb-4">
      {{ error }}
    </v-alert>
    
    <!-- Contenido principal -->
    <template v-else>
      <!-- Si no hay logros -->
      <v-card v-if="Object.keys(filteredLogros).length === 0" class="pa-4 text-center">
        <v-icon size="64" color="grey-lighten-1">mdi-trophy-outline</v-icon>
        <div class="text-h6 mt-2">No hay logros disponibles</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          {{ showOnlyUnlocked ? 'Aún no has desbloqueado ningún logro en esta categoría.' : 'No hay logros en esta categoría.' }}
        </div>
      </v-card>
      
      <!-- Tarjetas de logros por categoría -->
      <template v-else>
        <div 
          v-for="(logros, category) in filteredLogros" 
          :key="category"
          class="logro-category-section mb-6"
        >
          <h3 v-if="activeCategory === 'all'" class="category-title mb-3">
            <v-icon :icon="getCategoryIcon(category)" class="mr-2"></v-icon>
            {{ getCategoryName(category) }}
          </h3>
          
          <v-row>
            <v-col 
              v-for="logro in logros" 
              :key="logro.logroID"
              cols="12" 
              sm="6" 
              md="4" 
              lg="3"
              class="logro-col"
            >
              <LogroCard :logro="logro" :show-progress="showProgress" />
            </v-col>
          </v-row>
        </div>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.logro-panel {
  width: 100%;
}

.summary-card {
  border-radius: $border-radius;
  background-color: white;
  
  .summary-section {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    
    .text-h4 {
      color: $primary-color;
      font-family: $font-family-base;
    }
  }
}

.category-filters {
  overflow-x: auto;
  padding: 4px 0;
  
  .category-chip-group {
    display: flex;
    flex-wrap: nowrap;
    padding: 8px 4px;
  }
  
  .category-chip {
    margin: 4px;
    font-family: $font-family-base;
    font-weight: 500;
  }
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $secondary-color;
  font-family: $font-family-base;
  border-left: 4px solid $primary-color;
  padding-left: 12px;
  display: flex;
  align-items: center;
}

.logro-col {
  padding: 8px;
}

// Optimizaciones para móvil
@media (max-width: 600px) {
  .summary-card {
    .summary-section {
      .text-h4 {
        font-size: 1.5rem !important;
      }
    }
  }
  
  .category-title {
    font-size: 1.1rem;
  }
  
  .category-filters {
    .category-chip {
      font-size: 0.85rem;
    }
  }
}
</style>