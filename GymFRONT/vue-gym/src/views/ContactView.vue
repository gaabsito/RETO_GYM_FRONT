<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import PageHeader from '@/components/PageHeader.vue';
import SectionContainer from '@/components/SectionContainer.vue';
import ContactImage from '@/assets/images/ContactImage.webp';

// Composables
const router = useRouter();
const { mobile, smAndDown } = useDisplay();

// Reactive state
const formSubmitted = ref(false);
const loading = ref(false);
const error = ref('');
const formRef = ref<any>(null);

// Form data with reactive
const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
});

// Validation rules con mensajes más claros
const rules = {
  name: [
    (v: string) => !!v || 'Por favor, introduce tu nombre',
    (v: string) => (v && v.length >= 2) || 'El nombre debe tener al menos 2 caracteres'
  ],
  email: [
    (v: string) => !!v || 'El email es obligatorio',
    (v: string) => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(v) || 'Introduce un email válido (ejemplo@dominio.com)';
    }
  ],
  subject: [
    (v: string) => !!v || 'El asunto es obligatorio',
    (v: string) => (v && v.length >= 5) || 'El asunto debe tener al menos 5 caracteres'
  ],
  message: [
    (v: string) => !!v || 'El mensaje es obligatorio',
    (v: string) => (v && v.length >= 10) || 'El mensaje debe tener al menos 10 caracteres',
    (v: string) => (v && v.length <= 1000) || 'El mensaje no puede exceder 1000 caracteres'
  ]
};

// Computed properties
const messageLength = computed(() => form.message.length);
const remainingChars = computed(() => 1000 - messageLength.value);

// Contact info data
const contactInfo = [
  {
    icon: 'mdi-map-marker',
    title: 'Ubicación',
    content: ['Calle Ejercicio 123', 'Ciudad Fitness, 28001'],
    action: () => openMaps()
  },
  {
    icon: 'mdi-phone',
    title: 'Teléfono',
    content: ['+34 652 41 63 87'],
    action: () => callPhone('+34652416387')
  },
  {
    icon: 'mdi-email',
    title: 'Email',
    content: ['entrenategymapp@gmail.com'],
    action: () => sendEmail('entrenategymapp@gmail.com')
  },
  {
    icon: 'mdi-clock-outline',
    title: 'Horario de Atención',
    content: ['Lun - Vie: 9:00 - 20:00', 'Sábado: 10:00 - 14:00', 'Domingo: Cerrado']
  }
];

