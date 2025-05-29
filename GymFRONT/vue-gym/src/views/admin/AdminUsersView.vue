<template>
  <v-container fluid class="admin-users">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold">Gestión de Usuarios</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Administra todos los usuarios de la plataforma
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            @click="openCreateDialog"
            prepend-icon="mdi-account-plus"
          >
            Crear Usuario
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Buscar usuarios"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="Estado"
          variant="outlined"
          clearable
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="adminFilter"
          :items="adminOptions"
          label="Tipo de usuario"
          variant="outlined"
          clearable
          hide-details
        ></v-select>
      </v-col>
      <v-col cols="12" md="2">
        <v-btn @click="clearFilters" variant="outlined" block>
          Limpiar
        </v-btn>
      </v-col>
    </v-row>

    <!-- Users Table -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :loading="adminStore.userLoading"
        :search="search"
        class="elevation-1"
        loading-text="Cargando usuarios..."
        no-data-text="No hay usuarios para mostrar"
      >
        <!-- Avatar Column -->
        <template v-slot:item.avatar="{ item }">
          <v-avatar size="40" class="my-2">
            <v-img
              v-if="item.fotoPerfilURL"
              :src="item.fotoPerfilURL"
              :alt="`${item.nombre} ${item.apellido}`"
            ></v-img>
            <span v-else class="text-h6">
              {{ item.nombre.charAt(0) }}{{ item.apellido.charAt(0) }}
            </span>
          </v-avatar>
        </template>

        <!-- Name Column -->
        <template v-slot:item.nombre="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.nombre }} {{ item.apellido }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
          </div>
        </template>

        <!-- Status Column -->
        <template v-slot:item.estaActivo="{ item }">
          <v-chip
            :color="item.estaActivo ? 'success' : 'error'"
            size="small"
            variant="flat"
          >
            {{ item.estaActivo ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <!-- Admin Column -->
        <template v-slot:item.esAdmin="{ item }">
          <v-chip
            v-if="item.esAdmin"
            color="primary"
            size="small"
            variant="flat"
          >
            <v-icon start size="small">mdi-shield-crown</v-icon>
            Admin
          </v-chip>
          <span v-else class="text-medium-emphasis">Usuario</span>
        </template>

        <!-- Date Column -->
        <template v-slot:item.fechaRegistro="{ item }">
          {{ formatDate(item.fechaRegistro) }}
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-2">
            <v-btn
              size="small"
              icon="mdi-pencil"
              color="primary"
              variant="text"
              @click="editUser(item)"
            ></v-btn>
            <v-btn
              size="small"
              icon="mdi-delete"
              color="error"
              variant="text"
              @click="deleteUser(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create/Edit User Dialog -->
    <v-dialog v-model="showDialog" max-width="600">
      <v-card>
        <v-card-title>
          {{ editingUser ? 'Editar Usuario' : 'Crear Usuario' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="userForm" v-model="formValid">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="userFormData.nombre"
                  label="Nombre"
                  :rules="[v => !!v || 'El nombre es requerido']"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="userFormData.apellido"
                  label="Apellido"
                  :rules="[v => !!v || 'El apellido es requerido']"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="userFormData.email"
                  label="Email"
                  type="email"
                  :rules="[
                    v => !!v || 'El email es requerido',
                    v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
                  ]"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" v-if="!editingUser">
                <v-text-field
                  v-model="userFormData.password"
                  label="Contraseña"
                  type="password"
                  :rules="[
                    v => !!v || 'La contraseña es requerida',
                    v => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
                  ]"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="userFormData.edad"
                  label="Edad (opcional)"
                  type="number"
                  min="1"
                  max="120"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="userFormData.peso"
                  label="Peso (kg, opcional)"
                  type="number"
                  min="1"
                  max="500"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  v-model="userFormData.esAdmin"
                  label="Usuario Administrador"
                  color="primary"
                ></v-checkbox>
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  v-model="userFormData.estaActivo"
                  label="Usuario Activo"
                  color="success"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="closeDialog" variant="text">Cancelar</v-btn>
          <v-btn
            @click="saveUser"
            color="primary"
            :loading="adminStore.loading"
            :disabled="!formValid"
          >
            {{ editingUser ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar al usuario <strong>{{ userToDelete?.nombre }} {{ userToDelete?.apellido }}</strong>?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showDeleteDialog = false" variant="text">Cancelar</v-btn>
          <v-btn
            @click="confirmDelete"
            color="error"
            :loading="adminStore.loading"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="showSnackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore, type AdminUser } from '@/stores/admin'

const adminStore = useAdminStore()

// Reactive data
const search = ref('')
const statusFilter = ref(null)
const adminFilter = ref(null)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingUser = ref<AdminUser | null>(null)
const userToDelete = ref<AdminUser | null>(null)
const formValid = ref(false)
const userForm = ref()

// Snackbar
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Form data
const userFormData = ref({
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  esAdmin: false,
  estaActivo: true,
  edad: null as number | null,
  peso: null as number | null,
})

// Filter options
const statusOptions = [
  { title: 'Activos', value: true },
  { title: 'Inactivos', value: false }
]

const adminOptions = [
  { title: 'Administradores', value: true },
  { title: 'Usuarios normales', value: false }
]

// Table headers
const headers = [
  { title: '', key: 'avatar', sortable: false, width: 60 },
  { title: 'Usuario', key: 'nombre', sortable: true },
  { title: 'Estado', key: 'estaActivo', sortable: true, width: 120 },
  { title: 'Tipo', key: 'esAdmin', sortable: true, width: 120 },
  { title: 'Fecha Registro', key: 'fechaRegistro', sortable: true, width: 150 },
  { title: 'Acciones', key: 'actions', sortable: false, width: 120 }
]

// Computed
const filteredUsers = computed(() => {
  let users = adminStore.users

  if (statusFilter.value !== null) {
    users = users.filter(user => user.estaActivo === statusFilter.value)
  }

  if (adminFilter.value !== null) {
    users = users.filter(user => user.esAdmin === adminFilter.value)
  }

  return users
})

// Methods
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('es-ES')
}

const clearFilters = () => {
  search.value = ''
  statusFilter.value = null
  adminFilter.value = null
}

const openCreateDialog = () => {
  editingUser.value = null
  userFormData.value = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    esAdmin: false,
    estaActivo: true,
    edad: null,
    peso: null,
  }
  showDialog.value = true
}

const editUser = (user: AdminUser) => {
  editingUser.value = user
  userFormData.value = {
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    password: '',
    esAdmin: user.esAdmin,
    estaActivo: user.estaActivo,
    edad: user.edad || null,
    peso: user.peso || null,
  }
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  editingUser.value = null
  userForm.value?.reset()
}

const saveUser = async () => {
  if (!userForm.value?.validate()) return

  try {
    if (editingUser.value) {
      await adminStore.updateUser(editingUser.value.usuarioID, userFormData.value)
      showNotification('Usuario actualizado correctamente', 'success')
    } else {
      await adminStore.createUser(userFormData.value)
      showNotification('Usuario creado correctamente', 'success')
    }
    closeDialog()
  } catch (error) {
    showNotification(adminStore.error || 'Error al guardar usuario', 'error')
  }
}

const deleteUser = (user: AdminUser) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!userToDelete.value) return

  try {
    await adminStore.deleteUser(userToDelete.value.usuarioID)
    showNotification('Usuario eliminado correctamente', 'success')
    showDeleteDialog.value = false
    userToDelete.value = null
  } catch (error) {
    showNotification(adminStore.error || 'Error al eliminar usuario', 'error')
  }
}

const showNotification = (message: string, color: string) => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Lifecycle
onMounted(() => {
  adminStore.fetchUsers()
})
</script>

<style scoped>
.admin-users {
  padding: 16px;
}

@media (max-width: 600px) {
  .admin-users {
    padding: 8px;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>