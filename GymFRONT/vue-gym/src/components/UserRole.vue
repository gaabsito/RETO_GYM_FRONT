<!-- src/components/UserRole.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRolesStore } from '@/stores/roles';
import { useAuthStore } from '@/stores/auth';
import type { Role } from '@/types/Role';

const props = defineProps<{
  showNextRole?: boolean;
}>();

const rolesStore = useRolesStore();
const authStore = useAuthStore();

// Estado local
const loading = ref(false);
const error = ref('');
const showRoleInfo = ref(false);

// Cargar el rol del usuario
const loadUserRole = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    if (!authStore.isAuthenticated) {
      return;
    }
    
    await rolesStore.getUserRole();
    
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar el rol del usuario';
  } finally {
    loading.value = false;
  }
};

// Obtener todos los roles para mostrar la progresión
const allRoles = computed(() => {
  return rolesStore.getAllRoles();
});

// Rol actual del usuario
const currentRole = computed(() => {
  return rolesStore.currentRole;
});

// Progreso hacia el siguiente rol
const roleProgress = computed(() => {
  return rolesStore.progressToNextRole;
});

// Días restantes para el siguiente rol
const daysToNextRole = computed(() => {
  return rolesStore.daysToNextRole;
});

// Siguiente rol (si existe)
const nextRole = computed(() => {
  if (!rolesStore.userCurrentRole) return null;
  if (rolesStore.userCurrentRole === 7) return null; // No hay siguiente rol para "Élite"
  
  return rolesStore.getRoleById(rolesStore.userCurrentRole + 1);
});

// Obtener color de progreso basado en el rol actual
const progressColor = computed(() => {
  return currentRole.value?.color || '#9E9E9E';
});

// Formatear el texto de días restantes
const daysRemainingText = computed(() => {
  if (!nextRole.value) return '';
  if (daysToNextRole.value === 0) return '¡Ya puedes subir de nivel!';
  
  return `${daysToNextRole.value} día${daysToNextRole.value !== 1 ? 's' : ''} más esta semana para subir a ${nextRole.value.nombre}`;
});

// Cargar el rol al montar el componente
onMounted(() => {
  loadUserRole();
});

// Observar cambios en la autenticación
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    loadUserRole();
  }
});

// Abrir diálogo de información
const toggleRoleInfo = () => {
  showRoleInfo.value = !showRoleInfo.value;
};
</script>

