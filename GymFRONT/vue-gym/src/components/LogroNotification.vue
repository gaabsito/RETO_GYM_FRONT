<!-- src/components/LogroNotification.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import type { UsuarioLogro } from '@/types/Logro';
import { useLogrosStore } from '@/stores/logros';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:show', value: boolean): void; // Añadir evento para actualizar show
}>();

// Variable local para la visibilidad del diálogo
const dialogVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

const logrosStore = useLogrosStore();
const logrosRecientes = ref<UsuarioLogro[]>([]);
const currentLogroIndex = ref(0);
const loading = ref(false);

// Cargar logros recientes
const loadLogrosRecientes = async () => {
  try {
    loading.value = true;
    const recientes = await logrosStore.fetchLogrosRecientes(5);
    logrosRecientes.value = recientes.filter(l => l.desbloqueado);
    currentLogroIndex.value = 0;
  } catch (error) {
    console.error('Error al cargar logros recientes:', error);
  } finally {
    loading.value = false;
  }
};

// Avanzar al siguiente logro
const nextLogro = () => {
  if (currentLogroIndex.value < logrosRecientes.value.length - 1) {
    currentLogroIndex.value++;
  } else {
    closeNotification();
  }
};

// Cerrar notificación
const closeNotification = () => {
  emit('close');
  emit('update:show', false);
};

// Obtener logro actual
const currentLogro = computed(() => {
  if (logrosRecientes.value.length === 0) return null;
  return logrosRecientes.value[currentLogroIndex.value];
});

// Escuchar cambios en prop show
watch(() => props.show, (newValue) => {
  if (newValue) {
    loadLogrosRecientes();
  }
});

// Al montar el componente
onMounted(() => {
  if (props.show) {
    loadLogrosRecientes();
  }
});
</script>

<template>
  <v-dialog 
    :model-value="dialogVisible" 
    @update:model-value="(val) => emit('update:show', val)"
    max-width="400" 
    persistent 
    transition="dialog-bottom-transition"
  >
    <v-card v-if="currentLogro" class="logro-notification">
      <!-- Cabecera -->
      <v-card-title class="logro-notification-title" :style="{ backgroundColor: currentLogro.color }">
        <v-icon size="28" color="white" class="mr-2">mdi-trophy</v-icon>
        <span class="text-white">¡Logro Desbloqueado!</span>
        <v-spacer></v-spacer>
        <v-btn icon size="small" @click="closeNotification" variant="text" color="white">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text class="py-6">
        <div class="text-center">
          <!-- Icono del logro -->
          <v-avatar :color="currentLogro.color" size="80" class="mb-4">
            <v-icon size="44" color="white">{{ currentLogro.icono }}</v-icon>
          </v-avatar>
          
          <!-- Nombre y descripción -->
          <h3 class="text-h5 mb-2">{{ currentLogro.nombre }}</h3>
          <p class="text-body-1 mb-4">{{ currentLogro.descripcion }}</p>
          
          <!-- Puntos de experiencia -->
          <v-chip color="primary" size="large" class="mb-4">
            <v-icon start>mdi-star</v-icon>
            +{{ currentLogro.experiencia }} puntos de experiencia
          </v-chip>
          
          <!-- Contador de logros -->
          <div class="logro-counter text-caption" v-if="logrosRecientes.length > 1">
            {{ currentLogroIndex + 1 }} de {{ logrosRecientes.length }}
          </div>
        </div>
      </v-card-text>
      
      <!-- Botones -->
      <v-card-actions class="pb-4 px-4">
        <v-spacer></v-spacer>
        <v-btn 
          v-if="currentLogroIndex < logrosRecientes.length - 1" 
          color="primary" 
          @click="nextLogro"
        >
          Siguiente
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
        <v-btn 
          v-else 
          color="primary" 
          @click="closeNotification"
        >
          ¡Genial!
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
    
    <v-card v-else-if="loading" class="pa-4">
      <div class="d-flex justify-center align-center pa-6">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>
    </v-card>
    
    <v-card v-else class="pa-4">
      <v-card-text class="text-center">
        <v-icon size="48" color="grey">mdi-trophy-outline</v-icon>
        <p class="mt-2">No hay logros nuevos para mostrar</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="closeNotification">Cerrar</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.logro-notification {
  border-radius: $border-radius;
  overflow: hidden;
  
  .logro-notification-title {
    font-weight: 600;
    display: flex;
    align-items: center;
    padding: 16px;
    font-family: $font-family-base;
  }
}

.logro-counter {
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.6);
}
</style>