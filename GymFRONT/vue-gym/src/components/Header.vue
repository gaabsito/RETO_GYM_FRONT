<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import LogoCanvas from '@/components/LogoCanvas.vue'
import UserAvatar from '@/components/UserAvatar.vue'

// Definir la interfaz para los items del menú
interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

const props = defineProps<{
  menuItems: MenuItem[];
  authMenuItems: MenuItem[];
  drawer: boolean;
}>();

const emit = defineEmits(['toggle-drawer', 'update:drawer'])

const authStore = useAuthStore()
const router = useRouter()

// Estado para el menú desplegable del avatar
const menuOpen = ref(false)
const avatarSize = 40 // Tamaño del avatar en el header

// Computed para obtener la URL de la foto o null
const photoUrl = computed(() => authStore.user?.fotoPerfilURL || null)

// Método para cerrar sesión
const handleLogout = () => {
  authStore.logout()
  router.push('/')
  menuOpen.value = false
}

// Método para ir al perfil
const goToProfile = () => {
  router.push('/profile')
  menuOpen.value = false
}

// Método para abrir/cerrar drawer
const toggleDrawer = () => {
  emit('toggle-drawer')
}

// Método para manejar el cambio del drawer
const updateDrawer = (value: boolean) => {
  emit('update:drawer', value)
}
</script>

<template>
  <v-app-bar class="app-bar" flat>
    <v-container class="d-flex align-center pa-0 ma-0" fluid>
      <div class="d-flex align-center justify-space-between w-100">
        <!-- Sección izquierda: Menú y logo -->
        <div class="d-flex align-center">
          <v-app-bar-nav-icon @click="toggleDrawer" class="nav-icon"></v-app-bar-nav-icon>
          
          <router-link to="/" class="app-bar__logo">
            <div class="logo-container">
              <LogoCanvas />
            </div>
          </router-link>
        </div>
        
        <!-- Sección centro: Espacio vacío con tamaño controlado -->
        <div class="center-spacer"></div>
        
        <!-- Sección derecha: Botón login o usuario -->
        <div class="d-flex align-center auth-section">
          <template v-if="!authStore.isAuthenticated">
            <!-- Botón de iniciar sesión -->
            <v-btn variant="text" to="/login" class="login-btn text-white">
              INICIAR SESIÓN
            </v-btn>
          </template>
          
          <template v-else>
            <!-- Menu de usuario simple -->
            <v-menu v-model="menuOpen" location="bottom">
              <template v-slot:activator="{ props }">
                <div v-bind="props" style="cursor: pointer;">
                  <UserAvatar
                    :nombre="authStore.user?.nombre"
                    :apellido="authStore.user?.apellido"
                    :photoUrl="photoUrl"
                    :size="avatarSize"
                    :showBorder="true"
                    class="user-avatar-header"
                  />
                </div>
              </template>
              
              <v-list>
                <!-- Info del usuario -->
                <v-list-item class="user-info pa-3">
                  <template v-slot:prepend>
                    <UserAvatar
                      :nombre="authStore.user?.nombre"
                      :apellido="authStore.user?.apellido"
                      :photoUrl="photoUrl"
                      :size="40"
                    />
                  </template>
                  <v-list-item-title class="text-subtitle-1 font-weight-medium">
                    {{ authStore.user?.nombre }} {{ authStore.user?.apellido }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ authStore.user?.email }}
                  </v-list-item-subtitle>
                </v-list-item>
                
                <v-divider></v-divider>
                
                <v-list-item to="/profile" prepend-icon="mdi-account">
                  <v-list-item-title>Mi Perfil</v-list-item-title>
                </v-list-item>
                
                <v-list-item @click="handleLogout" prepend-icon="mdi-logout" color="error">
                  <v-list-item-title>Cerrar Sesión</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </div>
      </div>
    </v-container>
  </v-app-bar>

  <!-- Navigation Drawer -->
  <v-navigation-drawer 
    :model-value="drawer" 
    @update:model-value="updateDrawer"
    temporary
  >
    <v-list>
      <!-- Logo/título del drawer -->
      <v-list-item>
        <template v-slot:prepend>
          <div class="logo-small">
            <LogoCanvas />
          </div>
        </template>
        <v-list-item-title class="text-h6">ENTRÉNATE</v-list-item-title>
      </v-list-item>
      
      <v-divider class="my-2"></v-divider>
      
      <!-- Items de navegación principal -->
      <v-list-item v-for="item in menuItems" :key="item.title" 
                   :to="item.route" :prepend-icon="item.icon"
                   :title="item.title"></v-list-item>
      
      <v-divider class="my-2"></v-divider>
      
      <!-- Sección de autenticación -->
      <template v-if="authStore.isAuthenticated">
        <!-- Información del usuario -->
        <v-list-item class="user-drawer-info" v-if="authStore.user">
          <template v-slot:prepend>
            <UserAvatar
              :nombre="authStore.user?.nombre"
              :apellido="authStore.user?.apellido"
              :photoUrl="photoUrl"
              :size="36"
            />
          </template>
          <v-list-item-title>{{ authStore.user.nombre }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption">{{ authStore.user.email }}</v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item to="/profile" prepend-icon="mdi-account" title="MI PERFIL"></v-list-item>
        <v-list-item @click="handleLogout" prepend-icon="mdi-logout" title="CERRAR SESIÓN"></v-list-item>
      </template>
      <template v-else>
        <v-list-item to="/login" prepend-icon="mdi-login" title="INICIAR SESIÓN"></v-list-item>
        <v-list-item to="/register" prepend-icon="mdi-account-plus" title="REGISTRARSE"></v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped lang="scss">
@import '@/assets/styles/main.scss';

.app-bar {
  background-color: $primary-color !important;
  padding: 0;
}

.app-bar__logo {
  color: white;
  font-weight: bold;
  text-decoration: none;
  margin-left: 4px;
}

.nav-icon {
  margin-right: 4px;
}

/* Espaciador central con ancho controlado - menos espacio para mover elementos a la izquierda */
.center-spacer {
  flex-grow: 0.6;  /* Reducido de 1 para dar menos espacio en el centro */
  min-width: 20px; /* Espacio mínimo para mantener una separación adecuada */
}

/* Sección de autenticación movida más a la izquierda */
.auth-section {
  margin-right: 24px; /* Aumentado para mover el botón/avatar más a la izquierda */
}

/* Button styles */
.login-btn {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Avatar styles */
.user-avatar-header {
  margin-right: 8px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

.user-info {
  background-color: $light-gray;
}

.user-drawer-info {
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.03);
}

.logo-small {
  width: 32px;
  height: 32px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-container {
  width: 48px;
  height: 48px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Make container full width */
.container {
  max-width: 100% !important;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .logo-container {
    width: 40px;
    height: 40px;
  }
}
</style>