// Methods
const handleSubmit = async () => {
  const { valid } = await formRef.value?.validate();
  
  if (!valid) {
    error.value = 'Por favor, corrige los errores del formulario';
    return;
  }
  
  try {
    loading.value = true;
    error.value = '';
    
    // Simular llamada a API con datos reales
    console.log('Enviando formulario:', { ...form });
    
    // TODO: Reemplazar con llamada real a API
    // const response = await contactAPI.sendMessage(form);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    formSubmitted.value = true;
    resetForm();
    
  } catch (err) {
    console.error('Error al enviar formulario:', err);
    error.value = 'Hubo un problema al enviar el mensaje. Por favor, inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  Object.assign(form, {
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  formRef.value?.resetValidation();
};

const sendAnotherMessage = () => {
  formSubmitted.value = false;
  error.value = '';
};

// Contact actions
const openMaps = () => {
  const address = encodeURIComponent('Calle Ejercicio 123, Ciudad Fitness, 28001');
  window.open(`https://maps.google.com?q=${address}`, '_blank');
};

const callPhone = (phone: string) => {
  window.open(`tel:${phone}`);
};

const sendEmail = (email: string) => {
  window.open(`mailto:${email}?subject=Consulta desde la web`);
};

const openWhatsApp = () => {
  const phone = '34652416387';
  const message = encodeURIComponent('Hola, me gustaría obtener más información sobre sus servicios.');
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
};
</script>

<template>
  <v-container fluid class="pa-0 white-container">
    <!-- Hero Section -->
    <PageHeader 
      title="CONTACTO"
      subtitle="Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible."
      :backgroundImage="ContactImage"
    />

    <SectionContainer class="contact-section white-section">
      <!-- Success State -->
      <template v-if="formSubmitted">
        <v-row justify="center">
          <v-col cols="12" sm="10" md="8" lg="6">
            <v-card class="success-card text-center pa-8" elevation="4">
              <div class="success-icon-wrapper mb-6">
                <v-icon size="80" color="success" class="success-icon">
                  mdi-check-circle-outline
                </v-icon>
              </div>
              
              <h2 class="text-h4 font-weight-bold mb-4 success-title">
                ¡Mensaje enviado correctamente!
              </h2>
              
              <p class="text-body-1 mb-6 text-medium-emphasis">
                Gracias por contactarnos. Hemos recibido tu mensaje y nuestro equipo 
                te responderá en un plazo máximo de 24 horas.
              </p>
              
              <div class="d-flex flex-column flex-sm-row gap-4 justify-center">
                <v-btn 
                  color="primary" 
                  size="large" 
                  @click="sendAnotherMessage"
                  prepend-icon="mdi-email-plus"
                  class="px-8 py-3 success-btn-primary"
                >
                  Enviar otro mensaje
                </v-btn>
                
                <v-btn 
                  variant="outlined"
                  size="large" 
                  @click="router.push('/')"
                  prepend-icon="mdi-home"
                  class="px-8 py-3 success-btn-secondary"
                  color="primary"
                >
                  Ir al inicio
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <!-- Contact Form and Info -->
      <template v-else>
        <v-row class="contact-content" no-gutters>
          <!-- Contact Form - Mobile First -->
          <v-col cols="12" lg="7" xl="8" order="1" order-lg="1" class="form-column">
            <v-card class="contact-form-card" elevation="8">
              <div class="card-header">
                <div class="d-flex align-center">
                  <v-icon class="me-3" size="24">mdi-email-edit-outline</v-icon>
                  <h2 class="text-h5 font-weight-bold">Formulario de Contacto</h2>
                </div>
                <p class="text-body-2 text-medium-emphasis mt-2 mb-0">
                  Completa el formulario y te responderemos pronto
                </p>
              </div>
              
              <v-card-text class="pa-6 pa-sm-8 white-background">
                <!-- Error Alert -->
                <v-alert 
                  v-if="error" 
                  type="error" 
                  variant="tonal"
                  class="mb-6"
                  closable
                  @click:close="error = ''"
                >
                  <template #prepend>
                    <v-icon>mdi-alert-circle</v-icon>
                  </template>
                  {{ error }}
                </v-alert>
                
                <v-form ref="formRef" @submit.prevent="handleSubmit" class="contact-form">
                  <v-row>
                    <!-- Name Field -->
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="form.name"
                        :rules="rules.name"
                        label="Nombre completo *"
                        variant="outlined"
                        prepend-inner-icon="mdi-account-outline"
                        density="comfortable"
                        clearable
                        counter
                        :maxlength="50"
                        required
                        class="mb-2"
                      />
                    </v-col>
                    
                    <!-- Email Field -->
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="form.email"
                        :rules="rules.email"
                        label="Correo electrónico *"
                        type="email"
                        variant="outlined"
                        prepend-inner-icon="mdi-email-outline"
                        density="comfortable"
                        clearable
                        required
                        class="mb-2"
                      />
                    </v-col>
                    
                    <!-- Subject Field -->
                    <v-col cols="12">
                      <v-text-field
                        v-model="form.subject"
                        :rules="rules.subject"
                        label="Asunto *"
                        variant="outlined"
                        prepend-inner-icon="mdi-format-title"
                        density="comfortable"
                        clearable
                        counter
                        :maxlength="100"
                        required
                        class="mb-2"
                        placeholder="Ej: Consulta sobre membresías"
                      />
                    </v-col>
                    
                    <!-- Message Field -->
                    <v-col cols="12">
                      <v-textarea
                        v-model="form.message"
                        :rules="rules.message"
                        label="Mensaje *"
                        variant="outlined"
                        prepend-inner-icon="mdi-comment-text-outline"
                        rows="4"
                        auto-grow
                        clearable
                        counter
                        :maxlength="1000"
                        required
                        class="mb-2"
                        placeholder="Cuéntanos cómo podemos ayudarte..."
                        :hint="`${remainingChars} caracteres restantes`"
                        persistent-hint
                      />
                    </v-col>
                    
                    <!-- Submit Button -->
                    <v-col cols="12" class="text-center pt-8">
                      <v-btn 
                        type="submit" 
                        color="primary" 
                        size="x-large"
                        :loading="loading"
                        :disabled="loading"
                        prepend-icon="mdi-send"
                        class="px-12 py-4 submit-btn"
                        :class="{ 'mobile-submit': mobile }"
                      >
                        <span v-if="!loading">Enviar Mensaje</span>
                        <span v-else>Enviando...</span>
                      </v-btn>
                      
                      <p class="text-caption text-medium-emphasis mt-4">
                        * Campos obligatorios
                      </p>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
          
          <!-- Contact Information -->
          <v-col cols="12" lg="5" xl="4" order="2" order-lg="2" class="info-column">
            <v-card class="contact-info-card" elevation="8">
              <div class="card-header">
                <div class="d-flex align-center">
                  <v-icon class="me-3" size="24">mdi-information-outline</v-icon>
                  <h2 class="text-h5 font-weight-bold">Información de Contacto</h2>
                </div>
              </div>
              
              <v-card-text class="pa-6 white-background">
                <div 
                  v-for="(info, index) in contactInfo" 
                  :key="index"
                  class="contact-info-item"
                  :class="{ 'clickable': info.action }"
                  @click="info.action?.()"
                >
                  <div class="d-flex align-start">
                    <div class="icon-container me-4">
                      <v-icon 
                        :color="info.action ? 'primary' : 'primary'" 
                        size="24"
                      >
                        {{ info.icon }}
                      </v-icon>
                    </div>
                    
                    <div class="flex-grow-1">
                      <h3 class="info-title mb-2">{{ info.title }}</h3>
                      <div class="info-content">
                        <p 
                          v-for="(line, idx) in info.content" 
                          :key="idx"
                          class="mb-1"
                          :class="{ 'link-text': info.action }"
                        >
                          {{ line }}
                        </p>
                      </div>
                    </div>
                    
                    <v-icon 
                      v-if="info.action" 
                      size="16" 
                      class="action-icon"
                      color="primary"
                    >
                      mdi-open-in-new
                    </v-icon>
                  </div>
                </div>
                
                <!-- Quick Actions -->
                <v-divider class="my-8" />
                
                <div class="quick-actions">
                  <h3 class="text-subtitle-1 font-weight-bold mb-6">Contacto Directo</h3>
                  
                  <div class="d-flex flex-column gap-4">
                    <v-btn
                      variant="outlined"
                      size="large"
                      prepend-icon="mdi-phone"
                      @click="callPhone('+34 652416387')"
                      block
                      class="text-none quick-action-btn"
                      color="primary"
                    >
                      Llamar ahora
                    </v-btn>
                    
                    <v-btn
                      variant="outlined"
                      size="large"
                      prepend-icon="mdi-whatsapp"
                      @click="openWhatsApp"
                      block
                      class="text-none quick-action-btn whatsapp-btn"
                      color="success"
                    >
                      WhatsApp
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </SectionContainer>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

// Force white backgrounds everywhere
.white-container,
.white-section,
.white-background {
  background-color: #ffffff !important;
}

// Section styling
.contact-section {
  padding-top: 2rem;
  padding-bottom: 3rem;
  background: #ffffff !important;
  
  @media (min-width: 1264px) {
    padding-top: 3rem;
    padding-bottom: 4rem;
    background: #ffffff !important;
  }
}

.contact-content {
  gap: 0;
  min-height: 70vh;
  
  @media (max-width: 1264px) {
    gap: 1.5rem;
    min-height: auto;
  }
}

// Desktop Column Spacing
.form-column {
  @media (min-width: 1264px) {
    padding-right: 1rem;
  }
}

.info-column {
  @media (min-width: 1264px) {
    padding-left: 1rem;
  }
}

// White background enforcement
.white-background {
  background-color: #ffffff !important;
}

// Cards
.contact-form-card,
.contact-info-card,
.success-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  
  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;
    transform: translateY(-4px);
    border-color: rgba($primary-color, 0.2);
  }
  
  @media (min-width: 1264px) {
    border-radius: 20px;
    height: 100%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    
    &:hover {
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.15) !important;
      transform: translateY(-6px);
      border-color: rgba($primary-color, 0.3);
    }
  }
}

