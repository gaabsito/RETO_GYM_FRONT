<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useWorkoutStore } from '@/stores/workouts'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import WorkoutCard from '@/components/WorkoutCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import SectionContainer from '@/components/SectionContainer.vue'
import heroImage from '@/assets/images/ejercicios.jpg' 

const workoutStore = useWorkoutStore()
const authStore = useAuthStore()
const router = useRouter()
const { workouts, loading, error } = storeToRefs(workoutStore)
const initialized = ref(false)
const userWorkouts = ref<any[]>([])

// Filtros
const searchQuery = ref('')
const selectedDifficulty = ref<string | null>(null)
const difficulties = ['Fácil', 'Media', 'Difícil']

// Verificar autenticación
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/mis-entrenamientos')
    return
  }

  try {
    loading.value = true
    // Cargar todos los entrenamientos
    await workoutStore.fetchWorkouts()
    
    // Filtrar entrenamientos del usuario actual
    if (authStore.user && authStore.user.usuarioID) {
      userWorkouts.value = workouts.value.filter(workout => 
        workout.autorID === authStore.user?.usuarioID
      )
    }
    
    initialized.value = true
  } catch (err) {
    console.error('Error cargando entrenamientos:', err)
  } finally {
    loading.value = false
  }
})

// Filtrar entrenamientos
const filteredWorkouts = computed(() => {
  if (!initialized.value) return []
  
  return userWorkouts.value.filter(workout => {
    // Filtrar por búsqueda
    const matchesSearch = 
      workout.titulo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (workout.descripcion?.toLowerCase().includes(searchQuery.value.toLowerCase()) ?? false)

    // Filtrar por dificultad
    const matchesDifficulty = !selectedDifficulty.value || 
      workout.dificultad === selectedDifficulty.value

    return matchesSearch && matchesDifficulty
  })
})

// Limpiar filtros
const clearFilters = () => {
  searchQuery.value = ''
  selectedDifficulty.value = null
}
</script>

<template>
  <v-container fluid class="pa-0">
    <!-- Hero Section -->
    <PageHeader 
      title="Mis Entrenamientos"
      subtitle="Administra tus rutinas personalizadas"
      :backgroundImage="heroImage"
    >
      <v-btn 
        color="primary" 
        size="x-large" 
        to="/crear-entrenamiento" 
        prepend-icon="mdi-plus"
        class="mt-4"
      >
        Crear Nuevo Entrenamiento
      </v-btn>
    </PageHeader>

    <!-- Contenido principal -->
    <SectionContainer>
      <!-- Filtros -->
      <v-row class="filters-container mb-6">
        <v-col cols="12" md="5">
          <v-text-field
            v-model="searchQuery"
            label="Buscar en mis entrenamientos"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            clearable
            hide-details
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="5">
          <v-select
            v-model="selectedDifficulty"
            :items="difficulties"
            label="Dificultad"
            prepend-inner-icon="mdi-signal-cellular-outline"
            variant="outlined"
            clearable
            hide-details
          ></v-select>
        </v-col>

        <v-col cols="12" md="2" class="d-flex justify-center align-center">
          <v-btn
            variant="text"
            @click="clearFilters"
            :disabled="!searchQuery && !selectedDifficulty"
          >
            Limpiar
          </v-btn>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <v-row v-if="loading" class="mt-4">
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          ></v-progress-circular>
        </v-col>
      </v-row>

      <!-- Error State -->
      <v-row v-else-if="error" class="mt-4">
        <v-col cols="12">
          <v-alert type="error" class="mb-4">
            {{ error }}
          </v-alert>
        </v-col>
      </v-row>

      <!-- No Workouts State -->
      <v-row v-else-if="userWorkouts.length === 0" class="mt-4">
        <v-col cols="12">
          <v-alert type="info" class="mb-4">
            Aún no has creado ningún entrenamiento. ¡Crea tu primer entrenamiento ahora!
          </v-alert>
          <div class="text-center mt-6">
            <v-btn 
              color="primary" 
              size="large" 
              to="/crear-entrenamiento" 
              prepend-icon="mdi-plus"
            >
              Crear Entrenamiento
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- No Results After Filtering -->
      <v-row v-else-if="filteredWorkouts.length === 0" class="mt-4">
        <v-col cols="12" class="text-center">
          <v-alert type="info" class="mb-4">
            No se encontraron entrenamientos con los filtros seleccionados
          </v-alert>
        </v-col>
      </v-row>

      <!-- Workouts List -->
      <v-row v-else class="mt-4">
        <v-col
          v-for="workout in filteredWorkouts"
          :key="workout.entrenamientoID"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <WorkoutCard :workout="workout" :showDescription="true" />
        </v-col>
      </v-row>
    </SectionContainer>

    <!-- CTA Sección (si no tiene muchos entrenamientos) -->
    <SectionContainer 
      v-if="userWorkouts.length > 0 && userWorkouts.length < 4" 
      backgroundColor="#f8f8f8"
      title="Mejora tus entrenamientos"
      subtitle="Añade más ejercicios y rutinas a tu colección"
    >
      <div class="text-center">
        <v-btn 
          color="primary" 
          size="large" 
          to="/exercises" 
          prepend-icon="mdi-dumbbell"
          class="mx-2 mb-4"
        >
          Explorar Ejercicios
        </v-btn>
        <v-btn 
          color="primary" 
          size="large" 
          to="/workouts" 
          prepend-icon="mdi-view-dashboard"
          class="mx-2 mb-4"
        >
          Descubrir Entrenamientos
        </v-btn>
      </div>
    </SectionContainer>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.filters-container {
  background-color: $light-gray;
  border-radius: $border-radius;
  padding: 1.5rem;
  margin-top: 1rem;
}

.v-text-field {
  padding: 12px !important;
}

.v-input {
  padding: 12px !important;
}

.v-col-md-4 {
  padding: 12px !important;
}

.v-alert {
  margin: 12px !important;
}

.section-container {
    padding-right: 0px !important;
    padding-left: 0px !important;
}

.section-header {
    margin: 2.5rem !important;
}

.v-btn {
  font-family: $font-family-base;
  padding-right: 12px !important;
  padding-left: 12px !important;
  border-radius: $border-radius;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

:deep(.v-alert) {
  border-radius: $border-radius;
  font-family: $font-family-text;
}

// Responsive adjustments
@media (max-width: 600px) {
  .filters-container {
    padding: 1rem !important;
  }
}
</style>