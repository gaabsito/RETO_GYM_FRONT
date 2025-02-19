<template>
    <v-footer class="footer">
      <div class="footer__icons">
        <v-btn v-for="icon in ['mdi-facebook', 'mdi-twitter', 'mdi-instagram']" :key="icon" class="footer__icon"
          :icon="icon" variant="text"></v-btn>
      </div>
  
      <div class="footer__links">
        <v-btn v-for="link in ['Sobre Nosotros', 'Contacto', 'Términos de Uso']" :key="link" variant="text"
          class="footer__link">
          {{ link }}
        </v-btn>
      </div>
  
      <v-divider></v-divider>
  
      <div class="footer__text">
        {{ new Date().getFullYear() }} — ENTRÉNATE
      </div>
    </v-footer>
  </template>
  
  <style scoped lang="scss">
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
    }
  
    &__links {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 10px;
    }
  
    &__text {
      font-size: 0.9rem;
    }
  }
  </style>
  