.contact-form-card {
  background: #ffffff !important;
  
  @media (min-width: 1264px) {
    background: #ffffff !important;
    border: 1px solid rgba(0, 0, 0, 0.06);
  }
  
  :deep(.v-card-text) {
    background: #ffffff !important;
  }
}

.contact-info-card {
  background: #ffffff !important;
  
  @media (min-width: 1264px) {
    background: #ffffff !important;
    position: sticky;
    top: 2rem;
    border: 1px solid rgba(0, 0, 0, 0.06);
  }
  
  :deep(.v-card-text) {
    background: #ffffff !important;
  }
}

// Card Headers
.card-header {
  background: linear-gradient(135deg, $primary-color 0%, lighten($primary-color, 15%) 50%, darken($primary-color, 5%) 100%);
  color: white;
  padding: 1.5rem 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  @media (max-width: 600px) {
    padding: 1.25rem 1.5rem;
  }
  
  @media (min-width: 1264px) {
    padding: 2rem 2.5rem;
    
    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    
    p {
      font-size: 1rem;
      opacity: 0.9;
    }
  }
  
  h2 {
    color: white;
    margin: 0;
  }
}

// Success Card Styles
.success-card {
  background: #ffffff;
  border: 2px solid #28a745;
  box-shadow: 0 8px 32px rgba(40, 167, 69, 0.12);
}