<template>
  <div class="user-role-container">
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center py-3">
      <v-progress-circular indeterminate color="primary" size="28"></v-progress-circular>
    </div>
    
    <!-- Error state -->
    <v-alert v-else-if="error" type="error" variant="tonal" density="compact" class="mb-3">
      {{ error }}
    </v-alert>
    
    <!-- Sin rol (usuario no registrado o sin entrenamientos) -->
    <div v-else-if="!currentRole" class="text-center py-3">
      <v-icon size="32" color="grey" class="mb-2">mdi-account-question</v-icon>
      <div class="text-caption text-grey">
        Completa entrenamientos para obtener un rol
      </div>
    </div>
    
    <!-- Mostrar el rol actual -->
    <div v-else class="role-content">
      <!-- Tarjeta de rol actual -->
      <v-card class="role-card" elevation="1">
        <div class="role-header" :style="{ backgroundColor: currentRole.color + '22' }">
          <v-icon :color="currentRole.color" size="32" class="role-icon">{{ currentRole.icono }}</v-icon>
          <div class="role-title">
            <div class="role-name" :style="{ color: currentRole.color }">{{ currentRole.nombre }}</div>
            <div class="role-level">Nivel {{ currentRole.id }} de 7</div>
          </div>
          <v-btn 
            icon 
            variant="text" 
            size="small" 
            @click="toggleRoleInfo" 
            class="role-info-btn"
            :color="currentRole.color"
          >
            <v-icon>mdi-information-outline</v-icon>
          </v-btn>
        </div>
        
        <v-card-text class="px-3 py-2">
          <p class="role-description text-body-2">{{ currentRole.descripcion }}</p>
          
          <!-- Mostrar progreso al siguiente rol si no es el máximo -->
          <div v-if="nextRole && props.showNextRole" class="role-progress">
            <div class="d-flex justify-space-between align-center mb-1">
              <div class="text-caption">Progreso hacia {{ nextRole.nombre }}</div>
              <div class="text-caption font-weight-medium">{{ Math.round(roleProgress) }}%</div>
            </div>
            
            <v-progress-linear
              :model-value="roleProgress"
              height="8"
              rounded
              :color="nextRole.color"
              bg-color="grey-lighten-3"
            ></v-progress-linear>
            
            <div class="text-caption mt-2 text-center text-primary">
              {{ daysRemainingText }}
            </div>
          </div>
          
          <!-- Mostrar mensaje de nivel máximo si es Élite -->
          <div v-else-if="currentRole.id === 7" class="max-level-message">
            <v-icon color="amber-darken-2" class="mr-1">mdi-crown</v-icon>
            <span class="text-caption">¡Has alcanzado el nivel máximo!</span>
          </div>
        </v-card-text>
      </v-card>
    </div>
    
    <!-- Modal de información de roles -->
    <v-dialog v-model="showRoleInfo" max-width="500">
      <v-card>
        <v-card-title class="dialog-title">
          Niveles de Entrenamiento
          <v-btn icon @click="showRoleInfo = false" variant="text" class="ml-auto">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <p class="text-body-2 mb-4">
            Tu nivel se determina según la cantidad de días que entrenas cada semana. 
            ¡Completa más entrenamientos para subir de nivel!
          </p>
          
          <v-list>
            <v-list-item
              v-for="role in allRoles"
              :key="role.id"
              :class="{ 'current-role': currentRole && role.id === currentRole.id }"
            >
              <template v-slot:prepend>
                <v-avatar :color="role.color + '22'" size="40" class="me-3">
                  <v-icon :color="role.color">{{ role.icono }}</v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title :style="currentRole && role.id === currentRole.id ? { color: role.color, fontWeight: 'bold' } : {}">
                {{ role.nombre }}
              </v-list-item-title>
              
              <v-list-item-subtitle>
                {{ role.diasPorSemanaMinimo === role.diasPorSemanaMaximo
                  ? `${role.diasPorSemanaMinimo} día${role.diasPorSemanaMinimo !== 1 ? 's' : ''} a la semana`
                  : `${role.diasPorSemanaMinimo}-${role.diasPorSemanaMaximo} días a la semana`
                }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          
          <v-divider class="my-4"></v-divider>
          
          <div class="text-caption text-center">
            Tu nivel se actualiza automáticamente según tus entrenamientos recientes.
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.user-role-container {
  width: 100%;
}

.role-card {
  width: 100%;
  border-radius: $border-radius;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  }
}

.role-header {
  padding: 16px;
  display: flex;
  align-items: center;
  position: relative;
  
  .role-icon {
    margin-right: 16px;
  }
  
  .role-title {
    flex: 1;
    
    .role-name {
      font-weight: 600;
      font-size: 1.1rem;
      font-family: $font-family-base;
    }
    
    .role-level {
      font-size: 0.8rem;
      opacity: 0.7;
    }
  }
  
  .role-info-btn {
    position: absolute;
    top: 8px;
    right: 8px;
  }
}

.role-description {
  margin-bottom: 12px;
  line-height: 1.5;
  font-family: $font-family-text;
  color: rgba(0, 0, 0, 0.7);
}

.role-progress {
  margin-top: 12px;
  
  .text-caption {
    color: rgba(0, 0, 0, 0.6);
  }
}

.max-level-message {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: rgba(255, 193, 7, 0.1);
  border-radius: $border-radius;
  margin-top: 12px;
}

.current-role {
  background-color: #f5f5f5;
  border-radius: $border-radius;
}

.dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: $primary-color;
  color: white;
  padding: 16px;
}

// Responsive adjustments
@media (max-width: 600px) {
  .role-header {
    padding: 12px;
    
    .role-icon {
      margin-right: 12px;
    }
    
    .role-title {
      .role-name {
        font-size: 1rem;
      }
    }
  }
}
</style>