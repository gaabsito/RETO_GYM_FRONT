<script setup lang="ts">
// Datos para la sección de logros basados en los roles reales del sistema
const achievements = [
  { 
    icon: 'mdi-run', 
    title: 'PRINCIPIANTE', 
    description: '0-1 días a la semana' 
  },
  { 
    icon: 'mdi-chart-line', 
    title: 'CONSTANTE', 
    description: '2 días a la semana' 
  },
  { 
    icon: 'mdi-thumb-up', 
    title: 'COMPROMETIDO', 
    description: '3 días a la semana' 
  },
  { 
    icon: 'mdi-weight-lifter', 
    title: 'DEDICADO', 
    description: '4 días a la semana' 
  },
  { 
    icon: 'mdi-flash', 
    title: 'DISCIPLINADO', 
    description: '5 días a la semana' 
  },
  { 
    icon: 'mdi-medal', 
    title: 'ATLETA', 
    description: '6 días a la semana' 
  },
  { 
    icon: 'mdi-crown', 
    title: 'ÉLITE', 
    description: '7 días a la semana' 
  }
]
</script>

<template>
  <div class="achievements-container">
    <v-row>
      <v-col cols="12" class="text-center mb-8">
        <h2 class="achievement-section-title">NIVELES DE ENTRENAMIENTO</h2>
        <p class="achievement-section-subtitle">Mejora tu nivel entrenando más días de la semana</p>
        <p class="achievement-description">
          Tu nivel se determina según la cantidad de días que entrenas cada semana. ¡Completa más entrenamientos en diferentes días para subir de nivel!
        </p>
      </v-col>
    </v-row>
    
    <v-row justify="center">
      <v-col v-for="(achievement, index) in achievements" :key="index" cols="12" sm="6" md="4" lg="3" xl="auto">
        <v-card class="achievement-card h-100" :class="{ 'elite-card': achievement.title === 'ÉLITE' }">
          <div class="achievement-icon-container" :class="{ 'elite-icon': achievement.title === 'ÉLITE' }">
            <v-icon size="46" :color="achievement.title === 'ÉLITE' ? 'warning' : 'primary'" :icon="achievement.icon"></v-icon>
          </div>
          <v-card-title class="achievement-title" :class="{ 'elite-title': achievement.title === 'ÉLITE' }">
            {{ achievement.title }}
          </v-card-title>
          <v-card-text class="achievement-text">
            {{ achievement.description }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12" class="info-box mt-6">
        <div class="info-content">
          <v-icon color="primary" class="info-icon">mdi-information-outline</v-icon>
          <p class="info-text">
            Al comenzar una nueva semana, deberás volver a entrenar para mantener o mejorar tu nivel.
          </p>
        </div>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12" class="text-center mt-6">
        <v-btn size="large" color="primary" to="/register" class="register-btn">
          <v-icon start>mdi-trophy-award</v-icon>
          Regístrate y comienza a subir de nivel
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.achievements-container {
  padding: 20px 0;
}

.achievement-section-title {
  font-family: $font-family-base;
  font-weight: 700;
  font-size: 2rem;
  color: $secondary-color;
  margin-bottom: 0.5rem;
}

.achievement-section-subtitle {
  font-family: $font-family-text;
  font-size: 1.2rem;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 1rem;
}

.achievement-description {
  max-width: 800px;
  margin: 0 auto;
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.7);
  font-family: $font-family-text;
  margin-bottom: 2rem;
}

.achievement-card {
  text-align: center;
  padding: 1.5rem 1rem;
  border-radius: $border-radius;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 1rem;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.15) !important;
  }
  
  &.elite-card {
    border: 2px solid rgba(gold, 0.5);
    background-color: rgba(255, 248, 220, 0.1);
  }
}

.achievement-icon-container {
  width: 70px;
  height: 70px;
  background-color: rgba($primary-color, 0.1);
  border-radius: 50%;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.elite-icon {
    background-color: rgba(gold, 0.1);
  }
}

.achievement-title {
  font-family: $font-family-base;
  font-weight: 700;
  font-size: 1.1rem;
  color: $secondary-color;
  text-align: center;
  margin-bottom: 0.5rem;
  
  &.elite-title {
    color: darkgoldenrod;
  }
}

.achievement-text {
  font-family: $font-family-text;
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.7);
  text-align: center;
}

.info-box {
  max-width: 800px;
  margin: 0 auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: $border-radius;
  background-color: rgba(0, 0, 0, 0.02);
}

.info-content {
  display: flex;
  align-items: center;
  padding: 1rem;
}

.info-icon {
  margin-right: 1rem;
  flex-shrink: 0;
}

.info-text {
  margin: 0;
  font-family: $font-family-text;
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.7);
}

.register-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 0 2rem !important;
  border-radius: $border-radius;
  font-family: $font-family-base;
}

// Responsive adjustments
@media (max-width: 600px) {
  .achievement-card {
    margin-bottom: 1rem;
  }
  
  .achievement-icon-container {
    width: 60px;
    height: 60px;
  }
  
  .achievement-title {
    font-size: 1rem;
  }

  .achievement-section-title {
    font-size: 1.5rem;
  }

  .achievement-section-subtitle {
    font-size: 1rem;
  }
}
</style>