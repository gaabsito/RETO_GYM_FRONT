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
              <v-menu v-model="menuOpen" location="bottom" @click:outside="menuOpen = false">
                <template v-slot:activator="{ props }">
                  <div v-bind="props" style="cursor: pointer;" @click="handleMenuOpen">
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
              <UserAvatar
                :nombre="authStore.user?.nombre"
                :apellido="authStore.user?.apellido"
                :photoUrl="photoUrl"
                :size="36"
              />
            </template>
            <v-list-item-title>{{ authStore.user.nombre }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">{{ authStore.user.email }}</v-list-item-subtitle>
            
            <!-- Mostrar rol del usuario en el drawer -->
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
          </v-list-item>
          
          <!-- Iteramos sobre authMenuItems proporcionados por props -->
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
import { useRolesStore } from '@/stores/roles'
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
const rolesStore = useRolesStore()
const router = useRouter()

// Estado para el menú desplegable del avatar
const menuOpen = ref(false)
const avatarSize = 40 // Tamaño del avatar en el header
const loadingRole = ref(false)

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

// Computed para obtener el rol del usuario
const userRole = computed(() => rolesStore.currentRole)

// Cargar el rol del usuario cuando se abre el menú
const loadUserRole = async () => {
  if (authStore.isAuthenticated && !rolesStore.currentRole) {
    loadingRole.value = true
    try {
      await rolesStore.getUserRole()
    } catch (error) {
      console.error('Error al cargar el rol del usuario:', error)
    } finally {
      loadingRole.value = false
    }
  }
}

// Observar cambios en la autenticación para cargar el rol
watch(() => authStore.isAuthenticated, (isAuth) => {
  if (isAuth) {
    loadUserRole()
  }
})

// Método para cerrar el drawer
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

// Método para manejar la apertura del menú de usuario
const handleMenuOpen = () => {
  if (authStore.isAuthenticated) {
    loadUserRole()
  }
}
</script>

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

.user-drawer-info {
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.03);
  
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

/* Mobile adjustments - Logo más grande en móvil */
@media (max-width: 600px) {
  .logo-container {
    width: 58px;   /* Aumentado de 55px a 65px */
    height: 58px;  /* Manteniendo proporción cuadrada */
  }
  
  :deep(canvas) {
    transform: scale(1.1); /* Aumentado de 0.9 a 1.1 para hacer el logo más grande */
  }
}
</style>