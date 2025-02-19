<script setup lang="ts">
import { ref } from 'vue'
import jaimeImg from '@/assets/images/jaime.png'
import chaveloImg from '@/assets/images/chavelo.jpg'
import gabsImg from '@/assets/images/gabs.jpg'
import gymAboutImg from '@/assets/images/about.jpg'

const team = ref([
  {
    name: 'Jaime Escartín',
    position: 'Fundador y Director',
    description: 'Entrenador certificado con más de 15 años de experiencia en fitness y nutrición deportiva.',
    image: jaimeImg,
    icon: 'mdi-shield-account'
  },
  {
    name: 'Gabriel Galán',
    position: 'Fundador y Director',
    description: 'Especialista en entrenamiento funcional y rehabilitación física. Máster en Ciencias del Deporte.',
    image: gabsImg,
    icon: 'mdi-account-heart'
  },
  {
    name: 'Adrián Abril',
    position: 'Nutricionista Deportivo',
    description: 'Experto en nutrición deportiva y planificación de dietas personalizadas para atletas.',
    image: chaveloImg,
    icon: 'mdi-food-apple'
  }
])

const values = ref([
  {
    title: 'Excelencia',
    description: 'Nos esforzamos por ofrecer la más alta calidad en todos nuestros servicios y programas de entrenamiento.',
    icon: 'mdi-star'
  },
  {
    title: 'Compromiso',
    description: 'Dedicados a ayudarte a alcanzar tus objetivos fitness de manera segura y efectiva.',
    icon: 'mdi-hand-heart'
  },
  {
    title: 'Innovación',
    description: 'Constantemente actualizamos nuestros métodos y programas con las últimas tendencias en fitness.',
    icon: 'mdi-lightbulb'
  }
])
</script>

<template>
  <v-container fluid class="pa-0">
    <!-- Hero Section -->
    <v-parallax :src="gymAboutImg" class="align-center justify-center about-hero">
      <div class="d-flex flex-column fill-height justify-center align-center text-white text-center">
        <h1 class="text-h2 font-weight-bold mb-4">Sobre Nosotros</h1>
        <h2 class="text-h5 mb-6">
          Transformando vidas a través del fitness y el bienestar
        </h2>
      </div>
    </v-parallax>

    <!-- Misión y Visión -->
    <v-container class="py-12">
      <v-row justify="center" align="center">
        <v-col cols="12" md="6" class="text-center">
          <h2 class="text-h4 mb-6">Nuestra Misión</h2>
          <p class="text-body-1">
            En ENTRÉNATE, nos dedicamos a proporcionar soluciones fitness personalizadas y efectivas que ayuden a nuestros usuarios a alcanzar sus objetivos de salud y bienestar. Creemos en el poder transformador del ejercicio y el compromiso con un estilo de vida saludable.
          </p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Valores -->
    <v-container class="values-section py-12">
      <h2 class="text-h4 text-center mb-12">Nuestros Valores</h2>
      <v-row>
        <v-col v-for="value in values" :key="value.title" cols="12" md="4">
          <v-hover v-slot="{ isHovering, props }">
            <v-card v-bind="props" :elevation="isHovering ? 12 : 2" class="pa-6 h-100 value-card">
              <div class="d-flex flex-column align-center">
                <v-icon :icon="value.icon" size="64" color="primary" class="mb-4"></v-icon>
                <h3 class="text-h5 mb-4">{{ value.title }}</h3>
                <p class="text-body-1 text-center">{{ value.description }}</p>
              </div>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>

    <!-- Equipo -->
    <v-container class="py-12">
      <h2 class="text-h4 text-center mb-12">Nuestro Equipo</h2>
      <v-row>
        <v-col v-for="member in team" :key="member.name" cols="12" md="4">
          <v-hover v-slot="{ isHovering, props }">
            <v-card v-bind="props" :elevation="isHovering ? 12 : 2" class="team-card h-100">
              <div class="d-flex flex-column align-center pa-6">
                <v-avatar size="120" class="mb-4">
                  <v-img :src="member.image" cover></v-img>
                </v-avatar>
                <h3 class="text-h5 mb-2">{{ member.name }}</h3>
                <p class="text-subtitle-1 mb-4 primary--text">{{ member.position }}</p>
                <p class="text-body-1 text-center">{{ member.description }}</p>
              </div>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>

    <!-- CTA Section -->
    <v-container class="cta-section py-12">
      <v-row align="center" justify="center" class="pa-12">
        <v-col cols="12" md="8" class="text-center">
          <h2 class="text-h4 text-white mb-6">
            ¿Listo para unirte a nuestra comunidad?
          </h2>
          <p class="text-h6 font-weight-regular text-white mb-6">
            Comienza tu viaje hacia una vida más saludable hoy mismo
          </p>
          <v-btn size="x-large" to="/register" class="me-4">
            Empieza Ahora
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<style lang="scss">
@import '@/assets/styles/main.scss';

.about-hero {
  position: relative;
  height: 500px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 1;
  }

  .d-flex {
    position: relative;
    z-index: 2;
  }
}

.value-card, .team-card {
  transition: transform 0.3s ease;
  border-radius: $border-radius;

  &:hover {
    transform: translateY(-5px);
  }
}

.cta-section {
  background-color: black;
  border-radius: $border-radius;
  margin-bottom: 2rem;
}

.me-4 {
  color: $primary-color;
}

.v-card {
  border-radius: $border-radius;
}

.primary--text {
  color: $primary-color !important;
}

.pa-12 {
    padding: 0px !important;
}

.py-12 {
  padding-top: 4rem !important;
  padding-bottom: 4rem !important;
}

.team-card {
  .v-avatar {
    border: 3px solid $primary-color;
  }
}
</style>