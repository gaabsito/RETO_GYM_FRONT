<template>
  <v-container fluid class="admin-dashboard">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold">Panel de Administración</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Gestiona usuarios, entrenamientos y ejercicios de la plataforma
            </p>
          </div>
          <v-chip color="primary" size="large" variant="elevated">
            <v-icon start>mdi-shield-crown</v-icon>
            Administrador
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="adminStore.statsLoading" justify="center">
      <v-col cols="12" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <p class="mt-4 text-h6">Cargando estadísticas...</p>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-alert v-else-if="adminStore.error" type="error" class="mb-4">
      {{ adminStore.error }}
      <template v-slot:append>
        <v-btn @click="loadData" variant="text">Reintentar</v-btn>
      </template>
    </v-alert>

    <!-- Stats Cards -->
    <v-row v-else-if="adminStore.stats" class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="primary" variant="elevated">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-account-group</v-icon>
            <div class="text-h3 font-weight-bold">{{ adminStore.stats.totalUsuarios }}</div>
            <div class="text-subtitle-1">Total Usuarios</div>
            <div class="text-caption">
              {{ adminStore.stats.usuariosActivos }} activos
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="success" variant="elevated">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-dumbbell</v-icon>
            <div class="text-h3 font-weight-bold">{{ adminStore.stats.totalEntrenamientos }}</div>
            <div class="text-subtitle-1">Entrenamientos</div>
            <div class="text-caption">
              {{ adminStore.stats.entrenamientosPublicos }} públicos
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="warning" variant="elevated">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-arm-flex</v-icon>
            <div class="text-h3 font-weight-bold">{{ adminStore.stats.totalEjercicios }}</div>
            <div class="text-subtitle-1">Ejercicios</div>
            <div class="text-caption">
              Disponibles
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" color="info" variant="elevated">
          <v-card-text class="text-center">
            <v-icon size="48" class="mb-2">mdi-shield-account</v-icon>
            <!-- CORRECCIÓN: Cambiar totalAdmins por totalAdministradores -->
            <div class="text-h3 font-weight-bold">{{ adminStore.stats.totalAdministradores }}</div>
            <div class="text-subtitle-1">Administradores</div>
            <div class="text-caption">
              Total en el sistema
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-lightning-bolt</v-icon>
            Acciones Rápidas
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-btn
                  color="primary"
                  variant="elevated"
                  size="large"
                  block
                  :to="{ name: 'admin-users' }"
                  prepend-icon="mdi-account-plus"
                >
                  Crear Usuario
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn
                  color="success"
                  variant="elevated"
                  size="large"
                  block
                  :to="{ name: 'admin-workouts' }"
                  prepend-icon="mdi-plus"
                >
                  Nuevo Entrenamiento
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn
                  color="warning"
                  variant="elevated"
                  size="large"
                  block
                  :to="{ name: 'admin-exercises' }"
                  prepend-icon="mdi-plus"
                >
                  Nuevo Ejercicio
                </v-btn>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-btn
                  color="info"
                  variant="elevated"
                  size="large"
                  block
                  @click="loadData"
                  prepend-icon="mdi-refresh"
                >
                  Actualizar Datos
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity -->
    <v-row v-if="adminStore.stats">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-calendar-today</v-icon>
            Actividad Reciente
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar color="primary" size="32">
                    <v-icon color="white">mdi-account-plus</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>Usuarios registrados hoy</v-list-item-title>
                <v-list-item-subtitle>{{ adminStore.stats.usuariosRegistradosHoy }} nuevos usuarios</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar color="success" size="32">
                    <v-icon color="white">mdi-calendar-month</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>Usuarios este mes</v-list-item-title>
                <!-- CORRECCIÓN: Como usuariosRegistradosEsteMes no existe en el backend, uso texto genérico -->
                <v-list-item-subtitle>Estadística en desarrollo</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon start>mdi-cog</v-icon>
            Navegación Rápida
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item :to="{ name: 'admin-users' }" link>
                <template v-slot:prepend>
                  <v-icon>mdi-account-group</v-icon>
                </template>
                <v-list-item-title>Gestionar Usuarios</v-list-item-title>
                <v-list-item-subtitle>Ver, crear y editar usuarios</v-list-item-subtitle>
              </v-list-item>

              <v-list-item :to="{ name: 'admin-workouts' }" link>
                <template v-slot:prepend>
                  <v-icon>mdi-dumbbell</v-icon>
                </template>
                <v-list-item-title>Gestionar Entrenamientos</v-list-item-title>
                <v-list-item-subtitle>Crear y administrar rutinas</v-list-item-subtitle>
              </v-list-item>

              <v-list-item :to="{ name: 'admin-exercises' }" link>
                <template v-slot:prepend>
                  <v-icon>mdi-arm-flex</v-icon>
                </template>
                <v-list-item-title>Gestionar Ejercicios</v-list-item-title>
                <v-list-item-subtitle>Crear y editar ejercicios</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

const loadData = async () => {
  try {
    await adminStore.fetchStats()
  } catch (error) {
    console.error('Error loading admin data:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admin-dashboard {
  padding: 16px;
}

.stat-card {
  height: 100%;
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card .v-card-text {
  color: white;
}

@media (max-width: 600px) {
  .admin-dashboard {
    padding: 8px;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
  
  .text-h3 {
    font-size: 2rem !important;
  }
}
</style>