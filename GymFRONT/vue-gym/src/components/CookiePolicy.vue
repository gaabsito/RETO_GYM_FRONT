<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits(['close', 'update:show']);

// Props para personalizar el diálogo
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  theme: {
    type: String,
    default: 'dark', // 'dark', 'light'
    validator: (value: string) => ['dark', 'light'].includes(value)
  }
});

// Crear una propiedad computada para manejar la visibilidad del diálogo
const dialogVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

// Referencias a los checkboxes
const necessaryCookies = ref(true); // Siempre activado y no se puede desactivar
const analyticsCookies = ref(true);
const marketingCookies = ref(false);
const preferenceCookies = ref(true);

// Función para guardar las preferencias
const savePreferences = () => {
  const preferences = {
    necessary: necessaryCookies.value,
    analytics: analyticsCookies.value,
    marketing: marketingCookies.value,
    preferences: preferenceCookies.value
  };
  
  localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
  localStorage.setItem('cookie-consent', 'customized');
  
  emit('close');
};

// Función para aceptar todas
const acceptAll = () => {
  necessaryCookies.value = true;
  analyticsCookies.value = true;
  marketingCookies.value = true;
  preferenceCookies.value = true;
  
  savePreferences();
};
</script>

<template>
  <v-dialog v-model="dialogVisible" max-width="800px" persistent>
    <v-card :color="theme === 'dark' ? 'grey-darken-4' : 'white'">
      <v-card-title class="text-h5 d-flex justify-space-between">
        <span>Política de Cookies</span>
        <v-btn icon variant="text" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <p class="text-body-1">
                Este sitio web utiliza cookies para mejorar tu experiencia mientras navegas por la web. 
                A continuación, puedes elegir qué tipo de cookies deseas aceptar:
              </p>
            </v-col>
            
            <v-col cols="12">
              <v-list>
                <!-- Cookies necesarias - Siempre activadas -->
                <v-list-item>
                  <template v-slot:prepend>
                    <v-checkbox v-model="necessaryCookies" disabled></v-checkbox>
                  </template>
                  <v-list-item-title>Cookies necesarias</v-list-item-title>
                  <v-list-item-subtitle>
                    Estas cookies son esenciales para el funcionamiento básico del sitio web y no pueden ser desactivadas.
                  </v-list-item-subtitle>
                </v-list-item>

                <!-- Cookies analíticas -->
                <v-list-item>
                  <template v-slot:prepend>
                    <v-checkbox v-model="analyticsCookies"></v-checkbox>
                  </template>
                  <v-list-item-title>Cookies analíticas</v-list-item-title>
                  <v-list-item-subtitle>
                    Nos ayudan a entender cómo utilizas nuestro sitio web, qué páginas son las más visitadas
                    y cómo mejorar la experiencia del usuario.
                  </v-list-item-subtitle>
                </v-list-item>

                <!-- Cookies de marketing -->
                <v-list-item>
                  <template v-slot:prepend>
                    <v-checkbox v-model="marketingCookies"></v-checkbox>
                  </template>
                  <v-list-item-title>Cookies de marketing</v-list-item-title>
                  <v-list-item-subtitle>
                    Estas cookies son utilizadas para mostrarte publicidad relevante basada en tus intereses.
                  </v-list-item-subtitle>
                </v-list-item>

                <!-- Cookies de preferencias -->
                <v-list-item>
                  <template v-slot:prepend>
                    <v-checkbox v-model="preferenceCookies"></v-checkbox>
                  </template>
                  <v-list-item-title>Cookies de preferencias</v-list-item-title>
                  <v-list-item-subtitle>
                    Permiten que el sitio web recuerde información que cambia la forma en que se comporta
                    o se ve, como tu idioma preferido o la región en la que te encuentras.
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            
            <v-col cols="12">
              <p class="text-body-2 mb-4">
                Para más información sobre las cookies que utilizamos, puedes consultar nuestra
                <a href="/privacy-policy" target="_blank">Política de Privacidad</a>.
              </p>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      
      <v-card-actions class="d-flex justify-end pa-4">
        <v-btn variant="outlined" :color="theme === 'dark' ? 'white' : 'primary'" @click="$emit('close')">
          Cancelar
        </v-btn>
        <v-btn variant="outlined" :color="theme === 'dark' ? 'white' : 'primary'" @click="savePreferences" class="mx-2">
          Guardar preferencias
        </v-btn>
        <v-btn color="primary" @click="acceptAll">
          Aceptar todas
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

:deep(.v-checkbox) {
  margin-right: 12px;
}

:deep(.v-list-item) {
  padding: 16px 8px;
}

:deep(.v-list-item-title) {
  font-weight: bold;
  margin-bottom: 4px;
}

:deep(.v-list-item-subtitle) {
  line-height: 1.4;
  opacity: 0.8;
}

.v-card {
  border-radius: $border-radius !important;
}

.v-card-text {
  padding: 12px !important;
}

.v-card-title {
  padding: 12px !important;
}

.v-list {
  border-radius: $border-radius !important;
}

.text-body-1 {
  padding-top: 16px !important;
  padding-bottom: 16px !important;
}

.text-body-2 {
  padding-top: 16px !important;
  padding-bottom: 16px !important;
}

.mb-4 {
  margin: 0px !important;
}

.v-btn {
  padding-right: 1rem !important;
  padding-left: 1rem !important;
}

a {
  color: $primary-color;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>