.success-icon-wrapper {
  display: inline-block;
  padding: 1rem;
  background: rgba(40, 167, 69, 0.1);
  border-radius: 50%;
}

.success-icon {
  animation: successPulse 2s infinite;
}

.success-title {
  color: #28a745;
}

// Form Styles
.contact-form {
  background: #ffffff !important;
  
  @media (min-width: 1264px) {
    padding: 1rem;
    background: #ffffff !important;
  }
  
  :deep(.v-field) {
    border-radius: 12px;
    transition: all 0.3s ease;
    background: #ffffff !important;
    
    @media (min-width: 1264px) {
      border-radius: 16px;
    }
    
    &.v-field--focused {
      box-shadow: 0 0 0 3px rgba($primary-color, 0.15);
      transform: translateY(-2px);
    }
    
    &:hover:not(.v-field--focused) {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }
    
    .v-field__input {
      background: #ffffff !important;
    }
    
    .v-field__field {
      background: #ffffff !important;
    }
  }
  
  :deep(.v-input) {
    background: #ffffff !important;
    
    .v-field__prepend-inner {
      padding-top: 8px;
    }
    
    @media (min-width: 1264px) {
      margin-bottom: 0.5rem;
      
      .v-field__prepend-inner {
        padding-top: 12px;
      }
    }
  }
  
  :deep(.v-text-field), :deep(.v-textarea) {
    background: #ffffff !important;
    
    @media (min-width: 1264px) {
      .v-field__input {
        font-size: 1rem;
        padding: 16px 20px;
        background: #ffffff !important;
      }
      
      .v-field__label {
        font-size: 1rem;
      }
    }
  }
  
  :deep(.v-textarea) {
    .v-field__field {
      background: #ffffff !important;
    }
    
    textarea {
      background: #ffffff !important;
    }
  }
}

.submit-btn {
  border-radius: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 6px 20px rgba($primary-color, 0.25);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  min-width: 220px;
  
  &:hover:not(:disabled) {
    box-shadow: 0 10px 30px rgba($primary-color, 0.35);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0px);
  }
  
  &.mobile-submit {
    height: 56px !important;
    font-size: 1.1rem;
    width: 100%;
    min-width: auto;
  }
  
  @media (min-width: 600px) {
    min-width: 280px;
  }
  
  @media (min-width: 1264px) {
    border-radius: 16px;
    height: 60px !important;
    font-size: 1.15rem;
    padding: 0 3rem;
    letter-spacing: 0.8px;
    min-width: 320px;
    
    &:hover:not(:disabled) {
      box-shadow: 0 15px 40px rgba($primary-color, 0.4);
      transform: translateY(-3px);
    }
    
    &:active {
      transform: translateY(-1px);
    }
  }
}

// Contact Info Styles
.contact-info-item {
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid transparent;
  background: #ffffff !important;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (min-width: 1264px) {
    padding: 1.5rem;
    border-radius: 16px;
    margin-bottom: 1.5rem;
  }
  
  &.clickable {
    cursor: pointer;
    
    &:hover {
      background: linear-gradient(135deg, rgba($primary-color, 0.08) 0%, rgba($primary-color, 0.04) 100%) !important;
      border-color: rgba($primary-color, 0.3);
      transform: translateX(6px);
      box-shadow: 0 8px 20px rgba($primary-color, 0.1);
      
      @media (min-width: 1264px) {
        transform: translateX(8px) translateY(-2px);
        box-shadow: 0 12px 30px rgba($primary-color, 0.15);
      }
      
      .action-icon {
        transform: scale(1.3) rotate(15deg);
      }
      
      .link-text {
        color: $primary-color;
        text-decoration: underline;
      }
      
      .icon-container {
        background: rgba($primary-color, 0.2);
        transform: scale(1.1);
      }
    }
  }
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba($primary-color, 0.1);
  border-radius: 10px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  
  @media (min-width: 1264px) {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba($primary-color, 0.15) 0%, rgba($primary-color, 0.1) 100%);
  }
}

