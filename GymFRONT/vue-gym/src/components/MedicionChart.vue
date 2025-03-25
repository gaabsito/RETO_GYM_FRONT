<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { Line } from 'recharts';
import type { Medicion } from '@/types/Medicion';

const props = defineProps<{
  mediciones: Medicion[];
  metrica: 'peso' | 'imc' | 'porcentajeGrasa' | 'circunferenciaCintura' | 'circunferenciaBrazo' | 'circunferenciaPecho' | 'circunferenciaMuslo';
  color?: string;
}>();

// Configuración del gráfico
const metricas = {
  peso: {
    nombre: 'Peso',
    unidad: 'kg',
    color: '#e25401', // Color primario
    referencia: null
  },
  imc: {
    nombre: 'IMC',
    unidad: '',
    color: '#42b883', // Verde Vue
    referencia: [
      { valor: 18.5, label: 'Bajo peso' },
      { valor: 25, label: 'Peso normal' },
      { valor: 30, label: 'Sobrepeso' }
    ]
  },
  porcentajeGrasa: {
    nombre: '% Grasa',
    unidad: '%',
    color: '#2c3e50', // Color secundario
    referencia: null
  },
  circunferenciaCintura: {
    nombre: 'Cintura',
    unidad: 'cm',
    color: '#FF5733',
    referencia: null
  },
  circunferenciaBrazo: {
    nombre: 'Brazo',
    unidad: 'cm',
    color: '#3498DB',
    referencia: null
  },
  circunferenciaPecho: {
    nombre: 'Pecho',
    unidad: 'cm',
    color: '#9B59B6',
    referencia: null
  },
  circunferenciaMuslo: {
    nombre: 'Muslo',
    unidad: 'cm',
    color: '#F1C40F',
    referencia: null
  }
};

// Datos para el gráfico
const chartData = computed(() => {
  if (!props.mediciones || props.mediciones.length === 0) return [];
  
  // Ordenar por fecha
  const sorted = [...props.mediciones].sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
  
  // Convertir a formato para Recharts
  return sorted.map(medicion => {
    const fecha = new Date(medicion.fecha);
    const formattedDate = fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
    
    // Obtener el valor de la métrica seleccionada
    const valor = medicion[props.metrica];
    
    return {
      fecha: formattedDate,
      [props.metrica]: valor || null
    };
  });
});

// Obtener configuración de la métrica actual
const metricaConfig = computed(() => metricas[props.metrica]);

// Formatear tooltips
const formatTooltip = (value, name, props) => {
  if (name === props.metrica) {
    return [`${value} ${metricaConfig.value.unidad}`, metricaConfig.value.nombre];
  }
  return [value, name];
};

// Determinar dominio del eje Y dinámicamente
const yDomain = computed(() => {
  if (!props.mediciones || props.mediciones.length === 0) return [0, 100];
  
  // Filtrar valores null
  const valores = props.mediciones
    .map(m => m[props.metrica])
    .filter(val => val !== null && val !== undefined);
  
  if (valores.length === 0) return [0, 100];
  
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  
  // Añadir un margen para mejor visualización
  const rango = max - min;
  const margen = Math.max(rango * 0.1, 1); // Al menos 1 unidad de margen o 10% del rango
  
  return [
    Math.max(0, min - margen), // No permitir valores negativos para métricas físicas
    max + margen
  ];
});

// Color del gráfico
const lineColor = computed(() => props.color || metricaConfig.value.color);

// Referencias / líneas de guía
const referencias = computed(() => metricaConfig.value.referencia || []);
</script>

<template>
  <div class="chart-container">
    <div v-if="mediciones.length === 0" class="no-data-message">
      <p>No hay datos suficientes para generar el gráfico</p>
    </div>
    
    <div v-else class="chart-wrapper">
      <v-responsive :aspect-ratio="16/9">
        <v-chart 
          :option="{
            tooltip: {
              trigger: 'axis',
              formatter: (params) => {
                const param = params[0];
                return `${param.name}: ${param.value[props.metrica]}${metricaConfig.unidad}`;
              }
            },
            xAxis: {
              type: 'category',
              data: chartData.map(item => item.fecha)
            },
            yAxis: {
              type: 'value',
              min: yDomain[0],
              max: yDomain[1]
            },
            series: [{
              name: metricaConfig.nombre,
              type: 'line',
              smooth: true,
              data: chartData.map(item => item[props.metrica]),
              itemStyle: {
                color: lineColor
              }
            }],
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            }
          }"
        ></v-chart>
      </v-responsive>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/main.scss';

.chart-container {
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
}

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: $light-gray;
  border-radius: $border-radius;
  color: rgba(0, 0, 0, 0.6);
  font-family: $font-family-text;
}
</style>