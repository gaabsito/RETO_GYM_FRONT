<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRolesStore } from '@/stores/roles';
import { useRouter } from 'vue-router';
import UserAvatar from '@/components/UserAvatar.vue';

const authStore = useAuthStore();
const rolesStore = useRolesStore();
const router = useRouter();

// Estado para el menú desplegable
const menuOpen = ref(false);
const avatarSize = 40; // Tamaño del avatar en el header

// Computed para verificar si hay sesión activa
const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.user);

// Computed para obtener la URL de la foto o null
const photoUrl = computed(() => currentUser.value?.fotoPerfilURL || null);

// Estado para el rol del usuario
const loadingRole = ref(false);

// Computed para obtener el rol del usuario
const userRole = computed(() => rolesStore.currentRole);

// Cargar el rol del usuario cuando se monta el componente o cambia la autenticación
const loadUserRole = async () => {
  if (isAuthenticated.value && !rolesStore.currentRole) {
    loadingRole.value = true;
    try {
      await rolesStore.getUserRole();
    } catch (error) {
      console.error('Error al cargar el rol del usuario:', error);
    } finally {
      loadingRole.value = false;
    }
  }
};

// Método para cerrar sesión
const logout = () => {
  authStore.logout();
  router.push('/');
  menuOpen.value = false;
};

// Método para ir al perfil
const goToProfile = () => {
  router.push('/profile');
  menuOpen.value = false;
};

// Método para abrir/cerrar menú
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
  
  // Si se abre el menú y el usuario está autenticado, cargar el rol
  if (menuOpen.value && isAuthenticated.value) {
    loadUserRole();
  }
};

// Cerrar menú al hacer clic fuera
const closeMenu = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-menu-container')) {
    menuOpen.value = false;
  }
};

// Observar cambios en la autenticación para cargar el rol
watch(() => isAuthenticated.value, (newValue) => {
  if (newValue) {
    loadUserRole();
  }
});

// Escuchar clic global para cerrar menú
onMounted(() => {
  document.addEventListener('click', closeMenu);
  
  // Cargar el rol si el usuario ya está autenticado
  if (isAuthenticated.value) {
    loadUserRole();
  }
});

// Limpiar listener al desmontar
onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenu);
});
</script>

<template>
  <v-app-bar app color="primary" dark>
    <!-- Logo y título de la app -->
    <v-app-bar-nav-icon @click="$emit('toggle-drawer')"></v-app-bar-nav-icon>
    <v-toolbar-title>
      <router-link to="/" class="text-decoration-none text-white">ENTRÉNATE</router-link>
    </v-toolbar-title>
    
    <v-spacer></v-spacer>
    
    <!-- Botones de navegación - Visible en pantallas medianas y grandes -->
    <v-btn to="/workouts" variant="text" class="d-none d-sm-flex">
      <v-icon start>mdi-dumbbell</v-icon>
      <span class="d-none d-md-block">Entrenamientos</span>
    </v-btn>
    
    <!-- Si está autenticado mostramos el avatar, si no, los botones de login/registro -->
    <template v-if="isAuthenticated">
      <div class="user-menu-container" @click.stop="toggleMenu">
        <UserAvatar
          :nombre="currentUser?.nombre"
          :apellido="currentUser?.apellido"
          :photoUrl="photoUrl"
          :size="avatarSize"
          :showBorder="true"
          class="ml-2 user-avatar-header"
        />
        
        <!-- Menú desplegable -->
        <v-menu
          v-model="menuOpen"
          :close-on-content-click="false"
          location="bottom end"
          transition="scale-transition"
          min-width="200"
        >
          <template v-slot:activator="{ props }">
            <div v-bind="props"></div>
          </template>
          <v-card>
            <v-list>
              <v-list-item class="user-info pa-3">
                <v-list-item-title class="text-subtitle-1 font-weight-medium">
                  {{ currentUser?.nombre }} {{ currentUser?.apellido }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ currentUser?.email }}
                </v-list-item-subtitle>
                
                <!-- Mostrar el rol del usuario -->
                <div v-if="userRole" class="user-role mt-2">
                  <v-chip
                    :color="userRole.color"
                    size="small"
                    class="role-chip"
                  >
                    <v-icon start size="x-small">{{ userRole.icono }}</v-icon>
                    {{ userRole.nombreRol }}
                  </v-chip>
                </div>
                <div v-else-if="loadingRole" class="user-role mt-2">
                  <v-progress-circular indeterminate color="primary" size="16" width="2"></v-progress-circular>
                  <span class="ml-2 text-caption">Cargando nivel...</span>
                </div>
              </v-list-item>
              
              <v-divider></v-divider>
              
              <v-list-item @click="goToProfile" prepend-icon="mdi-account">
                <v-list-item-title>Mi Perfil</v-list-item-title>
              </v-list-item>
              
              <v-list-item to="/mediciones" prepend-icon="mdi-chart-line">
                <v-list-item-title>Mis Mediciones</v-list-item-title>
              </v-list-item>
              
              <v-divider></v-divider>
              
              <v-list-item @click="logout" prepend-icon="mdi-logout" color="error">
                <v-list-item-title>Cerrar Sesión</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </div>
    </template>
    
    <template v-else>
      <!-- En pantallas pequeñas, mostrar solo iconos -->
      <v-btn to="/login" variant="text" class="d-sm-none">
        <v-icon>mdi-login</v-icon>
      </v-btn>
      <v-btn to="/register" variant="text" class="d-sm-none">
        <v-icon>mdi-account-plus</v-icon>
      </v-btn>
      
      <!-- En pantallas medianas y grandes, mostrar texto e icono -->
      <v-btn to="/login" variant="text" class="d-none d-sm-flex ml-2">
        <v-icon start>mdi-login</v-icon>
        <span class="d-none d-md-block">Iniciar Sesión</span>
      </v-btn>
      <v-btn to="/register" variant="text" class="d-none d-sm-flex ml-2">
        <v-icon start>mdi-account-plus</v-icon>
        <span class="d-none d-md-block">Registro</span>
      </v-btn>
    </template>
  </v-app-bar>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.user-avatar-header {
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

.user-menu-container {
  position: relative;
  display: inline-block;
  margin-left: 12px;
  margin-right: 12px;
}

.user-info {
  background-color: $light-gray;
  
  .user-role {
    display: flex;
    align-items: center;
    margin-top: 8px;
    
    .role-chip {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  }
}

/* Responsive */
@media (max-width: 600px) {
  .v-toolbar-title {
    font-size: 1.1rem;
  }
  
  .v-btn {
    min-width: 0 !important;
    padding: 0 8px !important;
  }
  
  .user-menu-container {
    margin-left: 8px;
    margin-right: 8px;
  }
}
</style>