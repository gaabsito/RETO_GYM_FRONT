<template>
 <v-container fluid class="profile-container px-0">
<!-- Header -->
<v-card class="profile-header-card mb-4" flat>
<v-card-title class="profile-title text-white text-center py-6">
 MI PERFIL
</v-card-title>
</v-card>
<!-- Content Section -->
<v-card class="content-card mx-auto" elevation="0" max-width="1400">
<!-- Tabs -->
<v-tabs v-model="selectedTabIndex" bg-color="#e25401" align-tabs="center" show-arrows slider-color="white"
class="profile-tabs">
<v-tab v-for="(tab, index) in tabs" :key="index" :value="index" class="white--text tab-spacing">
<v-icon start color="white" class="mr-2">{{ tab.icon }}</v-icon>
 {{ tab.title }}
</v-tab>
</v-tabs>
<!-- Loading State -->
<div v-if="loading.profile" class="d-flex justify-center align-center loading-container">
<v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
</div>
<v-window v-else v-model="selectedTabIndex">
<!-- Tab de Información Personal -->
<v-window-item :value="0">
<v-card flat class="pa-4">
<!-- Error & Success Alerts -->
<v-alert v-if="error.profile" type="error" class="mb-4" variant="tonal">
 {{ error.profile }}
</v-alert>
<v-alert v-if="success.profile" type="success" class="mb-4" variant="tonal">
 {{ success.profile }}
</v-alert>
<!-- Alerta para la foto de perfil -->
<v-alert v-if="error.photo" type="error" class="mb-4" variant="tonal">
 {{ error.photo }}
</v-alert>
<v-alert v-if="success.photo" type="success" class="mb-4" variant="tonal">
 {{ success.photo }}
</v-alert>
<v-form ref="formRef" @submit.prevent="updateProfile" :disabled="loading.profile">
<div class="profile-section">
<h2 class="section-title">INFORMACIÓN PERSONAL</h2>
<!-- Foto de Perfil -->
<div class="d-flex flex-column align-center mb-6">
<div class="avatar-container">
<UserAvatar
 :nombre="personalForm.nombre"
 :apellido="personalForm.apellido"
 :photoUrl="photoPreview"
 :size="avatarSize"
 :showUploadButton="true"
 @upload="handlePhotoUpload"
 />
<!-- Botón para eliminar foto si existe -->
<v-btn
v-if="photoPreview"
size="small"
color="error"
variant="text"
class="mt-2"
 @click="removeProfilePhoto"
 :loading="loading.photo"
 :disabled="loading.photo"
>
<v-icon start size="small">mdi-delete</v-icon>
 Eliminar foto
</v-btn>
</div>
</div>
<v-row>
<v-col cols="12" md="6">
<label class="input-label">NOMBRE</label>
<v-text-field v-model="personalForm.nombre" prepend-inner-icon="mdi-account"
 :rules="[rules.required]" variant="outlined" required density="comfortable" bg-color="white"
class="input-field" />
</v-col>
<v-col cols="12" md="6">
<label class="input-label">APELLIDO</label>
<v-text-field v-model="personalForm.apellido" prepend-inner-icon="mdi-account"
 :rules="[rules.required]" variant="outlined" required density="comfortable" bg-color="white"
class="input-field" />
</v-col>
<v-col cols="12">
<label class="input-label">EMAIL</label>
<v-text-field v-model="personalForm.email" prepend-inner-icon="mdi-email"
 :rules="[rules.required, rules.email]" type="email" variant="outlined" required
density="comfortable" bg-color="white" class="input-field" :disabled="isGoogleAccount"
 :hint="isGoogleAccount ? 'El email no se puede modificar en cuentas vinculadas a Google' : ''"
