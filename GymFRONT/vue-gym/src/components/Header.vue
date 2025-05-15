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

// Método para abrir/cerrar drawer
const toggleDrawer = () => {
  emit('toggle-drawer')
}

// Método para cerrar el drawer
const closeDrawer = () => {
  emit('update:drawer', false)
}

// Método para navegar y cerrar el drawer
const navigateAndClose = (route) => {
  router.push(route)
  closeDrawer()
}

// Método específico para cerrar sesión y drawer
const logoutAndCloseDrawer = () => {
  authStore.logout()
  router.push('/')
  closeDrawer()
}
</script>

<template>
  <v-app-bar class="app-bar" flat>
    <v-container class="d-flex align-center pa-0 ma-0" fluid>
      <div class="d-flex align-center justify-space-between w-100">
        <!-- Sección izquierda: Menú y logo -->
        <div class="d-flex align-center">
          <v-app-bar-nav-icon @click="toggleDrawer" class="nav-icon"></v-app-bar-nav-icon>
          
          <!-- Logo con mayor espacio asignado -->
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
                
                <v-list-item to="/mediciones" prepend-icon="mdi-scale-bathroom">
                  <v-list-item-title>Mis Mediciones</v-list-item-title>
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

  <!-- Contenedor para drawer y overlay, esto asegura un manejo correcto de z-index -->
  <div class="drawer-container">
    <!-- Overlay que cubre toda la pantalla cuando el menú está abierto -->
    <div v-if="drawer" class="menu-overlay" @click.stop="closeDrawer"></div>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      :model-value="drawer"
      @update:model-value="emit('update:drawer', $event)"
      temporary
      class="custom-drawer"
      width="280"
    >
      <v-list class="drawer-list">
        <!-- Solo título en el drawer - Sin logo -->
        <v-list-item class="drawer-header">
          <v-list-item-title class="text-h6 drawer-title">ENTRÉNATE</v-list-item-title>
        </v-list-item>
        
        <v-divider class="my-2"></v-divider>
        
        <!-- Items de navegación principal - Usando @click directamente para garantizar que se cierran -->
        <v-list-item 
          v-for="item in menuItems" 
          :key="item.title" 
          :prepend-icon="item.icon"
          :title="item.title" 
          class="menu-item"
          @click.stop="navigateAndClose(item.route)"
        ></v-list-item>
        
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
          
          <!-- Rutas protegidas - Con navegación manual para cierre garantizado -->
          <v-list-item prepend-icon="mdi-account" title="MI PERFIL" @click.stop="navigateAndClose('/profile')"></v-list-item>
          <v-list-item prepend-icon="mdi-scale-bathroom" title="MIS MEDICIONES" @click.stop="navigateAndClose('/mediciones')"></v-list-item>
          <v-list-item @click.stop="logoutAndCloseDrawer" prepend-icon="mdi-logout" title="CERRAR SESIÓN"></v-list-item>
        </template>
        <template v-else>
          <v-list-item prepend-icon="mdi-login" title="INICIAR SESIÓN" @click.stop="navigateAndClose('/login')"></v-list-item>
          <v-list-item prepend-icon="mdi-account-plus" title="REGISTRARSE" @click.stop="navigateAndClose('/register')"></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/main.scss';

.app-bar {
  background-color: $primary-color !important;
  padding: 0;
  height: 64px !important; /* Reducido de 80px a un valor más estándar */
}

.app-bar__logo {
  color: white;
  font-weight: bold;
  text-decoration: none;
  margin-left: 8px;
  display: flex;
  align-items: center;
  height: 100%;
}

.nav-icon {
  margin-right: 4px;
}

/* Contenedor para el drawer y overlay */
.drawer-container {
  position: relative;
  z-index: 1000; /* Asegura que esté por encima de otros elementos */
}

/* Overlay que cubre toda la pantalla cuando el menú está abierto */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998; /* Justo debajo del drawer pero encima de todo lo demás */
  cursor: pointer;
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

.logo-container {
  width: 60px;  /* Ancho ajustado */
  height: 60px; /* Igual al ancho para mantener proporción cuadrada */
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  position: relative; /* Para mejor control de posicionamiento */
}

/* Ajuste para el logo canvas */
:deep(canvas) {
  transform: scale(1); /* Escala natural sin distorsión */
  position: absolute; /* Posicionamiento absoluto para evitar distorsión */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* Preserva proporción */
}

/* Mobile adjustments - Logo más grande en móvil */
@media (max-width: 600px) {
  .logo-container {
    width: 56px;   /* Aumentado de 55px a 65px */
    height: 56px;  /* Manteniendo proporción cuadrada */
  }
  
  :deep(canvas) {
    transform: scale(1.1); /* Aumentado de 0.9 a 1.1 para hacer el logo más grande */
  }
}
</style>

<style>
.drawer-title {
  font-weight: bold !important;
  text-align: center !important; /* Centrar el texto */
  font-size: 1.5rem !important; /* Aumentar tamaño para compensar falta de logo */
}

/* Asegurar que el drawer tenga un z-index mayor que el overlay */
.v-navigation-drawer {
  z-index: 999 !important;
}

/* Estilos para los item del menú */
.v-list-item {
  transition: background-color 0.2s ease;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>