<!-- src/components/EntrenamientoCalendar.vue -->
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRutinasCompletadasStore } from '@/stores/rutinasCompletadas';
import type { RutinaCompletada } from '@/types/RutinaCompletada';

const props = defineProps<{
  month?: number; // Mes actual (1-12)
  year?: number;  // Año actual
}>();

const rutinasCompletadasStore = useRutinasCompletadasStore();

// Estado local
const loading = ref(false);
const error = ref('');
const rutinasCompletadas = ref<RutinaCompletada[]>([]);
const currentMonth = ref(props.month || new Date().getMonth() + 1);
const currentYear = ref(props.year || new Date().getFullYear());

// Nombres de los meses
const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

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
    
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al cargar datos de entrenos';
  } finally {
    loading.value = false;
  }
};

// Cambiar al mes anterior
const previousMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

// Cambiar al mes siguiente
const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

// Volver al mes actual
const goToCurrentMonth = () => {
  const today = new Date();
  currentMonth.value = today.getMonth() + 1;
  currentYear.value = today.getFullYear();
};

// Generar los días del calendario para el mes actual
const calendarDays = computed(() => {
  // Crear una fecha para el primer día del mes
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1);
  
  // Obtener el día de la semana del primer día (0: domingo, 1: lunes, ..., 6: sábado)
  // Necesitamos ajustar para que lunes sea 0
  let firstDayOfWeek = firstDay.getDay() - 1;
  if (firstDayOfWeek === -1) firstDayOfWeek = 6; // Si es domingo (0), lo convertimos a 6
  
  // Calcular el último día del mes
  const lastDay = new Date(currentYear.value, currentMonth.value, 0);
  const totalDays = lastDay.getDate();
  
  // Días del mes anterior
  const prevMonthDays = [];
  if (firstDayOfWeek > 0) {
    const prevMonthLastDay = new Date(currentYear.value, currentMonth.value - 1, 0).getDate();
    for (let i = 0; i < firstDayOfWeek; i++) {
      prevMonthDays.push({
        day: prevMonthLastDay - firstDayOfWeek + i + 1,
        current: false,
        trained: false
      });
    }
  }
  
  // Días del mes actual con información de entrenamientos
  const currentMonthDays = [];
  const trainedDaysSet = new Set(
    rutinasCompletadas.value
      .filter(rutina => {
        const rutinaDate = new Date(rutina.fechaCompletada);
        return rutinaDate.getMonth() + 1 === currentMonth.value && 
               rutinaDate.getFullYear() === currentYear.value;
      })
      .map(rutina => new Date(rutina.fechaCompletada).getDate())
  );
  
  for (let i = 1; i <= totalDays; i++) {
    currentMonthDays.push({
      day: i,
      current: true,
      trained: trainedDaysSet.has(i),
      isToday: isToday(i)
    });
  }
  
  // Días del mes siguiente
  const nextMonthDays = [];
  const totalCells = Math.ceil((firstDayOfWeek + totalDays) / 7) * 7;
  const remainingCells = totalCells - (prevMonthDays.length + currentMonthDays.length);
  
  for (let i = 1; i <= remainingCells; i++) {
    nextMonthDays.push({
      day: i,
      current: false,
      trained: false
    });
  }
  
  // Combinar todos los días
  return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
});

// Verificar si un día es hoy
const isToday = (day: number) => {
  const today = new Date();
  return day === today.getDate() && 
         currentMonth.value === today.getMonth() + 1 && 
         currentYear.value === today.getFullYear();
};

// Cargar datos al montar el componente
onMounted(() => {
  loadData();
});

// Observar cambios en el mes o año para actualizar el calendario
watch([() => currentMonth.value, () => currentYear.value], () => {
  // Si se necesita recargar datos específicos del mes, activar aquí
});

// Formato para representar el mes y año actual
const currentMonthYear = computed(() => {
  return `${monthNames[currentMonth.value - 1]} ${currentYear.value}`;
});

// Calcular estadísticas del mes actual
const monthStats = computed(() => {
  const trainedDays = calendarDays.value.filter(day => day.current && day.trained).length;
  const totalDays = calendarDays.value.filter(day => day.current).length;
  const percentage = totalDays > 0 ? Math.round((trainedDays / totalDays) * 100) : 0;
  
  return {
    trainedDays,
    totalDays,
    percentage
  };
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
      <!-- Cabecera del calendario -->
      <div class="calendar-header">
        <v-btn 
          icon 
          variant="text" 
          @click="previousMonth" 
          size="small"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        
        <div class="current-month">
          <span class="month-year">{{ currentMonthYear }}</span>
          <v-btn
            size="x-small"
            variant="text"
            @click="goToCurrentMonth"
            class="today-btn"
            v-if="currentMonth !== new Date().getMonth() + 1 || currentYear !== new Date().getFullYear()"
          >
            Hoy
          </v-btn>
        </div>
        
        <v-btn 
          icon 
          variant="text" 
          @click="nextMonth"
          size="small"
        >
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
      
      <!-- Días de la semana -->
      <div class="weekdays">
        <div v-for="day in weekDays" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>
      
      <!-- Días del mes -->
      <div class="days">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="day"
          :class="{
            'current-month': day.current,
            'other-month': !day.current,
            'trained-day': day.trained,
            'today': day.isToday
          }"
        >
          <span class="day-number">{{ day.day }}</span>
          <div v-if="day.trained" class="trained-indicator"></div>
        </div>
      </div>
      
      <!-- Estadísticas del mes -->
      <div class="month-summary">
        <div class="stats-item">
          <div class="stats-value">{{ monthStats.trainedDays }}</div>
          <div class="stats-label">Días entrenados</div>
        </div>
        
        <div class="stats-item">
          <div class="stats-value">{{ monthStats.percentage }}%</div>
          <div class="stats-label">Del mes</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.entrenamiento-calendar {
  margin: 0 auto;
  max-width: 100%;
  background-color: white;
  border-radius: $border-radius;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.calendar-container {
  padding: 16px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .current-month {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    
    .month-year {
      font-weight: 600;
      font-family: $font-family-base;
      font-size: 1.1rem;
      color: $secondary-color;
      text-transform: capitalize;
    }
    
    .today-btn {
      margin-top: 2px;
      font-size: 0.7rem;
      padding: 0 4px;
      height: 20px;
      color: $primary-color;
    }
  }
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 500;
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
  border-bottom: 1px solid $light-gray;
  padding-bottom: 8px;
  margin-bottom: 8px;
  
  .weekday {
    padding: 5px 0;
  }
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  
  .day {
    position: relative;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    
    .day-number {
      font-weight: 500;
      font-size: 0.9rem;
    }
    
    &.current-month {
      color: $secondary-color;
    }
    
    &.other-month {
      color: rgba(0, 0, 0, 0.3);
    }
    
    &.trained-day {
      background-color: rgba($primary-color, 0.15);
      
      .trained-indicator {
        position: absolute;
        bottom: 5px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background-color: $primary-color;
      }
    }
    
    &.today {
      color: white;
      background-color: $primary-color;
      font-weight: 600;
      
      .trained-indicator {
        background-color: white;
      }
    }
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      
      &.trained-day {
        background-color: rgba($primary-color, 0.25);
      }
      
      &.today {
        background-color: darken($primary-color, 5%);
      }
    }
  }
}

.month-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
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
    }
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .calendar-container {
    padding: 12px;
  }
  
  .days .day .day-number {
    font-size: 0.8rem;
  }
}
</style>