persistent-hint />
</v-col>
</v-row>
</div>
<div class="profile-section mt-6">
<h2 class="section-title">SEGURIDAD</h2>
<div class="password-section px-4 py-3">
<div class="d-flex align-center justify-space-between">
<div>
<div class="password-label">CONTRASEÑA</div>
<div class="password-hint">
<!-- Mostrar mensaje diferente dependiendo de si es cuenta de Google -->
<span v-if="isGoogleAccount">
 Tu cuenta está vinculada a Google. La contraseña se gestiona a través de Google.
</span>
<span v-else>
 Cambia tu contraseña para mantener tu cuenta segura
</span>
</div>
</div>
<!-- Desactivar el botón si es cuenta de Google -->
<v-btn color="primary" variant="outlined"
 @click="passwordState.isChanging = !passwordState.isChanging" class="change-btn"
 :disabled="isGoogleAccount">
 {{ passwordState.isChanging ? 'CANCELAR' : 'CAMBIAR' }}
</v-btn>
</div>
<!-- Mostrar una alerta si es cuenta de Google -->
<v-alert v-if="isGoogleAccount" type="info" class="mt-3" variant="tonal" density="compact">
 Las cuentas vinculadas a Google no pueden cambiar su correo electrónico ni contraseña directamente.
 Debes gestionar estos datos a través de tu cuenta de Google.
</v-alert>
<v-expand-transition>
<div v-if="passwordState.isChanging && !isGoogleAccount" class="mt-4">
<v-row>
<v-col cols="12">
<v-text-field v-model="passwordState.currentPassword" label="Contraseña Actual"
 :rules="[rules.required, rules.password]" type="password" variant="outlined"
prepend-inner-icon="mdi-lock" bg-color="white" density="comfortable" />
</v-col>
<v-col cols="12" md="6">
<v-text-field v-model="passwordState.newPassword" label="Nueva Contraseña"
 :rules="[rules.required, rules.password]" type="password" variant="outlined"
prepend-inner-icon="mdi-lock-plus" bg-color="white" density="comfortable" />
</v-col>
<v-col cols="12" md="6">
<v-text-field v-model="passwordState.confirmPassword" label="Confirmar Contraseña"
 :rules="[rules.required, rules.passwordMatch]" type="password" variant="outlined"
prepend-inner-icon="mdi-lock-check" bg-color="white" density="comfortable" />
</v-col>
</v-row>
</div>
</v-expand-transition>
</div>
<div class="d-flex justify-center mt-6">
<v-btn type="submit" color="primary" size="large" min-width="220" :loading="loading.profile || loading.photo"
class="save-button">
<v-icon start class="mr-1">mdi-content-save</v-icon>
 GUARDAR CAMBIOS
</v-btn>
</div>
<!-- Progreso y Calendario de entrenamientos -->
<div class="progreso-section mt-6">
<UserProgress />
</div>
</div>
<!-- Añadir sección de logros -->
<div class="progreso-section mt-6">
<h2 class="section-title">MIS LOGROS</h2>
<LogrosSummaryCard :show-latest-only="true" :max-logros="3" />
<div class="text-center mt-4">
<v-btn color="primary" to="/logros" prepend-icon="mdi-trophy">
 Ver todos mis logros
</v-btn>
</div>
</div>
</v-form>
</v-card>
</v-window-item>
<!-- Tab de Mis Entrenamientos -->
<v-window-item :value="1">
<v-card flat class="pa-4">
<!-- Alerts -->
<v-alert v-if="error.workouts" type="error" class="mb-4" variant="tonal">
 {{ error.workouts }}
</v-alert>
<v-alert v-if="success.workouts" type="success" class="mb-4" variant="tonal">
 {{ success.workouts }}
</v-alert>
<!-- Workouts Filters -->
<div class="d-flex justify-end mb-4">
<v-btn color="primary" variant="elevated" to="/crear-entrenamiento" prepend-icon="mdi-plus"
class="create-btn">
 CREAR NUEVO
