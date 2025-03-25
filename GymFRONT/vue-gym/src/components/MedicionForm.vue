<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Medicion, MedicionCreateDTO, MedicionUpdateDTO } from '@/types/Medicion';
import { useAuthStore } from '@/stores/auth';
import type { VForm } from 'vuetify/components';
import { useDisplay } from 'vuetify';
import { mdiWeight, mdiHumanMaleHeight, mdiWater, mdiRuler, mdiNote, mdiCalendar } from '@mdi/js';

const props = defineProps<{
  medicion?: Medicion;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  (e: 'save', medicion: MedicionCreateDTO | MedicionUpdateDTO): void;
  (e: 'cancel'): void;
}>();

const authStore = useAuthStore();
const formRef = ref<VForm | null>(null);
const display = useDisplay();

// Reglas de validación
const rules = {
  required: (v: any) => !!v || 'Este campo es requerido',
  peso: [
    (v: number) => !v || v >= 20 || 'El peso debe ser al menos 20 kg',
    (v: number) => !v || v <= 500 || 'El peso debe ser menor a 500 kg'
  ],
  altura: [
    (v: number) => !v || v >= 0.5 || 'La altura debe ser al menos 0.5 m',
    (v: number) => !v || v <= 2.5 || 'La altura debe ser menor a 2.5 m'
  ],
  porcentaje: [
    (v: number) => !v || v >= 1 || 'El porcentaje debe ser al menos 1%',
    (v: number) => !v || v <= 70 || 'El porcentaje debe ser menor a 70%'
  ],
  medida: [
    (v: number) => !v || v >= 10 || 'La medida debe ser al menos 10 cm',
    (v: number) => !v || v <= 200 || 'La medida debe ser menor a 200 cm'
  ],
  notas: [
    (v: string) => !v || v.length <= 500 || 'Las notas deben tener máximo 500 caracteres'
  ]
};

// Estados del formulario
const form = ref<MedicionCreateDTO | MedicionUpdateDTO>({
  usuarioID: authStore.user?.usuarioID || 0,
  fecha: new Date(),
  peso: undefined,
  altura: undefined,
  porcentajeGrasa: undefined,
  circunferenciaBrazo: undefined,
  circunferenciaPecho: undefined,
  circunferenciaCintura: undefined,
  circunferenciaMuslo: undefined,
  notas: ''
});

// Cargar datos si estamos en modo edición
onMounted(() => {
  if (props.isEdit && props.medicion) {
    form.value = {
      usuarioID: props.medicion.usuarioID,
      fecha: props.medicion.fecha,
      peso: props.medicion.peso,
      altura: props.medicion.altura,
      porcentajeGrasa: props.medicion.porcentajeGrasa,
      circunferenciaBrazo: props.medicion.circunferenciaBrazo,
      circunferenciaPecho: props.medicion.circunferenciaPecho,
      circunferenciaCintura: props.medicion.circunferenciaCintura,
      circunferenciaMuslo: props.medicion.circunferenciaMuslo,
      notas: props.medicion.notas
    };
  }
});

// Calcular IMC en tiempo real para mostrar al usuario
const calculatedIMC = computed(() => {
  // Asumimos que la altura está en metros (Por ejemplo: 1.75m)
  if (form.value.peso && form.value.altura && form.value.altura > 0) {
    // IMC = peso(kg) / (altura(m))²
    return (form.value.peso / (form.value.altura * form.value.altura)).toFixed(2);
  }
  return null;
});

// Determinar la categoría de IMC para mostrar al usuario
const imcCategory = computed(() => {
  const imc = parseFloat(calculatedIMC.value || '0');
  if (imc <= 0) return null;
  
  if (imc < 18.5) return { text: 'Bajo peso', color: 'warning' };
  if (imc < 25) return { text: 'Peso normal', color: 'success' };
  if (imc < 30) return { text: 'Sobrepeso', color: 'warning' };
  if (imc < 35) return { text: 'Obesidad (Grado 1)', color: 'error' };
  if (imc < 40) return { text: 'Obesidad (Grado 2)', color: 'error' };
  return { text: 'Obesidad (Grado 3)', color: 'error' };
});

// Manejar el envío del formulario
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  const { valid } = await formRef.value.validate();
  
  if (valid) {
    emit('save', form.value);
  }
};

// Formatear fecha para mostrar
const formatDate = (date: Date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};
</script>

