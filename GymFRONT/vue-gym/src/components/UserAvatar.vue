<!-- src/components/UserAvatar.vue -->
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  nombre?: string;
  apellido?: string;
  photoUrl?: string | null;
  size?: number | string;
  showUploadButton?: boolean;
}>();

const emit = defineEmits(['upload']);

// Crear iniciales a partir del nombre y apellido
const initials = computed(() => {
  const n = (props.nombre || '').charAt(0).toUpperCase();
  const a = (props.apellido || '').charAt(0).toUpperCase();
  return n + a || '?';
});

// Calcular colores de fondo basados en el nombre (para que sea consistente)
const backgroundColor = computed(() => {
  const colors = [
    '#E53935', // Rojo
    '#D81B60', // Rosa
    '#8E24AA', // Púrpura
    '#5E35B1', // Violeta
    '#3949AB', // Índigo
    '#1E88E5', // Azul
    '#039BE5', // Azul claro
    '#00ACC1', // Cian
    '#00897B', // Verde azulado
    '#43A047', // Verde
    '#7CB342', // Verde claro
    '#C0CA33', // Lima
    '#FDD835', // Amarillo
    '#FFB300', // Ámbar
    '#FB8C00', // Naranja
    '#F4511E', // Naranja profundo
  ];
  
  // Usar la suma de los códigos ASCII de las iniciales para determinar el color
  const sum = [...initials.value].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
});

// Calcular tamaño de fuente basado en el tamaño del avatar
const fontSize = computed(() => {
  const size = typeof props.size === 'number' ? props.size : parseInt(props.size as string) || 40;
  return Math.max(size / 2.5, 14) + 'px';
});

// Manejar la subida de archivos
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    emit('upload', input.files[0]);
  }
};

// Determinar si mostrar foto o iniciales
const showPhoto = computed(() => !!props.photoUrl);
</script>

<template>
  <div class="user-avatar-container" :style="{ width: `${size}px`, height: `${size}px` }">
    <!-- Avatar con foto o iniciales -->
    <div class="user-avatar" :style="{ width: `${size}px`, height: `${size}px` }">
      <img
        v-if="showPhoto"
        :src="photoUrl"
        alt="Foto de perfil"
        class="avatar-image"
      />
      <div
        v-else
        class="avatar-initials"
        :style="{
          backgroundColor,
          fontSize,
          width: `${size}px`,
          height: `${size}px`,
          lineHeight: `${size}px`
        }"
      >
        {{ initials }}
      </div>
    </div>

    <!-- Botón de carga de foto -->
    <div v-if="showUploadButton" class="upload-button-container">
      <label for="avatar-upload" class="upload-button">
        <v-icon>mdi-camera</v-icon>
      </label>
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        @change="handleFileUpload"
        class="hidden-input"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.user-avatar-container {
  position: relative;
  display: inline-block;
  border-radius: 50%;
}

.user-avatar {
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-family: $font-family-base;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.upload-button-container {
  position: absolute;
  right: -5px;
  bottom: -5px;
  background-color: $primary-color;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    background-color: darken($primary-color, 10%);
  }
  
  .upload-button {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
  }
}

.hidden-input {
  display: none;
}

// Responsive
@media (max-width: 600px) {
  .upload-button-container {
    width: 28px;
    height: 28px;
  }
}
</style>