</v-btn>
</div>
<div class="filters-container mb-6">
<v-row>
<v-col cols="12" sm="6" md="4">
<v-text-field v-model="workoutsFilter.searchQuery" label="Buscar entrenamientos"
prepend-inner-icon="mdi-magnify" variant="outlined" clearable hide-details bg-color="white"
density="comfortable"></v-text-field>
</v-col>
<v-col cols="12" sm="6" md="3">
<v-select v-model="workoutsFilter.selectedDifficulty" :items="difficulties" label="Dificultad"
prepend-inner-icon="mdi-signal-cellular-outline" variant="outlined" clearable hide-details
bg-color="white" density="comfortable"></v-select>
</v-col>
<v-col cols="12" sm="6" md="3">
<v-select v-model="workoutsFilter.showPublicOnly" :items="[
 { text: 'TODOS', value: false },
 ]" item-title="text" item-value="value" label="Visibilidad" prepend-inner-icon="mdi-eye" variant="outlined"
hide-details bg-color="white" density="comfortable"
 :disabled="workoutsFilter.showPrivateOnly"></v-select>
</v-col>
<v-col cols="12" sm="6" md="2">
<v-btn variant="text" @click="clearWorkoutFilters"
 :disabled="!workoutsFilter.searchQuery && !workoutsFilter.selectedDifficulty && !workoutsFilter.showPublicOnly && !workoutsFilter.showPrivateOnly"
class="clear-btn" block>
 LIMPIAR
</v-btn>
</v-col>
</v-row>
</div>
<!-- Loading State -->
<v-row v-if="loading.workouts" justify="center">
<v-col cols="12" class="text-center">
<v-progress-circular indeterminate color="primary" size="64" />
</v-col>
</v-row>
<!-- No Workouts State -->
<v-row v-else-if="filteredWorkouts.length === 0" justify="center">
<v-col cols="12" class="text-center py-6">
<v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-dumbbell-off</v-icon>
<h3 class="text-h5 mb-2">No tienes entrenamientos creados</h3>
<p class="text-subtitle-1 text-medium-emphasis mb-4">
 Comienza a crear tus propios entrenamientos personalizados
</p>
<v-btn color="primary" to="/crear-entrenamiento" size="large" prepend-icon="mdi-plus"
class="create-btn">
 CREAR PRIMER ENTRENAMIENTO
</v-btn>
</v-col>
</v-row>
<!-- Workouts List -->
<div v-else class="workouts-container">
<v-row>
<v-col v-for="workout in filteredWorkouts" :key="workout.entrenamientoID" cols="12" sm="6" md="4" lg="3"
class="workout-col">
<v-hover v-slot="{ isHovering, props }">
<v-card v-bind="props" :elevation="isHovering ? 8 : 2" class="workout-card h-100">
<v-img :src="workout.imagenURL || '/api/placeholder/400/300'" height="200" cover
class="bg-grey-lighten-2">
<template v-slot:placeholder>
<v-row class="fill-height ma-0" align="center" justify="center">
<v-progress-circular indeterminate color="primary"></v-progress-circular>
</v-row>
</template>
</v-img>
<v-card-title class="workout-title d-flex align-center">
<div class="text-truncate pe-2">{{ workout.titulo }}</div>
<v-chip :color="workout.publico ? 'success' : 'warning'" size="small"
class="ms-2 visibility-chip">
 {{ workout.publico ? 'PÚBLICO' : 'PRIVADO' }}
</v-chip>
</v-card-title>
<v-card-subtitle class="workout-subtitle">
<div class="d-flex align-center">
<v-icon size="small" :color="workout.dificultad === 'Fácil' ? 'success' :
workout.dificultad === 'Media' ? 'warning' : 'error'
" class="me-2">
 mdi-signal-cellular-{{
workout.dificultad === 'Fácil' ? '1' :
workout.dificultad === 'Media' ? '2' : '3'
}}
</v-icon>
 {{ workout.dificultad }} | {{ workout.duracionMinutos }} min