<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-container class="pa-0">
      <!-- Datos principales: Fecha, Peso y Altura -->
      <v-row>
        <v-col cols="12" sm="4">
          <v-card class="mb-4 measurement-card" elevation="2">
            <v-card-title class="primary-bg d-flex align-center">
              <v-icon :icon="mdiCalendar" class="me-2" size="small" color="white"></v-icon>
              <span class="text-white">Fecha</span>
            </v-card-title>
            <v-card-text>
              <v-date-picker
                v-model="form.fecha"
                :max="new Date().toISOString().substr(0, 10)"
                class="mx-auto my-2"
                density="compact"
                :width="display.mdAndUp.value ? '290' : '100%'"
              ></v-date-picker>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="4">
          <v-card class="mb-4 measurement-card" elevation="2">
            <v-card-title class="primary-bg d-flex align-center">
              <v-icon :icon="mdiWeight" class="me-2" size="small" color="white"></v-icon>
              <span class="text-white">Peso (kg)</span>
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model.number="form.peso"
                type="number"
                :rules="rules.peso"
                variant="outlined"
                density="comfortable"
                bg-color="white"
                placeholder="Ej: 70.5"
                hide-details="auto"
              ></v-text-field>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="4">
          <v-card class="mb-4 measurement-card" elevation="2">
            <v-card-title class="primary-bg d-flex align-center">
              <v-icon :icon="mdiHumanMaleHeight" class="me-2" size="small" color="white"></v-icon>
              <span class="text-white">Altura (m)</span>
            </v-card-title>
            <v-card-text>
              <v-text-field
                v-model.number="form.altura"
                type="number"
                :rules="rules.altura"
                variant="outlined"
                density="comfortable"
                bg-color="white"
                placeholder="Ej: 1.75"
                step="0.01"
                hide-details="auto"
              ></v-text-field>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- IMC Calculado -->
      <v-card v-if="calculatedIMC" class="mb-4 imc-card" elevation="2">
        <v-card-title :class="`${imcCategory ? imcCategory.color : 'primary'}-bg`" class="d-flex justify-space-between align-center">
          <span class="text-white">Índice de Masa Corporal (IMC)</span>
          <v-chip :color="imcCategory ? imcCategory.color : 'primary'" class="ml-2 font-weight-bold">
            {{ calculatedIMC }}
          </v-chip>
        </v-card-title>
        <v-card-text v-if="imcCategory" class="text-center pa-4">
          <p class="mb-0 font-weight-medium">Categoría: {{ imcCategory.text }}</p>
        </v-card-text>
      </v-card>

      <!-- Grupo de medidas corporales -->
      <v-card class="mb-4" elevation="2">
        <v-card-title class="primary-bg d-flex align-center">
          <v-icon :icon="mdiRuler" class="me-2" size="small" color="white"></v-icon>
          <span class="text-white">Medidas Corporales</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.porcentajeGrasa"
                label="Porcentaje de grasa (%)"
                :rules="rules.porcentaje"
                variant="outlined"
                density="comfortable"
                bg-color="white"
                type="number"
                placeholder="Ej: 20"
                hide-details="auto"
                :prepend-inner-icon="mdiWater"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.circunferenciaBrazo"
                label="Circunf. brazo (cm)"
                :rules="rules.medida"
                variant="outlined"
                density="comfortable"
                bg-color="white"
                type="number"
                placeholder="Ej: 35"
                hide-details="auto"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.circunferenciaPecho"
                label="Circunf. pecho (cm)"
                :rules="rules.medida"
                variant="outlined"
                density="comfortable"
                bg-color="white"
                type="number"
                placeholder="Ej: 95"
                hide-details="auto"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.circunferenciaCintura"
                label="Circunf. cintura (cm)"
                :rules="rules.medida"
                variant="outlined"
                density="comfortable"
                bg-color="white"
                type="number"
                placeholder="Ej: 80"
                hide-details="auto"
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.circunferenciaMuslo"
                label="Circunf. muslo (cm)"
                :rules="rules.medida"
                variant="outlined"
                density="comfortable"
                bg-color="white"
                type="number"
                placeholder="Ej: 55"
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Notas -->
      <v-card class="mb-4" elevation="2">
        <v-card-title class="primary-bg d-flex align-center">
          <v-icon :icon="mdiNote" class="me-2" size="small" color="white"></v-icon>
          <span class="text-white">Notas adicionales</span>
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="form.notas"
            :rules="rules.notas"
            variant="outlined"
            counter="500"
            rows="3"
            auto-grow
            bg-color="white"
            density="comfortable"
            placeholder="Añade observaciones o notas sobre esta medición"
            hide-details="auto"
          ></v-textarea>
        </v-card-text>
      </v-card>

      <!-- Botones -->
      <div class="d-flex justify-end mt-4 mb-6">
        <v-btn 
          color="error" 
          variant="outlined" 
          class="me-2" 
          @click="emit('cancel')"
        >
          Cancelar
        </v-btn>
        <v-btn 
          color="primary" 
          variant="elevated" 
          type="submit"
        >
          {{ props.isEdit ? 'Actualizar' : 'Guardar' }} Medición
        </v-btn>
      </div>
    </v-container>
  </v-form>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.primary-bg {
  background-color: $primary-color;
}

.success-bg {
  background-color: #4CAF50;
}

.warning-bg {
  background-color: #FB8C00;
}

.error-bg {
  background-color: #F44336;
}

.imc-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
}

.measurement-card {
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
}

.v-card-title {
  font-family: $font-family-base;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 0.75rem 1rem !important;
}

.v-card-text {
  padding: 1rem !important;
}

.v-text-field, .v-textarea {
  margin-bottom: 0.5rem;
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
  padding: 0.5rem 1.25rem !important;
  
  &:hover {
    transform: translateY(-1px);
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .v-card-title {
    font-size: 1rem;
    padding: 0.6rem 0.8rem !important;
  }
  
  .v-card-text {
    padding: 0.8rem !important;
  }
  
  .v-btn {
    padding: 0.4rem 1rem !important;
  }
}