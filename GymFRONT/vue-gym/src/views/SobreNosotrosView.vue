<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import SectionContainer from '@/components/SectionContainer.vue'
import HoverCard from '@/components/HoverCard.vue'
import TeamMemberCard from '@/components/TeamMemberCard.vue'
import CallToAction from '@/components/CallToAction.vue'

import jaimeImg from '@/assets/images/jaime.png'
import chaveloImg from '@/assets/images/chavelo.jpg'
import gabsImg from '@/assets/images/gabs.jpg'
import gymAboutImg from '@/assets/images/about.jpg'

const team = ref([
  {
    name: 'Jaime Escartín',
    position: 'Fundador y Director',
    description: 'Entrenador certificado con más de 15 años de experiencia en fitness y nutrición deportiva.',
    image: jaimeImg
  },
  {
    name: 'Gabriel Galán',
    position: 'Fundador y Director',
    description: 'Especialista en entrenamiento funcional y rehabilitación física. Máster en Ciencias del Deporte.',
    image: gabsImg
  },
  {
    name: 'Adrián Abril',
    position: 'Nutricionista Deportivo',
    description: 'Experto en nutrición deportiva y planificación de dietas personalizadas para atletas.',
    image: chaveloImg
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
    <PageHeader 
      title="Sobre Nosotros"
      subtitle="Transformando vidas a través del fitness y el bienestar"
      :backgroundImage="gymAboutImg"
    />

    <!-- Misión y Visión -->
    <SectionContainer>
      <v-row justify="center" align="center">
        <v-col cols="12" md="8" class="text-center">
          <h2 class="text-h4 mb-6">Nuestra Misión</h2>
          <p class="text-parrafo">
            En ENTRÉNATE, nos dedicamos a proporcionar soluciones fitness personalizadas y efectivas que ayuden a nuestros usuarios a alcanzar sus objetivos de salud y bienestar. Creemos en el poder transformador del ejercicio y el compromiso con un estilo de vida saludable.
          </p>
        </v-col>
      </v-row>
    </SectionContainer>

    <!-- Valores -->
    <SectionContainer title="Nuestros Valores" backgroundColor="#f8f8f8">
      <v-row>
        <v-col v-for="value in values" :key="value.title" cols="12" md="4">
          <HoverCard 
            :title="value.title" 
            :description="value.description" 
            :icon="value.icon"
          />
        </v-col>
      </v-row>
    </SectionContainer>

    <!-- Equipo -->
    <SectionContainer title="Nuestro Equipo">
      <v-row>
        <v-col v-for="member in team" :key="member.name" cols="12" md="4">
          <TeamMemberCard 
            :name="member.name"
            :position="member.position"
            :description="member.description"
            :image="member.image"
          />
        </v-col>
      </v-row>
    </SectionContainer>

    <!-- CTA Section -->
    <CallToAction
      title="¿Listo para unirte a nuestra comunidad?"
      subtitle="Comienza tu viaje hacia una vida más saludable hoy mismo"
      buttonText="Empieza Ahora"
      buttonLink="/register"
    />
  </v-container>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.v-col-md-4 {
  padding: 12px !important;
}

.text-parrafo {
  font-size: $font-size-lg;
  font-weight: bolder;
  color: $secondary-color;
  font-family: $font-family-text;
}

@media (max-width: 600px) {
  .v-container {
    padding: 0.5rem !important;
  }
}
</style>