</div>
</v-card-subtitle>
<v-card-text class="workout-text">
<p class="text-truncate">{{ workout.descripcion }}</p>
</v-card-text>
<v-divider></v-divider>
<v-card-actions class="workout-actions">
<v-btn variant="text" color="error" @click="deleteWorkout(workout.entrenamientoID)"
class="delete-btn">
<v-icon start>mdi-delete</v-icon>
 ELIMINAR
</v-btn>
<v-spacer></v-spacer>
<v-btn variant="text" color="primary" :to="`/workouts/${workout.entrenamientoID}`"
class="view-btn">
 VER MÁS
<v-icon end>mdi-arrow-right</v-icon>
</v-btn>
</v-card-actions>
</v-card>
</v-hover>
</v-col>
</v-row>
</div>
</v-card>
</v-window-item>
<v-window-item :value="2">
<v-card flat class="pa-4">
<!-- Alertas -->
<v-alert v-if="error.progreso" type="error" class="mb-4" variant="tonal">
 {{ error.progreso }}
</v-alert>
<!-- Resumen y estadísticas -->
<div class="progreso-section">
<h2 class="section-title">ESTADÍSTICAS DE ENTRENAMIENTO</h2>
<ProgresoEstadisticas :showProgress="true" :showCalendarHeatmap="true" />
</div>
<!-- Historial de entrenamientos -->
<div class="progreso-section mt-6">
<h2 class="section-title">HISTORIAL DE ENTRENAMIENTOS</h2>
<HistorialRutinas />
</div>
</v-card>
</v-window-item>
</v-window>
</v-card>
</v-container>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useWorkoutStore } from '@/stores/workouts'
import { useLogrosStore } from '@/stores/logros' // Importar store de logros
import type { VForm } from 'vuetify/components'
import type { User } from '@/types/User'
import type { Workout } from '@/types/Workout'
import WorkoutCard from '@/components/WorkoutCard.vue'
import ProgresoEstadisticas from '@/components/ProgresoEstadisticas.vue'
import HistorialRutinas from '@/components/HistorialRutinas.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import UserProgress from '@/components/UserProgress.vue'
import LogrosSummaryCard from '@/components/LogrosSummaryCard.vue' // Importar componente de logros

