<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue';
import SectionContainer from '@/components/SectionContainer.vue';
import TermsImage from '@/assets/images/TermsImage.jpg'; // Usa una imagen adecuada para términos

// Fecha de última actualización
const lastUpdated = '01 de Marzo de 2025';
</script>

<template>
  <v-container fluid class="pa-0">
    <!-- Hero Section -->
    <PageHeader 
      title="Términos y Condiciones"
      subtitle="Por favor, lee detenidamente los siguientes términos antes de utilizar nuestra plataforma"
      :backgroundImage="TermsImage"
    />

    <SectionContainer>
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <v-card class="terms-card">
            <v-card-title class="terms-title">
              Términos y Condiciones de Uso
            </v-card-title>
            
            <v-card-text class="terms-content">
              <p class="last-updated mb-6">Última actualización: {{ lastUpdated }}</p>
              
              <section class="mb-8">
                <h2 class="terms-section-title">1. Introducción</h2>
                <p>
                  Bienvenido a ENTRÉNATE. Estos Términos y Condiciones rigen tu uso de nuestra plataforma web, aplicación móvil y servicios relacionados (colectivamente, el "Servicio").
                </p>
                <p>
                  Al acceder o utilizar nuestro Servicio, aceptas estar sujeto a estos Términos. Si no estás de acuerdo con alguna parte de los términos, no podrás acceder al Servicio.
                </p>
              </section>
              
              <section class="mb-8">
                <h2 class="terms-section-title">2. Uso del Servicio</h2>
                <p>
                  ENTRÉNATE proporciona una plataforma para que los usuarios accedan a entrenamientos, ejercicios y recursos relacionados con el fitness. Nuestro Servicio incluye:
                </p>
                <ul class="ml-6 mb-4">
                  <li>Acceso a entrenamientos y ejercicios personalizados</li>
                  <li>Herramientas de seguimiento de progreso</li>
                  <li>Contenido educativo relacionado con fitness y bienestar</li>
                  <li>Funcionalidades sociales para interactuar con otros usuarios</li>
                </ul>
                <p>
                  Estos servicios están diseñados para fines informativos y educativos. No sustituyen el consejo médico profesional, diagnóstico o tratamiento.
                </p>
              </section>
              
              <section class="mb-8">
                <h2 class="terms-section-title">3. Registro de Cuenta</h2>
                <p>
                  Para acceder a ciertas características del Servicio, debes registrarte para obtener una cuenta. Al registrarte, aceptas proporcionar información precisa, actual y completa, y mantenerla actualizada.
                </p>
                <p>
                  Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. Te comprometes a notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta.
                </p>
              </section>
              
              <section class="mb-8">
                <h2 class="terms-section-title">4. Propiedad Intelectual</h2>
                <p>
                  El Servicio y su contenido original, características y funcionalidad son propiedad de ENTRÉNATE y están protegidos por derechos de autor, marca registrada, patente, secreto comercial y otras leyes de propiedad intelectual o derechos de propiedad.
                </p>
                <p>
                  No puedes reproducir, distribuir, modificar, crear obras derivadas, mostrar públicamente, ejecutar públicamente, republicar, descargar, almacenar o transmitir cualquier material de nuestro Servicio, excepto según lo permitido por estos Términos.
                </p>
              </section>
              
              <section class="mb-8">
                <h2 class="terms-section-title">5. Contenido del Usuario</h2>
                <p>
                  Nuestro Servicio te permite publicar, compartir y almacenar contenido, como comentarios, fotos, videos y otro material (colectivamente, "Contenido del Usuario").
                </p>
                <p>
                  Al proporcionar Contenido del Usuario, garantizas que:
                </p>
                <ul class="ml-6 mb-4">
                  <li>Eres el propietario o tienes derecho a usar y distribuir dicho contenido</li>
                  <li>El contenido no infringe los derechos de propiedad intelectual de terceros</li>
                  <li>El contenido no es ilegal, obsceno, difamatorio, amenazante, invasivo de la privacidad, o de otra manera perjudicial</li>
                </ul>
              </section>
              
              <section class="mb-8">
                <h2 class="terms-section-title">6. Renuncia de Responsabilidad Médica</h2>
                <p>
                  La información proporcionada a través de nuestro Servicio está diseñada para fines informativos y educativos solamente. No es un sustituto del consejo, diagnóstico o tratamiento médico profesional.
                </p>
                <p>
                  Siempre busca el consejo de tu médico u otro proveedor de salud calificado con cualquier pregunta que puedas tener sobre una condición médica antes de comenzar cualquier programa de ejercicio o dieta.
                </p>
              </section>
              
              <section class="mb-8">
                <h2 class="terms-section-title">7. Limitación de Responsabilidad</h2>
                <p>
                  En ningún caso ENTRÉNATE, sus directores, empleados, socios, agentes, proveedores o afiliados serán responsables por cualquier daño indirecto, incidental, especial, consecuente o punitivo, incluyendo sin limitación, pérdida de beneficios, datos, uso, buena voluntad, u otras pérdidas intangibles, resultantes de:
                </p>
                <ul class="ml-6 mb-4">
                  <li>Tu acceso o uso o incapacidad para acceder o usar el Servicio</li>
                  <li>Cualquier conducta o contenido de terceros en el Servicio</li>
                  <li>Contenido obtenido del Servicio</li>
                  <li>Acceso no autorizado, uso o alteración de tus transmisiones o contenido</li>
                </ul>
              </section>
              
              <section class="mb-8">
                <h2 class="terms-section-title">8. Cambios en los Términos</h2>
                <p>
                  Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, haremos esfuerzos razonables para proporcionar al menos 30 días de notificación antes de que los nuevos términos entren en vigencia.
                </p>
                <p>
                  Al continuar accediendo o utilizando nuestro Servicio después de que esas revisiones se hagan efectivas, aceptas estar sujeto a los términos revisados. Si no aceptas los nuevos términos, debes dejar de usar el Servicio.
                </p>
              </section>
              
              <section class="mb-8">
                <h2 class="terms-section-title">9. Ley Aplicable</h2>
                <p>
                  Estos Términos se regirán e interpretarán de acuerdo con las leyes de España, sin tener en cuenta sus disposiciones sobre conflicto de leyes.
                </p>
                <p>
                  Nuestra falta de hacer cumplir cualquier derecho o disposición de estos Términos no se considerará una renuncia a esos derechos. Si alguna disposición de estos Términos es considerada inválida o inaplicable por un tribunal, las disposiciones restantes de estos Términos permanecerán en vigor.
                </p>
              </section>
              
              <section class="mb-8">
                <h2 class="terms-section-title">10. Contacto</h2>
                <p>
                  Si tienes alguna pregunta sobre estos Términos, por favor contáctanos en:
                </p>
                <p class="contact-email">
                  <v-icon color="primary" class="me-2">mdi-email</v-icon>
                  legal@entrenatefitness.com
                </p>
              </section>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </SectionContainer>
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.terms-card {
  border-radius: $border-radius;
  margin-bottom: 2rem;
}

.terms-title {
  background-color: $primary-color;
  color: white;
  font-family: $font-family-base;
  padding: 1.5rem;
  font-size: 1.5rem;
}

.terms-content {
  padding: 2rem !important;
  font-family: $font-family-text;
  line-height: 1.6;
}

.last-updated {
  color: #666;
  font-style: italic;
  text-align: right;
}

.terms-section-title {
  font-family: $font-family-base;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: $primary-color;
}

p {
  margin-bottom: 1rem;
}

ul {
  margin-bottom: 1rem;
  
  li {
    margin-bottom: 0.5rem;
  }
}

.contact-email {
  display: flex;
  align-items: center;
  font-weight: 500;
}

// Responsive
@media (max-width: 768px) {
  .terms-content {
    padding: 1.5rem !important;
  }
  
  .terms-section-title {
    font-size: 1.1rem;
  }
}
</style>