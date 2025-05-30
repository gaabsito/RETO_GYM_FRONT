<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRutinasCompletadasStore } from '@/stores/rutinasCompletadas';
import { useRolesStore } from '@/stores/roles';
import type { RutinaCompletada } from '@/types/RutinaCompletada';

const props = defineProps<{
  month?: number; // Mes actual (1-12)
  year?: number;  // Año actual
  showWeekProgress?: boolean; // Mostrar progreso semanal
}>()

const rutinasCompletadasStore = useRutinasCompletadasStore();
const rolesStore = useRolesStore();

// Estado local
const loading = ref(false);
const error = ref('');
const rutinasCompletadas = ref<RutinaCompletada[]>([]);
const currentWeekOffset = ref(0); // 0 = semana actual, -1 = anterior, +1 = siguiente
const diasUnicosEntrenados = ref(0);

// Función para obtener el lunes de una semana específica
const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Ajustar para que lunes sea el primer día
  return new Date(d.setDate(diff))
}

// Función para obtener el domingo de una semana específica
const getSundayOfWeek = (date: Date): Date => {
  const monday = getMondayOfWeek(date)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return sunday
}

// Obtener la fecha de inicio de la semana a mostrar
const getWeekStartDate = (): Date => {
  const today = new Date()
  const currentMonday = getMondayOfWeek(today)
  const weekStart = new Date(currentMonday)
  weekStart.setDate(currentMonday.getDate() + (currentWeekOffset.value * 7))
  return weekStart
}

// Nombres de los días de la semana
const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Cargar datos
const loadData = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // Cargar todas las rutinas completadas
    await rutinasCompletadasStore.fetchRutinasCompletadas();
    rutinasCompletadas.value = rutinasCompletadasStore.rutinasCompletadas;
    
    // Cargar días únicos entrenados esta semana para la barra de progreso
    if (props.showWeekProgress) {
      await rolesStore.getUserRole();
      diasUnicosEntrenados.value = rolesStore.currentRole?.diasEntrenadosSemanales || 0;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar datos de entrenamientos';
  } finally {
    loading.value = false;
  }
};

// Cambiar a la semana anterior
const previousWeek = () => {
  currentWeekOffset.value -= 1;
};

// Cambiar a la semana siguiente
const nextWeek = () => {
  currentWeekOffset.value += 1;
};

// Volver a la semana actual
const goToCurrentWeek = () => {
  currentWeekOffset.value = 0;
};

// Generar los días de la semana actual (lunes a domingo)
const weekDates = computed(() => {
  const weekStart = getWeekStartDate();
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date);
  }
  
  return dates;
});

// Crear conjunto de fechas entrenadas en formato 'YYYY-MM-DD'
const trainedDatesSet = computed(() => {
  return new Set(
    rutinasCompletadas.value
      .map(rutina => {
        const date = new Date(rutina.fechaCompletada);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      })
  );
});

// Información de los días de la semana con datos de entrenamiento
const weekDaysInfo = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return weekDates.value.map((date, index) => {
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    const isTrained = trainedDatesSet.value.has(dateStr);
    
    // Determinar si es hoy
    const isToday = date.getTime() === today.getTime();
    
    // Determinar si está en el futuro
    const isFuture = date.getTime() > today.getTime();
    
    return {
      date,
      dayName: weekDays[index],
      dayNumber: date.getDate(),
      dateStr,
      isTrained,
      isToday,
      isFuture,
      monthName: date.toLocaleDateString('es-ES', { month: 'short' })
    };
  });
});

// Calcular el progreso de la semana actual (solo si estamos viendo la semana actual)
const weeklyProgressPercentage = computed(() => {
  if (currentWeekOffset.value !== 0) {
    // Si no estamos en la semana actual, calcular el progreso basado en los entrenamientos de esa semana
    const weekStart = getWeekStartDate();
    const weekEnd = getSundayOfWeek(weekStart);
    
    let trainedDaysInWeek = 0;
    weekDaysInfo.value.forEach(dayInfo => {
      if (dayInfo.isTrained) {
        trainedDaysInWeek++;
      }
    });
    
    return Math.min(100, (trainedDaysInWeek / 7) * 100);
  }
  
  // Para la semana actual, usar los días únicos entrenados del rol
  return Math.min(100, (diasUnicosEntrenados.value / 7) * 100);
});

// Calcular color del progreso basado en la cantidad de días
const progressColor = computed(() => {
  const daysCount = currentWeekOffset.value === 0 
    ? diasUnicosEntrenados.value 
    : weekDaysInfo.value.filter(day => day.isTrained).length;
    
  if (daysCount <= 2) return 'success'; // Verde para principiante/constante
  if (daysCount <= 4) return 'info';    // Azul para comprometido/dedicado
  if (daysCount <= 6) return 'warning'; // Naranja para disciplinado/atleta
  return 'error';                       // Rojo para élite
});

