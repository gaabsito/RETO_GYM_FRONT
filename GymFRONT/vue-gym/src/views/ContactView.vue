<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '@/components/PageHeader.vue';
import SectionContainer from '@/components/SectionContainer.vue';
import ContactImage from '@/assets/images/ContactImage.webp';

const router = useRouter();
const formSubmitted = ref(false);
const loading = ref(false);
const error = ref('');
const formRef = ref(null);

// Datos del formulario
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

// Reglas de validación
const rules = {
  name: [(v: string) => !!v || 'El nombre es requerido'],
  email: [
    (v: string) => !!v || 'El email es requerido',
    (v: string) => /.+@.+\..+/.test(v) || 'El email debe ser válido'
  ],
  subject: [(v: string) => !!v || 'El asunto es requerido'],
  message: [(v: string) => !!v || 'El mensaje es requerido']
};

// Manejar envío del formulario
const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  
  if (!valid) return;
  
  try {
    loading.value = true;
    error.value = '';
    
    // Simular envío del formulario (reemplazar con llamada real a API)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Marcar como enviado
    formSubmitted.value = true;
    
    // Limpiar formulario
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error al enviar el formulario';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-container fluid class="pa-0">
    <!-- Hero Section -->
    <PageHeader 
      title="CONTACTO"
      subtitle="Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible."
      :backgroundImage="ContactImage"
    />

    <SectionContainer>
      <v-row justify="center" class="contact-container">
        <!-- Formulario de contacto -->
        <v-col cols="12" md="8" lg="6" class="form-column">
          <!-- Success Message -->
          <v-card v-if="formSubmitted" class="mb-6 success-card text-center pa-6 fade-in">
            <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
            <v-card-title class="text-h5 mb-4">
              ¡Mensaje enviado con éxito!
            </v-card-title>
            <v-card-text>
              <p class="mb-4">Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos a la brevedad posible.</p>
              <v-btn color="primary" size="large" @click="formSubmitted = false" class="mt-4">
                Enviar otro mensaje
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Contact Form -->
          <v-card v-else class="contact-card elevation-3 fade-in">
            <v-card-title class="contact-title d-flex align-center">
              <v-icon class="me-2" color="white">mdi-email-edit</v-icon>
              Formulario de Contacto
            </v-card-title>
            
            <v-card-text class="pa-6">
              <v-alert v-if="error" type="error" class="mb-4" variant="tonal" closable>
                {{ error }}
              </v-alert>
              
              <v-form ref="formRef" @submit.prevent="handleSubmit">
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.name"
                      :rules="rules.name"
                      label="Nombre completo"
                      variant="outlined"
                      prepend-inner-icon="mdi-account"
                      density="comfortable"
                      required
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.email"
                      :rules="rules.email"
                      label="Email"
                      type="email"
                      variant="outlined"
                      prepend-inner-icon="mdi-email"
                      density="comfortable"
                      required
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.subject"
                      :rules="rules.subject"
                      label="Asunto"
                      variant="outlined"
                      prepend-inner-icon="mdi-format-title"
                      density="comfortable"
                      required
                    ></v-text-field>
                  </v-col>
                  
                  <v-col cols="12">
                    <v-textarea
                      v-model="form.message"
                      :rules="rules.message"
                      label="Mensaje"
                      variant="outlined"
                      prepend-inner-icon="mdi-comment-text"
                      rows="6"
                      auto-grow
                      required
                    ></v-textarea>
                  </v-col>
                  
                  <v-col cols="12" class="text-center">
                    <v-btn 
                      type="submit" 
                      color="primary" 
                      size="large" 
                      :loading="loading"
                      :disabled="loading"
                      class="px-8 py-3"
                      prepend-icon="mdi-send"
                    >
                      Enviar Mensaje
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
        

        
        <!-- Información de contacto -->
        <v-col cols="12" md="3" lg="3" class="info-column">
          <v-card class="info-card mb-4 elevation-3 fade-in">
            <v-card-title class="info-title d-flex align-center">
              <v-icon class="me-2" color="white">mdi-information</v-icon>
              Información de Contacto
            </v-card-title>
            
            <v-card-text class="pa-6">
              <div class="contact-info-item mb-6 d-flex">
                <div class="icon-wrapper me-4">
                  <v-icon color="primary" size="large">mdi-map-marker</v-icon>
                </div>
                <div>
                  <h3 class="info-subtitle mb-1">Dirección</h3>
                  <p>Calle Ejercicio 123<br>Ciudad Fitness, 28001</p>
                </div>
              </div>
              
              <div class="contact-info-item mb-6 d-flex">
                <div class="icon-wrapper me-4">
                  <v-icon color="primary" size="large">mdi-phone</v-icon>
                </div>
                <div>
                  <h3 class="info-subtitle mb-1">Teléfono</h3>
                  <p>+34 123 456 789</p>
                </div>
              </div>
              
              <div class="contact-info-item mb-6 d-flex">
                <div class="icon-wrapper me-4">
                  <v-icon color="primary" size="large">mdi-email</v-icon>
                </div>
                <div>
                  <h3 class="info-subtitle mb-1">Email</h3>
                  <p>info@entrenatefitness.com</p>
                </div>
              </div>
              
              <div class="contact-info-item d-flex">
                <div class="icon-wrapper me-4">
                  <v-icon color="primary" size="large">mdi-clock</v-icon>
                </div>
                <div>
                  <h3 class="info-subtitle mb-1">Horario</h3>
                  <p class="mb-1">Lunes - Viernes: 9:00 - 20:00</p>
                  <p>Sábado: 10:00 - 14:00</p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </SectionContainer>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.contact-container {
  margin-top: 2rem;
}

// Añadir espacio específicamente en vista desktop
@media (min-width: 960px) {
  .form-column {
    padding-right: 2rem;
  }
  
  .info-column {
    padding-left: 2rem;
  }
}

.contact-card,
.info-card,
.social-card,
.success-card {
  border-radius: $border-radius;
  transition: all 0.3s ease;
  height: 100%;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-5px);
  }
}

.contact-title,
.info-title,
.social-title {
  background-color: $primary-color;
  color: white;
  font-family: $font-family-base;
  padding: 1.25rem;
  font-size: 1.4rem;
  letter-spacing: 0.5px;
}

.success-card {
  background-color: #f0f9f0;
  border-left: 5px solid #4CAF50;
}

.info-subtitle {
  font-family: $font-family-base;
  font-size: 1.1rem;
  color: $primary-color;
  font-weight: 600;
}

:deep(.v-field) {
  border-radius: $border-radius !important;
}

.v-btn {
  font-family: $font-family-base;
  border-radius: $border-radius;
  letter-spacing: 1px;
  font-weight: 600;
  
  &.social-btn {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
    }
  }
}

.contact-info-item {
  font-family: $font-family-text;
  margin-bottom: 1.5rem;
  
  p {
    line-height: 1.5;
    font-size: 1rem;
    margin: 0;
    opacity: 0.9;
  }
  
  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
  }
}

.social-buttons {
  margin-top: 1rem;
}

.v-text-field, .v-textarea {
  padding: 8px !important;
}

// Animaciones
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive
@media (max-width: 960px) {
  .info-card, .social-card {
    margin-top: 1.5rem;
  }
  
  .contact-title,
  .info-title,
  .social-title {
    font-size: 1.2rem;
    padding: 1rem;
  }
}

@media (max-width: 600px) {
  .contact-container {
    margin-top: 1rem;
  }
  
  .info-card, .social-card, .contact-card {
    margin-bottom: 1rem;
  }
  
  .contact-info-item {
    margin-bottom: 1.25rem;
  }
}
</style>