// Función auxiliar para construir URLs correctas
function buildApiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7087';
  
  // Si la URL base ya termina con '/api', no añadirlo de nuevo
  if (baseUrl.endsWith('/api')) {
    // Asegurarse de que path no comience con '/'
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${baseUrl}/${cleanPath}`;
  }
  
  // Si path ya comienza con '/api', usarlo directamente
  if (path.startsWith('/api/')) {
    return `${baseUrl}${path}`;
  }
  
  // Si path comienza con '/', añadir '/api'
  if (path.startsWith('/')) {
    return `${baseUrl}/api${path}`;
  }
  
  // En cualquier otro caso, añadir '/api/'
  return `${baseUrl}/api/${path}`;
}

// Store Initialization
const authStore = useAuthStore()
const workoutStore = useWorkoutStore()
const logrosStore = useLogrosStore() // Inicializar store de logros

// Form References and State
const formRef = ref<VForm | null>(null)
const loading = ref({
  profile: false,
  workouts: false,
  photo: false,
  logros: false // Nuevo estado para carga de logros
})
const error = ref({
  profile: '',
  workouts: '',
  progreso: '',
  photo: '',
  logros: '' // Nuevo estado para errores de logros
})
const success = ref({
  profile: '',
  workouts: '',
  photo: ''
})

// Personal Information Form
const personalForm = ref({
  nombre: '',
  apellido: '',
  email: ''
})

// Estado de la foto de perfil
const photoPreview = ref<string | null>(null)
const photoFile = ref<File | null>(null)
const avatarSize = ref(120) // Tamaño del avatar

// Password Change State
const passwordState = ref({
  isChanging: false,
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Workouts Filtering
const workoutsFilter = ref({
  searchQuery: '',
  selectedDifficulty: null as string | null,
  showPublicOnly: false,
  showPrivateOnly: false,
  userWorkouts: [] as Workout[]
})
const difficulties = ['Fácil', 'Media', 'Difícil']
const selectedTabIndex = ref(0)
const tabs = [
  { title: 'INFORMACIÓN PERSONAL', icon: 'mdi-account' },
  { title: 'MIS ENTRENAMIENTOS', icon: 'mdi-dumbbell' },
  { title: 'MI PROGRESO', icon: 'mdi-chart-line' }
]

// Determinar si la cuenta es de Google basada en el método de autenticación
const isGoogleAccount = computed(() => {
  // Verificar SOLO si el método de autenticación es 'google'
  const authMethod = localStorage.getItem('authMethod') || sessionStorage.getItem('authMethod')
  return authMethod === 'google';
})

// Validation Rules
const rules = {
  required: (v: string) => !!v || 'Este campo es requerido',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Debe ser un email válido',
  password: (v: string) => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
  passwordMatch: (v: string) => v === passwordState.value.newPassword || 'Las contraseñas no coinciden',
  // Reglas de validación para imágenes
  imageSize: (v: File) => !v || v.size <= 5 * 1024 * 1024 || 'La imagen no debe exceder 5MB',
  imageType: (v: File) => !v || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(v.type) || 'Formato no soportado. Use JPG, PNG, GIF o WEBP'
}

// Lifecycle Hook: Load User Data and Workouts
onMounted(async () => {
  try {
    loading.value.profile = true
    loading.value.workouts = true
    loading.value.logros = true // Iniciar carga de logros
    
    // Log para depuración
    console.log("URL de la API:", import.meta.env.VITE_API_URL);
    
    // Fetch User Profile
    const userData = await authStore.fetchUser()
    if (userData) {
      personalForm.value = {
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email
      }
      // Establecer la foto de perfil si existe
      if (userData.fotoPerfilURL) {
        photoPreview.value = userData.fotoPerfilURL
      }
    }
    // Fetch Workouts
    await workoutStore.fetchWorkouts()
    workoutsFilter.value.userWorkouts = workoutStore.workouts.filter(
      workout => workout.autorID === userData?.usuarioID
    )
    // Cargar logros del usuario y verificar logros pendientes
    if (authStore.isAuthenticated) {
      try {
        await logrosStore.fetchLogrosUsuario()
        await logrosStore.verificarLogros()
      } catch (logroErr) {
        error.value.logros = logroErr instanceof Error ? logroErr.message : 'Error al cargar logros'
        console.error('Error al cargar logros:', logroErr)
      } finally {
        loading.value.logros = false
      }
    }
    // Registrar en la consola para debug
    console.log('Is Google Account:', isGoogleAccount.value)
    console.log('Auth Method:', localStorage.getItem('authMethod') || sessionStorage.getItem('authMethod'))
    console.log('Email:', personalForm.value.email)
  } catch (err) {
    error.value.profile = err instanceof Error
      ? err.message
      : 'Error al cargar el perfil'
  } finally {
    loading.value.profile = false
    loading.value.workouts = false
  }
})

// Computed: Filtered Workouts
const filteredWorkouts = computed(() =>
  workoutsFilter.value.userWorkouts.filter(workout => {
    const matchesSearch =
      workout.titulo.toLowerCase().includes(workoutsFilter.value.searchQuery.toLowerCase()) ||
      (workout.descripcion?.toLowerCase().includes(workoutsFilter.value.searchQuery.toLowerCase()) ?? false)
    const matchesDifficulty = !workoutsFilter.value.selectedDifficulty ||
      workout.dificultad === workoutsFilter.value.selectedDifficulty
    // Filtro de visibilidad
    const matchesVisibility =
      (!workoutsFilter.value.showPublicOnly && !workoutsFilter.value.showPrivateOnly) ||
      (workoutsFilter.value.showPublicOnly && workout.publico) ||
      (workoutsFilter.value.showPrivateOnly && !workout.publico)
    return matchesSearch && matchesDifficulty && matchesVisibility
  })
)

// Method: Update Profile
const updateProfile = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return
  try {
    loading.value.profile = true
    error.value.profile = ''
    success.value.profile = ''
    // Si la cuenta es de Google, no permitir cambiar el email
    const updateData: Partial<User> & {
      currentPassword?: string,
      newPassword?: string
    } = {
      nombre: personalForm.value.nombre,
      apellido: personalForm.value.apellido,
    }
    // Solo añadir el email si NO es una cuenta de Google
    if (!isGoogleAccount.value) {
      updateData.email = personalForm.value.email
    }
    // Handle Password Change - Solo para cuentas no-Google
    if (passwordState.value.isChanging && !isGoogleAccount.value) {
      updateData.currentPassword = passwordState.value.currentPassword
      updateData.newPassword = passwordState.value.newPassword
    }
    await authStore.updateProfile(updateData)
    success.value.profile = 'Perfil actualizado correctamente'
    // Reset Password Change State
    passwordState.value = {
      isChanging: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    // Ahora, si hay una foto nueva, la subimos
    if (photoFile.value) {
      await uploadProfilePhoto();
    }
    // Verificar logros después de actualizar el perfil
    await logrosStore.verificarLogros()
  } catch (err: any) {
    error.value.profile = err.message || 'Error al actualizar el perfil'
  } finally {
    loading.value.profile = false
  }
}

// Método para subir la foto a Cloudinary - CORREGIDO
const uploadProfilePhoto = async () => {
  if (!photoFile.value) return;
  
  try {
    loading.value.photo = true;
    error.value.photo = '';
    success.value.photo = '';
    
    // Validar el archivo
    if (photoFile.value.size > 5 * 1024 * 1024) {
      throw new Error('La imagen no debe exceder 5MB');
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(photoFile.value.type)) {
      throw new Error('Formato no soportado. Use JPG, PNG, GIF o WEBP');
    }
    
    // Crear FormData para enviar la imagen
    const formData = new FormData();
    formData.append('file', photoFile.value);
    
    const userID = authStore.user?.usuarioID;
    if (!userID) throw new Error('Usuario no autenticado');
    
    // CORRECCIÓN: Usar la función buildApiUrl para construir la URL correcta
    const url = buildApiUrl(`Usuario/${userID}/foto`);
    console.log('URL para subir foto:', url);
    
    // Enviar la imagen a la API 
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      body: formData
    });
    
    console.log('Estado de la respuesta:', response.status);
    
    // Si es un error 404, mostrar un mensaje específico
    if (response.status === 404) {
      throw new Error('La URL para subir fotos no existe (error 404). Verifica la configuración del backend.');
    }
    
    // Leer el texto de la respuesta primero
    const responseText = await response.text();
    console.log('Texto de respuesta:', responseText);
    
    // Si la respuesta está vacía, lanzar un error
    if (!responseText || responseText.trim() === '') {
      throw new Error('El servidor devolvió una respuesta vacía');
    }
    
    // Parsear el JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Error al parsear la respuesta: ${responseText}`);
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al subir la imagen');
    }
    
    // Actualizar la foto de perfil en el store
    if (authStore.user) {
      authStore.user.fotoPerfilURL = data.data;
      
      // Actualizar en localStorage o sessionStorage
      const storageUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      storageUser.fotoPerfilURL = data.data;
      
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(storageUser));
      } else if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(storageUser));
      }
    }
    
    // Actualizar el preview
    photoPreview.value = data.data;
    
    // Mostrar mensaje de éxito
    success.value.photo = 'Foto de perfil actualizada correctamente';
    
    // Limpiar el archivo
    photoFile.value = null;
  } catch (err) {
    error.value.photo = err instanceof Error ? err.message : 'Error al subir la imagen';
    console.error('Error uploading photo:', err);
  } finally {
    loading.value.photo = false;
  }
};

