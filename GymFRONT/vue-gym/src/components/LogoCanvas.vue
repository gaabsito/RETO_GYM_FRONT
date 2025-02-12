<script setup lang="ts">
import { onMounted, ref } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Definir tamaño del canvas cuadrado
  canvas.width = 150;
  canvas.height = 150;

  // Variables para controlar el cambio de tamaño de la letra y la pesa
  let scale = 1;
  let opacity = 1;
  let isHovered = false;  // Para controlar si el ratón está encima

  function drawLogo() {
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isHovered) {
      // Fondo de color blanquecino solo si no está el ratón encima
      ctx.fillStyle = "#FFFAE5"; // Color de fondo blanquecino
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Marco cuadrado en color blanquecino
    ctx.strokeStyle = "#FFFAE5"; // Blanquecino
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Texto principal con color naranja
    ctx.font = `bold ${80 * scale}px Impact`;
    ctx.fillStyle = "#FF8C00"; // Naranja fuerte
    ctx.textAlign = "center";
    ctx.fillText("E", canvas.width / 2, 70 * scale); // Ajustar la posición de la "E"

    // Mancuerna con discos centrados en color naranja
    ctx.strokeStyle = "#FF8C00"; // Naranja fuerte para la pesa
    ctx.lineWidth = 8;
    const barX = canvas.width / 2 - (120 * scale) / 2; // Centro de la barra
    ctx.beginPath();
    ctx.moveTo(barX, 110 * scale); // Ajustar la barra, alineada al centro
    ctx.lineTo(barX + 120 * scale, 110 * scale); // Ajustar la barra, alineada al centro
    ctx.stroke();

    // Discos rectangulares alineados con la barra en color naranja
    ctx.fillStyle = "#FF8C00"; // Naranja fuerte
    ctx.fillRect(barX - 12 * scale, 90 * scale, 12 * scale, 30 * scale); // Izquierdo
    ctx.fillRect(barX + 108 * scale, 90 * scale, 12 * scale, 30 * scale); // Derecho
  }

  // Dibuja el logo inicialmente
  drawLogo();

  // Función de animación para suavizar el cambio
  function animateLogo(scaleTarget: number, opacityTarget: number) {
    const step = 0.1;
    const scaleDiff = scaleTarget - scale;
    const opacityDiff = opacityTarget - opacity;

    // Si el cambio es muy pequeño, se detiene la animación
    if (Math.abs(scaleDiff) < 0.01 && Math.abs(opacityDiff) < 0.01) return;

    scale += scaleDiff * step;
    opacity += opacityDiff * step;

    // Vuelve a dibujar con la nueva escala y opacidad
    ctx.globalAlpha = opacity; // Aplica la opacidad
    drawLogo();

    // Vuelve a llamar la animación en el siguiente frame
    requestAnimationFrame(() => animateLogo(scaleTarget, opacityTarget));
  }

  // Evento para cambiar el tamaño y posición al pasar el ratón
  canvas.addEventListener("mouseover", () => {
    isHovered = true;  // Controla que el fondo se elimine
    animateLogo(1.2, 0.8); // Agrandar un 20% y reducir la opacidad
  });

  // Vuelve al estado original cuando se sale con el ratón
  canvas.addEventListener("mouseout", () => {
    isHovered = false;  // Controla que el fondo vuelva a aparecer
    animateLogo(1, 1); // Vuelve a la escala original y opacidad completa
  });
});
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>

<style scoped>
canvas {
  display: block;
  width: 50px;
  height: 50px;
  transition: transform 0.3s ease, opacity 0.3s ease; /* Transición suave */
}
</style>
