<template>
  <div>
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
                  <div v-bind="props" class="avatar-wrapper">
                    <UserAvatar
                      :nombre="authStore.user?.nombre"
                      :apellido="authStore.user?.apellido"
                      :photoUrl="photoUrl"
                      :size="avatarSize"
                      :showBorder="true"
                      class="user-avatar-header"
                    />
                    <!-- Badge de Admin -->
                    <v-chip 
                      v-if="authStore.isAdmin" 
                      color="warning" 
                      size="x-small" 
                      variant="elevated"
                      class="admin-badge"
                    >
                      <v-icon start size="x-small">mdi-shield-crown</v-icon>
                      ADMIN
                    </v-chip>
                  </div>
                </template>
                
                <v-list>
                  <!-- Info del usuario -->
                  <v-list-item class="user-info pa-3">
                    <template v-slot:prepend>
                      <div class="avatar-container">
                        <UserAvatar
                          :nombre="authStore.user?.nombre"
                          :apellido="authStore.user?.apellido"
                          :photoUrl="photoUrl"
                          :size="40"
                        />
                      </div>
                    </template>
                    <v-list-item-title class="text-subtitle-1 font-weight-medium ml-3">
                      {{ authStore.user?.nombre }} {{ authStore.user?.apellido }}
                      <v-chip v-if="authStore.isAdmin" color="primary" size="small" class="ml-2">
                        <v-icon start size="small">mdi-shield-crown</v-icon>
                        Admin
                      </v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption ml-3">
                      {{ authStore.user?.email }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-divider></v-divider>
                  
                  <!-- Sección de Admin (si es administrador) -->
                  <template v-if="authStore.isAdmin">
                    <v-list-subheader class="text-uppercase text-primary font-weight-bold">
                      <v-icon start size="small">mdi-shield-crown</v-icon>
                      Administración
                    </v-list-subheader>
                    
                    <v-list-item to="/admin" prepend-icon="mdi-view-dashboard">
                      <v-list-item-title>Panel de Control</v-list-item-title>
                    </v-list-item>

                    <v-list-item to="/admin/usuarios" prepend-icon="mdi-account-group">
                      <v-list-item-title>Gestionar Usuarios</v-list-item-title>
                    </v-list-item>

                    <v-list-item to="/admin/entrenamientos" prepend-icon="mdi-dumbbell">
                      <v-list-item-title>Gestionar Entrenamientos</v-list-item-title>
                    </v-list-item>

                    <v-list-item to="/admin/ejercicios" prepend-icon="mdi-arm-flex">
                      <v-list-item-title>Gestionar Ejercicios</v-list-item-title>
                    </v-list-item>
                    
                    <v-divider></v-divider>
                  </template>
                  
                  <v-list-item to="/profile" prepend-icon="mdi-account">
                    <v-list-item-title>Mi Perfil</v-list-item-title>
                  </v-list-item>

                  <v-list-item to="/mis-entrenamientos" prepend-icon="mdi-notebook">
                    <v-list-item-title>Mis Entrenamientos</v-list-item-title>
                  </v-list-item>

                  <v-list-item to="/mediciones" prepend-icon="mdi-tape-measure">
                    <v-list-item-title>Mis Mediciones</v-list-item-title>
                  </v-list-item>

                  <!-- Nueva opción para Logros -->
                  <v-list-item to="/logros" prepend-icon="mdi-trophy">
                    <v-list-item-title>Mis Logros</v-list-item-title>
                  </v-list-item>
                  
                  <v-divider></v-divider>
                  
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

    <!-- Navigation Drawer con v-model simple -->
    <v-navigation-drawer
      v-model="localDrawer"
      location="left"
      temporary
      class="custom-drawer"
      @click:outside="closeDrawer"
    >
      <v-list class="drawer-list">
        <!-- Solo título en el drawer - Sin logo -->
        <v-list-item class="drawer-header">
          <v-list-item-title class="text-h6 drawer-title">ENTRÉNATE</v-list-item-title>
        </v-list-item>
        
        <v-divider class="my-2"></v-divider>
        
        <!-- Items de navegación principal -->
        <v-list-item v-for="item in menuItems" :key="item.title" 
                    :to="item.route" :prepend-icon="item.icon"
                    :title="item.title" class="menu-item"
                    @click="closeDrawer"></v-list-item>
        
        <v-divider class="my-2"></v-divider>
        
        <!-- Sección de autenticación -->
        <template v-if="authStore.isAuthenticated">
          <!-- Información del usuario -->
          <v-list-item class="user-drawer-info" v-if="authStore.user">
            <template v-slot:prepend>
              <div class="drawer-avatar-container">
                <UserAvatar
                  :nombre="authStore.user?.nombre"
                  :apellido="authStore.user?.apellido"
                  :photoUrl="photoUrl"
                  :size="36"
                />
              </div>
            </template>
            <v-list-item-title class="ml-2">{{ authStore.user.nombre }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption ml-2">
              {{ authStore.user.email }}
              <v-chip v-if="authStore.isAdmin" color="primary" size="x-small" class="ml-1">
                Admin
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item>
          
          <!-- Sección de Admin en el drawer -->
          <template v-if="authStore.isAdmin">
            <v-divider class="my-2"></v-divider>
            <v-list-subheader class="text-uppercase text-primary font-weight-bold px-4">
              <v-icon start size="small">mdi-shield-crown</v-icon>
              Administración
            </v-list-subheader>
            
            <v-list-item to="/admin" prepend-icon="mdi-view-dashboard" title="Panel Admin" @click="closeDrawer" class="admin-menu-item"></v-list-item>
            <v-list-item to="/admin/usuarios" prepend-icon="mdi-account-group" title="Usuarios" @click="closeDrawer" class="admin-menu-item"></v-list-item>
            <v-list-item to="/admin/entrenamientos" prepend-icon="mdi-dumbbell" title="Entrenamientos" @click="closeDrawer" class="admin-menu-item"></v-list-item>
            <v-list-item to="/admin/ejercicios" prepend-icon="mdi-arm-flex" title="Ejercicios" @click="closeDrawer" class="admin-menu-item"></v-list-item>
            
            <v-divider class="my-2"></v-divider>
          </template>
          
          <!-- Iteramos sobre authMenuItems -->
          <v-list-item v-for="item in authMenuItems" :key="item.title"
                      :to="item.route" :prepend-icon="item.icon"
                      :title="item.title" @click="closeDrawer"></v-list-item>
          
          <!-- Botón de cerrar sesión -->
          <v-list-item @click="closeDrawerAndLogout" prepend-icon="mdi-logout" title="CERRAR SESIÓN"></v-list-item>
        </template>
        <template v-else>
          <v-list-item to="/login" prepend-icon="mdi-login" title="INICIAR SESIÓN" @click="closeDrawer"></v-list-item>
          <v-list-item to="/register" prepend-icon="mdi-account-plus" title="REGISTRARSE" @click="closeDrawer"></v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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
  drawer: boolean;
}>();

const emit = defineEmits(['toggle-drawer', 'update:drawer'])

const authStore = useAuthStore()
const router = useRouter()

// Estado para el menú desplegable del avatar
const menuOpen = ref(false)
const avatarSize = 40 // Tamaño del avatar en el header

// Variable local para el drawer
const localDrawer = ref(props.drawer)

// Sincronizar localDrawer con props.drawer
watch(() => props.drawer, (newVal) => {
  localDrawer.value = newVal
})

// Sincronizar props.drawer con localDrawer
watch(localDrawer, (newVal) => {
  emit('update:drawer', newVal)
})

// Computed para obtener la URL de la foto o null
const photoUrl = computed(() => authStore.user?.fotoPerfilURL || null)

// Items de menú principal
const menuItems = [
  { title: 'Inicio', icon: 'mdi-home', route: '/' },
  { title: 'Entrenamientos', icon: 'mdi-dumbbell', route: '/workouts' },
  { title: 'Ejercicios', icon: 'mdi-arm-flex', route: '/exercises' },
  { title: 'Sobre nosotros', icon: 'mdi-information', route: '/about' },
  { title: 'Contacto', icon: 'mdi-email', route: '/contact' }
]

// Items de menú disponibles solo para usuarios autenticados
const authMenuItems = computed(() => {
  const baseItems = [
    { title: 'Mi Perfil', icon: 'mdi-account', route: '/profile' },
    { title: 'Mis Entrenamientos', icon: 'mdi-notebook', route: '/mis-entrenamientos' },
    { title: 'Mis Mediciones', icon: 'mdi-tape-measure', route: '/mediciones' },
    { title: 'Mis Logros', icon: 'mdi-trophy', route: '/logros' },
  ]
  
  return baseItems
})

// Método para cerrar drawer
const closeDrawer = () => {
  localDrawer.value = false
}

// Método para cerrar sesión
const handleLogout = () => {
  authStore.logout()
  router.push('/')
  menuOpen.value = false
}

// Método para cerrar drawer y hacer logout
const closeDrawerAndLogout = () => {
  closeDrawer()
  handleLogout()
}

// Método para abrir/cerrar drawer
const toggleDrawer = () => {
  localDrawer.value = !localDrawer.value
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/main.scss';

.app-bar {
  background-color: $primary-color !important;
  padding: 0;
  height: 64px !important;
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

/* Espaciador central con ancho controlado - menos espacio para mover elementos a la izquierda */
.center-spacer {
  flex-grow: 0.6;  /* Reducido de 1 para dar menos espacio en el centro */
  min-width: 20px; /* Espacio mínimo para mantener una separación adecuada */
}

/* Sección de autenticación movida más a la izquierda */
.auth-section {
  margin-right: 24px; /* Aumentado para mover el botón/avatar más a la izquierda */
  display: flex;
  align-items: center;
  height: 100%;
}

/* Contenedor para alinear verticalmente el avatar */
.avatar-wrapper {
  display: flex;
  align-items: center;
  height: 100%;
  padding-bottom: 3px; /* Pequeño ajuste para compensar la diferencia visual */
  position: relative;
}

/* Badge de Admin en el header */
.admin-badge {
  position: absolute;
  top: -8px;
  right: -12px;
  z-index: 10;
  font-weight: bold;
  font-size: 10px !important;
  height: 20px !important;
  min-width: 50px !important;
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

/* Contenedor para el avatar con espacio adecuado */
.avatar-container {
  margin-right: 12px;  /* Espacio entre avatar y texto */
  min-width: 40px;     /* Ancho mínimo para evitar compresión */
}

.drawer-avatar-container {
  margin-right: 12px;
  min-width: 36px;
}

/* Ajuste para los textos del usuario */
.v-list-item-title.ml-3, 
.v-list-item-subtitle.ml-3 {
  margin-left: 4px !important; /* Ajuste fino del margen izquierdo */
}

.user-info {
  background-color: $light-gray;
  padding: 16px !important;  /* Aumentamos el padding general */
}

.user-drawer-info {
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.03);
}

/* Estilos para items de admin en el drawer */
.admin-menu-item {
  background-color: rgba(25, 118, 210, 0.1);
  border-left: 3px solid $primary-color;
  
  &:hover {
    background-color: rgba(25, 118, 210, 0.2);
  }
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

.drawer-title {
  font-weight: bold !important;
  text-align: center !important; /* Centrar el texto */
  font-size: 1.5rem !important; /* Aumentar tamaño para compensar falta de logo */
}

.custom-drawer {
  .drawer-header {
    background-color: $primary-color;
    color: white;
    padding: 1rem;
  }
  
  .drawer-title {
    font-weight: bold;
    text-align: center;
    font-size: 1.5rem;
    font-family: $font-family-base;
  }
  
  .menu-item {
    font-family: $font-family-base;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
}

/* Mobile adjustments - Solo añadimos alineación vertical para móvil */
@media (max-width: 600px) {
  .app-bar {
    display: flex;
    align-items: center;
  }
  
  .logo-container {
    width: 55px;  /* Ligeramente ajustado para móvil */
    height: 55px;
  }
  
  /* Centramos la sección de usuario - Ajustamos el avatar en móvil */
  .auth-section {
    display: flex;
    align-items: center;
    height: 100%;
  }
  
  /* Ajustamos la alineación vertical en móvil */
  .avatar-wrapper {
    display: flex;
    align-items: center;
    height: 100%;
    padding-bottom: 3px;
  }
  
  .admin-badge {
    font-size: 9px !important;
    height: 18px !important;
    min-width: 45px !important;
    top: -6px;
    right: -8px;
  }
  
  .drawer-title {
    font-size: 1.3rem !important;
  }
  
  .user-drawer-info {
    padding: 14px;
  }
  
  .user-info {
    padding: 14px !important;
  }
  
  .avatar-container {
    margin-right: 16px; /* Más espacio en móviles */
  }
  
  .drawer-avatar-container {
    margin-right: 14px;
  }
}
</style>