// Método: Manejar la subida de foto
const handlePhotoUpload = (file: File) => {
  photoFile.value = file;
  
  // Validar el archivo
  if (file.size > 5 * 1024 * 1024) {
    error.value.photo = 'La imagen no debe exceder 5MB';
    photoFile.value = null;
    return;
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    error.value.photo = 'Formato no soportado. Use JPG, PNG, GIF o WEBP';
    photoFile.value = null;
    return;
  }
  
  // Crear preview de la imagen
  const reader = new FileReader();
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
  
  // Mostrar mensaje
  success.value.photo = 'Foto seleccionada. Guarde cambios para actualizar.';
}

// Método: Eliminar foto de perfil - CORREGIDO
const removeProfilePhoto = async () => {
  try {
    if (!confirm('¿Está seguro que desea eliminar su foto de perfil?')) {
      return;
    }
    
    loading.value.photo = true;
    error.value.photo = '';
    success.value.photo = '';
    
    const userID = authStore.user?.usuarioID;
    if (!userID) throw new Error('Usuario no autenticado');
    
    // CORRECCIÓN: Usar la función buildApiUrl para construir la URL correcta
    const url = buildApiUrl(`Usuario/${userID}/foto`);
    console.log('URL para eliminar foto:', url);
    
    // Enviar solicitud para eliminar la foto
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Si es un error 404, mostrar un mensaje específico
    if (response.status === 404) {
      throw new Error('La URL para eliminar fotos no existe (error 404). Verifica la configuración del backend.');
    }
    
    // Leer el texto de la respuesta primero
    const responseText = await response.text();
    console.log('Texto de respuesta:', responseText);
    
    // Si la respuesta está vacía, lanzar un error
    if (!responseText || responseText.trim() === '') {
      throw new Error('El servidor devolvió una respuesta vacía');
    }
    
    // Parsear el JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Error al parsear la respuesta: ${responseText}`);
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al eliminar la foto');
    }
    
    // Actualizar el store
    if (authStore.user) {
      authStore.user.fotoPerfilURL = null;
      
      // Actualizar en localStorage o sessionStorage
      const storageUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
      storageUser.fotoPerfilURL = null;
      
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(storageUser));
      } else if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(storageUser));
      }
    }
    
    // Limpiar el preview
    photoPreview.value = null;
    photoFile.value = null;
    
    success.value.photo = 'Foto de perfil eliminada correctamente';
  } catch (err) {
    error.value.photo = err instanceof Error ? err.message : 'Error al eliminar la foto de perfil';
  } finally {
    loading.value.photo = false;
  }
}