// Formato para mostrar el rango de la semana
const weekRange = computed(() => {
  const weekStart = getWeekStartDate();
  const weekEnd = getSundayOfWeek(weekStart);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };
  
  const startFormatted = formatDate(weekStart);
  const endFormatted = formatDate(weekEnd);
  
  // Si es la misma semana del año, mostrar el año
  const year = weekStart.getFullYear();
  const currentYear = new Date().getFullYear();
  const yearSuffix = year !== currentYear ? ` ${year}` : '';
  
  return `${startFormatted} - ${endFormatted}${yearSuffix}`;
});

// Descripción de la semana actual
const weekDescription = computed(() => {
  if (currentWeekOffset.value === 0) return 'Esta semana';
  if (currentWeekOffset.value === -1) return 'Semana anterior';
  if (currentWeekOffset.value === 1) return 'Semana siguiente';
  if (currentWeekOffset.value < -1) return `${Math.abs(currentWeekOffset.value)} semanas atrás`;
  return `En ${currentWeekOffset.value} semanas`;
});

// Verificar si estamos visualizando la semana actual
const isCurrentWeek = computed(() => currentWeekOffset.value === 0);

// Estadísticas de la semana
const weekStats = computed(() => {
  const trainedDays = weekDaysInfo.value.filter(day => day.isTrained).length;
  const percentage = Math.round((trainedDays / 7) * 100);
  
  return {
    trainedDays,
    totalDays: 7,
    percentage
  };
});

// Cargar datos al montar el componente
onMounted(() => {
  loadData();
});

// Observar cambios en currentWeekOffset para recargar datos si es necesario
watch(() => currentWeekOffset.value, () => {
  // Aquí podrías cargar datos específicos de la semana si fuera necesario
  // Por ahora, los datos se filtran en computed properties
});
</script>

<template>
  <div class="entrenamiento-calendar">
    <!-- Estado de carga -->
    <div v-if="loading" class="d-flex justify-center align-center py-4">
      <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
    </div>
    
    <!-- Mensaje de error -->
    <v-alert v-else-if="error" type="error" variant="tonal" density="compact" class="mb-4">
      {{ error }}
    </v-alert>
    
    <!-- Calendario -->
    <div v-else class="calendar-container">
      <!-- Barra de progreso semanal (opcional) -->
      <div v-if="props.showWeekProgress" class="weekly-progress mb-4">
        <div class="d-flex justify-space-between align-center mb-1">
          <div class="text-body-2 font-weight-medium">
            {{ isCurrentWeek ? 'Progreso semanal' : 'Entrenamientos de la semana' }}
          </div>
          <div class="text-caption">
            {{ isCurrentWeek ? diasUnicosEntrenados : weekStats.trainedDays }}/7 días
          </div>
        </div>
        
        <v-progress-linear
          :model-value="weeklyProgressPercentage"
          height="10"
          rounded
          :color="progressColor"
          bg-color="grey-lighten-3"
          class="weekly-progress-bar"
        ></v-progress-linear>
        
        <div class="text-caption mt-1 text-center">
          <span v-if="isCurrentWeek">
            {{ diasUnicosEntrenados < 7 
              ? `${7 - diasUnicosEntrenados} días más para completar la semana` 
              : '¡Semana completa!' }}
          </span>
          <span v-else>
            {{ weekStats.trainedDays < 7 
              ? `${weekStats.trainedDays} de 7 días entrenados` 
              : '¡Semana completa!' }}
          </span>
        </div>
      </div>
      
      <!-- Cabecera del calendario con navegación por semanas -->
      <div class="calendar-header">
        <v-btn 
          icon 
          variant="text" 
          @click="previousWeek" 
          size="small"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        
        <div class="current-week-info">
          <div class="week-description">{{ weekDescription }}</div>
          <div class="week-range">{{ weekRange }}</div>
          <v-btn
            v-if="!isCurrentWeek"
            size="x-small"
            variant="text"
            @click="goToCurrentWeek"
            class="today-btn"
          >
            Esta semana
          </v-btn>
        </div>
        
        <v-btn 
          icon 
          variant="text" 
          @click="nextWeek"
          size="small"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
      
      <!-- Vista semanal (Lunes a Domingo) -->
      <div class="week-calendar">
        <!-- Cabecera con nombres de días -->
        <div class="week-header">
          <div v-for="(dayInfo, index) in weekDaysInfo" :key="index" class="day-header">
            <div class="day-name">{{ dayInfo.dayName }}</div>
            <div class="day-date">{{ dayInfo.dayNumber }}</div>
            <div v-if="dayInfo.monthName" class="month-name">{{ dayInfo.monthName }}</div>
          </div>
        </div>
        
        <!-- Cuerpo del calendario con indicadores de entrenamiento -->
        <div class="week-body">
          <div
            v-for="(dayInfo, index) in weekDaysInfo"
            :key="index"
            class="day-cell"
            :class="{
              'trained-day': dayInfo.isTrained,
              'today': dayInfo.isToday,
              'future-day': dayInfo.isFuture && isCurrentWeek
            }"
          >
            <!-- Indicador de entrenamiento -->
            <div v-if="dayInfo.isTrained" class="training-indicator">
              <v-icon color="white" size="small">mdi-check</v-icon>
            </div>
            
            <!-- Indicador de día actual -->
            <div v-else-if="dayInfo.isToday" class="today-indicator">
              <v-icon color="white" size="small">mdi-calendar-today</v-icon>
            </div>
            
            <!-- Espacio vacío para días sin entrenamiento -->
            <div v-else class="empty-indicator">
              <v-icon color="grey-lighten-1" size="small">mdi-calendar-blank</v-icon>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Estadísticas de la semana -->
      <div class="week-summary">
        <div class="stats-item">
          <div class="stats-value">{{ weekStats.trainedDays }}</div>
          <div class="stats-label">Días entrenados</div>
        </div>
        
        <div class="stats-item">
          <div class="stats-value">{{ weekStats.percentage }}%</div>
          <div class="stats-label">De la semana</div>
        </div>
        
        <div v-if="isCurrentWeek" class="stats-item">
          <div class="stats-value">{{ 7 - weekStats.trainedDays }}</div>
          <div class="stats-label">Días restantes</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.entrenamiento-calendar {
  width: 100%;
  background-color: white;
  border-radius: $border-radius;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  
  @media (max-width: 599px) {
    max-width: 100%;
    overflow-x: hidden;
  }
}

