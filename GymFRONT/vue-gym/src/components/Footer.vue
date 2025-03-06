<script setup lang="ts">
// Array de los enlaces de redes sociales
const socialIcons = [
  { icon: 'mdi-facebook', url: 'https://facebook.com' },
  { icon: 'mdi-instagram', url: 'https://www.instagram.com/entrenatee_?igsh=MXA5YTBvYnF0ZmJtbQ%3D%3D&utm_source=qr' },
  { icon: 'mdi-twitter', url: 'https://twitter.com' }
  
];

// Array de los enlaces de navegación
const footerLinks = [
  { text: 'Sobre Nosotros', route: '/about' },
  { text: 'Contacto', route: '/contact' },
  { text: 'Términos de Uso', route: '/terms' }
];

// Obtener el año actual para el copyright
const currentYear = new Date().getFullYear();
</script>

<template>
  <v-footer class="footer">
    <div class="footer__icons">
      <v-btn 
        v-for="social in socialIcons" 
        :key="social.icon" 
        :icon="social.icon"
        :href="social.url"
        target="_blank"
        rel="noopener noreferrer"
        variant="text" 
        class="footer__icon"
      ></v-btn>
    </div>

    <div class="footer__links">
      <v-btn 
        v-for="link in footerLinks" 
        :key="link.text" 
        :to="link.route"
        variant="text"
        class="footer__link"
      >
        {{ link.text }}
      </v-btn>
    </div>

    <v-divider></v-divider>

    <div class="footer__text">
      {{ currentYear }} — ENTRÉNATE
    </div>
  </v-footer>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.footer {
  background-color: $primary-color;
  color: white;
  padding: 20px 0;
  text-align: center;
  flex-direction: column;

  &__icons {
    margin-bottom: 10px;
  }

  &__icon {
    margin: 0 10px;
    color: white;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
    }
  }

  &__links {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 10px;
  }

  &__link {
    color: white;
    font-family: $font-family-base;
    transition: all 0.3s ease;
    
    &:hover {
      color: rgba(white, 0.8);
      transform: translateY(-2px);
    }
  }

  &__text {
    font-size: 0.9rem;
    margin-top: 10px;
    font-family: $font-family-text;
    opacity: 0.9;
  }
}

/* Responsive */
@media (max-width: 600px) {
  .footer {
    &__links {
      flex-direction: column;
      gap: 5px;
    }
    
    &__icon,
    &__link {
      margin: 5px;
    }
  }
}
</style>