// Method: Delete Workout
const deleteWorkout = async (workoutId: number) => {
  try {
    // Confirmation dialog
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este entrenamiento?')
    if (confirmDelete) {
      // Attempt to delete the workout
      await workoutStore.deleteWorkout(workoutId)
      // Update local workouts list
      workoutsFilter.value.userWorkouts = workoutsFilter.value.userWorkouts.filter(
        w => w.entrenamientoID !== workoutId
      )
      success.value.workouts = 'Entrenamiento eliminado correctamente'
    }
  } catch (err) {
    // Comprehensive error handling
    console.error('Detailed Delete Workout Error:', err)
    error.value.workouts = err instanceof Error
      ? err.message
      : 'Error al eliminar entrenamiento'
    // Optional: Show error to user
    alert(error.value.workouts)
  }
}
// Method: Clear Workout Filters
const clearWorkoutFilters = () => {
  workoutsFilter.value.searchQuery = ''
  workoutsFilter.value.selectedDifficulty = null
  workoutsFilter.value.showPublicOnly = false
  workoutsFilter.value.showPrivateOnly = false
}
</script>
<style lang="scss" scoped>
@import '@/assets/styles/main.scss';
.profile-container {
  padding: 0;
}
.profile-header-card {
  border-radius: 0;
}
.profile-title {
  border-radius: $border-radius;
  background-color: $primary-color;
  padding: 1.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  font-family: $font-family-base;
}
.content-card {
  border-radius: 0;
  padding: 0;
}
.v-input {
  padding: 12px;
}
.input-label {
  padding: 12px;
}
.v-btn {
  padding-right: 12px;
  padding-left: 12px;
}
.v-row {
  align-items: center;
}
.profile-tabs {
  background-color: $primary-color;
  border-radius: $border-radius;
}
.tab-spacing {
  margin: 0 50px;
  /* Mayor espacio entre pestañas */
  padding: 0 20px;
  font-size: 1.1rem;
}
:deep(.profile-tabs .v-tab) {
  color: white;
  font-weight: 500;
  letter-spacing: 0.5px;
  font-family: $font-family-base;
  text-transform: uppercase;
}
:deep(.profile-tabs .v-tab--selected) {
  font-weight: 700;
}
.loading-container {
  min-height: 300px;
}
.profile-section {
  margin-bottom: 2rem;
}
.section-title {
  color: $secondary-color;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-left: 1rem;
  border-left: 5px solid $primary-color;
  font-family: $font-family-base;
}
.input-label {
  display: block;
  color: $secondary-color;
  font-weight: 500;
  margin-bottom: 0.25rem;
  font-family: $font-family-base;
  font-size: 0.9rem;
}
.input-field {
  margin-bottom: 0.5rem;
}
.password-section {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: $border-radius;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.password-label {
  font-weight: 600;
  color: $secondary-color;
  font-family: $font-family-base;
  font-size: 0.9rem;
}
.password-hint {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.85rem;
  font-family: $font-family-text;
}
.change-btn {
  font-weight: 600;
  font-family: $font-family-base;
  letter-spacing: 0.5px;
}
.save-button {
  font-weight: 600;
  font-family: $font-family-base;
  letter-spacing: 0.5px;
  border-radius: $border-radius;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
}
.filters-container {
  background-color: $light-gray;
  border-radius: $border-radius;
  padding: 1.5rem;
  margin: 1rem 0 2rem;
}
.workout-card {
  border-radius: $border-radius;
  height: 100%;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-5px);
  }
}
.workout-col {
  padding: 0.5rem;
}
.workout-title {
  background-color: $primary-color;
  color: white;
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
  font-weight: 500;
  font-family: $font-family-base;
  line-height: 1.4;
}
.visibility-chip {
  font-weight: bold;
  font-size: 0.7rem !important;
}
.workout-subtitle {
  padding: 0.75rem 1rem;
  background-color: rgba(0, 0, 0, 0.02);
  font-weight: 500;
}
.progreso-section {
  margin-bottom: 2rem;
}
.section-title {
  color: $secondary-color;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-left: 1rem;
  border-left: 5px solid $primary-color;
  font-family: $font-family-base;
}
.workout-text {
  padding: 1rem;
}
.workout-actions {
  padding: 0.5rem;
}
.create-btn,
.clear-btn,
.view-btn,
.delete-btn {
  font-family: $font-family-base;
  font-weight: 600;
  letter-spacing: 0.5px;
}
:deep(.v-field) {
  border-radius: $border-radius !important;
}
.v-btn {
  border-radius: $border-radius;
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-1px);
  }
}
.workouts-container {
  padding: 0.25rem;
}
.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}
/* Ajustes responsive para mantener espaciado en diferentes tamaños de pantalla */
@media (max-width: 959px) {
  .tab-spacing {
    margin: 0 20px;
    padding: 0 10px;
  }
  .section-title {
    font-size: 1.2rem;
  }
  .avatar-container {
    margin-bottom: 1rem;
  }
}
@media (max-width: 599px) {
  .profile-title {
    padding: 1rem;
    font-size: 1.5rem;
  }
  .section-title {
    font-size: 1.1rem;
  }
  .tab-spacing {
    margin: 0 10px;
    padding: 0 5px;
    font-size: 0.9rem;
  }
}
</style>