.calendar-container {
  padding: 16px;
}

.weekly-progress {
  background-color: $light-gray;
  padding: 12px;
  border-radius: $border-radius;
  
  .weekly-progress-bar {
    border-radius: $border-radius;
  }
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .current-week-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    text-align: center;
    
    .week-description {
      font-weight: 600;
      font-family: $font-family-base;
      font-size: 1.1rem;
      color: $secondary-color;
    }
    
    .week-range {
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.6);
      margin-top: 2px;
    }
    
    .today-btn {
      margin-top: 4px;
      font-size: 0.7rem;
      padding: 0 6px;
      height: 20px;
      color: $primary-color;
    }
  }
}

.week-calendar {
  margin-bottom: 16px;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
  
  .day-header {
    text-align: center;
    padding: 8px 4px;
    
    .day-name {
      font-weight: 500;
      font-size: 0.8rem;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 2px;
    }
    
    .day-date {
      font-weight: 600;
      font-size: 1.1rem;
      color: $secondary-color;
    }
    
    .month-name {
      font-size: 0.7rem;
      color: rgba(0, 0, 0, 0.4);
      margin-top: 1px;
    }
  }
}

.week-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  
  .day-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    
    &.trained-day {
      background-color: $primary-color;
      
      &:hover {
        background-color: darken($primary-color, 10%);
      }
    }
    
    &.today:not(.trained-day) {
      background-color: rgba($primary-color, 0.2);
      border: 2px solid $primary-color;
      
      &:hover {
        background-color: rgba($primary-color, 0.3);
      }
    }
    
    &.future-day:not(.trained-day):not(.today) {
      background-color: rgba(0, 0, 0, 0.05);
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }
    
    &:not(.trained-day):not(.today):not(.future-day) {
      background-color: rgba(0, 0, 0, 0.03);
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
      }
    }
  }
}

.training-indicator,
.today-indicator,
.empty-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.week-summary {
  display: flex;
  justify-content: space-around;
  padding-top: 16px;
  border-top: 1px solid $light-gray;
  
  .stats-item {
    text-align: center;
    
    .stats-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: $primary-color;
      font-family: $font-family-base;
    }
    
    .stats-label {
      font-size: 0.8rem;
      color: rgba(0, 0, 0, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .calendar-container {
    padding: 12px;
  }
  
  .week-header .day-header {
    padding: 6px 2px;
    
    .day-name {
      font-size: 0.7rem;
    }
    
    .day-date {
      font-size: 1rem;
    }
  }
  
  .week-body {
    gap: 6px;
  }
  
  .current-week-info {
    .week-description {
      font-size: 1rem;
    }
    
    .week-range {
      font-size: 0.8rem;
    }
  }
}
</style>