.info-title {
  font-size: 1rem;
  font-weight: 600;
  color: $primary-color;
  margin: 0;
  
  @media (min-width: 1264px) {
    font-size: 1.1rem;
    font-weight: 700;
  }
}

.info-content {
  p {
    margin: 0;
    line-height: 1.4;
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.7);
    transition: color 0.2s ease;
    
    @media (min-width: 1264px) {
      font-size: 1rem;
      line-height: 1.5;
    }
  }
}

.action-icon {
  transition: transform 0.2s ease;
  opacity: 0.6;
}

.link-text {
  transition: all 0.2s ease;
}

// Quick Actions
.quick-actions {
  @media (min-width: 1264px) {
    padding-top: 1rem;
    
    h3 {
      font-size: 1.1rem;
      margin-bottom: 2rem;
      color: $primary-color;
      font-weight: 700;
    }
  }
  
  .quick-action-btn {
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    font-weight: 600;
    height: 48px;
    border-width: 2px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      border-width: 2px;
    }
    
    @media (min-width: 1264px) {
      border-radius: 14px;
      height: 52px;
      font-size: 1rem;
      font-weight: 600;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      }
    }
    
    &.whatsapp-btn:hover {
      background: rgba(37, 211, 102, 0.05);
      border-color: #25D366;
      color: #25D366;
    }
  }
}

// Animations
@keyframes successPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

// Responsive Design - Mobile First
@media (max-width: 600px) {
  .contact-section {
    padding-top: 1rem;
    padding-bottom: 2rem;
  }
  
  .card-header {
    h2 {
      font-size: 1.25rem;
    }
  }
  
  .contact-info-item {
    padding: 0.75rem;
    
    .info-title {
      font-size: 0.95rem;
    }
    
    .info-content p {
      font-size: 0.85rem;
    }
  }
  
  .success-icon-wrapper {
    padding: 0.75rem;
  }
  
  .success-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 400px) {
  .card-header {
    padding: 1rem;
  }
  
  :deep(.v-card-text) {
    padding: 1rem !important;
  }
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  .contact-form-card,
  .contact-info-card {
    border-color: rgba(255, 255, 255, 0.12);
    background: linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%);
  }
  
  .icon-container {
    background: rgba($primary-color, 0.3);
  }
  
  .card-header {
    background: linear-gradient(135deg, darken($primary-color, 10%) 0%, $primary-color 50%, lighten($primary-color, 5%) 100%);
  }
}

// Desktop Enhancements
@media (min-width: 1264px) {
  .contact-section {
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f1f3f4 100%);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 80%, rgba($primary-color, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba($primary-color, 0.05) 0%, transparent 50%);
      pointer-events: none;
    }
  }
  
  // Parallax effect for info card
  .contact-info-card {
    will-change: transform;
    
    &:hover {
      transform: translateY(-8px) rotateX(5deg) rotateY(-2deg);
      transform-style: preserve-3d;
    }
  }
  
  // Enhanced form focus states
  .contact-form {
    :deep(.v-field--focused) {
      .v-field__outline {
        animation: focusPulse 2s infinite;
      }
    }
  }
}

// Enhanced animations for desktop
@keyframes focusPulse {
  0%, 100% {
    box-shadow: 0 0 0 3px rgba($primary-color, 0.15);
  }
  50% {
    box-shadow: 0 0 0 6px rgba($primary-color, 0.1);
  }
}

// Force white background on all Vuetify components
:deep(.v-card),
:deep(.v-card-text),
:deep(.v-container),
:deep(.v-row),
:deep(.v-col) {
  background: #ffffff !important;
}

// Ensure form fields are white
:deep(.v-field__field),
:deep(.v-field__input),
:deep(.v-field__append-inner),
:deep(.v-field__prepend-inner) {
  background: #ffffff !important;
}

// Success card enhancements for desktop
@media (min-width: 1264px) {
  .success-card {
    background: #ffffff;
    border: 2px solid #28a745;
    box-shadow: 0 8px 32px rgba(40, 167, 69, 0.15);
  }
}

// Success buttons
.success-btn-primary,
.success-btn-secondary {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  height: 48px;
  
  @media (min-width: 1264px) {
    border-radius: 14px;
    height: 52px;
    font-size: 1rem;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}
</style>