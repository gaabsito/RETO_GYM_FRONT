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
  <v-app-bar class="app-bar">
    <!-- Icono de menú móvil -->
    <v-app-bar-nav-icon @click="toggleDrawer" class="nav-icon"></v-app-bar-nav-icon>
    
    <!-- Logo -->
    <router-link to="/" class="app-bar__logo">
      <div class="logo-container">
        <LogoCanvas />
      </div>
    </router-link>
    
    <v-spacer></v-spacer>
    
    <!-- Sección de autenticación simplificada -->
    <div class="auth-section">
      <template v-if="!authStore.isAuthenticated">
        <!-- Solo botón de iniciar sesión -->
        <v-btn variant="text" to="/login" class="auth-btn">
          INICIAR SESIÓN
        </v-btn>
      </template>
      
      <template v-else>
        <!-- Solo el avatar con menú desplegable -->
        <div class="user-menu-container">
          <UserAvatar
            :nombre="authStore.user?.nombre"
            :apellido="authStore.user?.apellido"
            :photoUrl="photoUrl"
            :size="avatarSize"
            :showBorder="true"
            class="user-avatar-header"
            @click="menuOpen = !menuOpen"
          />
          
          <!-- Menú desplegable simplificado -->
          <v-menu
            v-model="menuOpen"
            :close-on-content-click="false"
            location="bottom end"
            transition="scale-transition"
            min-width="200"
          >
            <v-card>
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
                
                <!-- Opciones simplificadas -->
                <v-list-item to="/profile" prepend-icon="mdi-account">
                  <v-list-item-title>Mi Perfil</v-list-item-title>
                </v-list-item>
                
                <v-list-item @click="handleLogout" prepend-icon="mdi-logout" color="error">
                  <v-list-item-title>Cerrar Sesión</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </template>
    </div>
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
  padding: 0 16px;
}

.app-bar__logo {
  color: white;
  font-weight: bold;
  text-decoration: none;
  margin-right: 16px;
}

/* Eliminados todos los estilos relacionados con la navegación en el header */

.nav-icon {
  margin-right: 8px;
}

/* Sección de autenticación */
.auth-section {
  display: flex;
  align-items: center;
}

.auth-btn {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Estilos para el avatar y menú de usuario */
.user-menu-container {
  position: relative;
  cursor: pointer;
}

.user-avatar-header {
  cursor: pointer;
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
</style>