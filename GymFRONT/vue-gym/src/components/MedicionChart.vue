<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
const formatTooltip = (value: number, name: string, props: any) => {
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
    .filter(val => val !== null && val !== undefined) as number[];
  
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
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="fecha" stroke="#666" tick={{ fontSize: 12 }} />
          <YAxis domain={yDomain} stroke="#666" tick={{ fontSize: 12 }} 
                 tickFormatter={(v) => `${v}${metricaConfig.unidad}`} />
          <Tooltip 
            formatter={formatTooltip} 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} 
          />
          <Legend />
          
          <!-- Línea principal -->
          <Line 
            type="monotone" 
            dataKey={metrica} 
            name={metricaConfig.nombre}
            stroke={lineColor}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            dot={{ strokeWidth: 2, r: 4, stroke: lineColor, fill: 'white' }}
          />
          
          <!-- Líneas de referencia (solo para IMC) -->
          <ReferenceLine 
            v-for="(ref, index) in referencias" 
            :key="index"
            y={ref.valor} 
            stroke="#ddd" 
            strokeDasharray="3 3"
            label={{ value: ref.label, fill: '#888', fontSize: 12 }}
          />
        </LineChart>
      </ResponsiveContainer>
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