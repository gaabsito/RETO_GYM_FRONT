<script setup lang="ts">
import { onMounted, ref } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Definir tamaño del canvas cuadrado
  canvas.width = 150;
  canvas.height = 150;

  // Variables de animación separadas
  let scaleE = 1, scaleBar = 1;
  let opacityE = 1, opacityBar = 1;
  let isHovered = false;
  let isAnimating = false;

  function drawLogo() {
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isHovered) {
      ctx.fillStyle = "#FFFAE5";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Marco cuadrado más grueso
    const borderSize = 10;
    ctx.strokeStyle = "#FFFAE5";
    ctx.lineWidth = 8;
    ctx.strokeRect(borderSize, borderSize, canvas.width - borderSize * 2, canvas.height - borderSize * 2);

    // Dibujar la letra "E"
    ctx.globalAlpha = opacityE;
    ctx.font = `bold ${80 * scaleE}px Impact`;
    ctx.fillStyle = "#FF8C00";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("E", canvas.width / 2, 55 * scaleE);

    // Dibujar barra de la mancuerna
    ctx.globalAlpha = opacityBar;
    ctx.strokeStyle = "#FF8C00";
    ctx.lineWidth = 8;

    const barWidth = 100 * scaleBar;
    const barX = (canvas.width - barWidth) / 2;
    const barY = 110 * scaleBar; // Posición de la barra

    ctx.beginPath();
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX + barWidth, barY);
    ctx.stroke();

    // Discos alineados correctamente (la barra está en el centro)
    const discWidth = 14 * scaleBar;
    const discHeight = 30 * scaleBar;
    const discOffsetY = -discHeight / 2 + ctx.lineWidth / 2; // Ajustado para centrar la barra

    ctx.fillStyle = "#FF8C00";
    ctx.fillRect(barX - discWidth, barY - discHeight / 2, discWidth, discHeight); // Izquierdo
    ctx.fillRect(barX + barWidth, barY - discHeight / 2, discWidth, discHeight); // Derecho

    // Restaurar opacidad
    ctx.globalAlpha = 1;
  }

  // Función de animación mejorada
  function animate(targetScaleE: number, targetOpacityE: number, targetScaleBar: number, targetOpacityBar: number) {
    if (isAnimating) return;
    isAnimating = true;

    const step = 0.1;

    function stepAnimation() {
      let scaleDiffE = targetScaleE - scaleE;
      let opacityDiffE = targetOpacityE - opacityE;
      let scaleDiffBar = targetScaleBar - scaleBar;
      let opacityDiffBar = targetOpacityBar - opacityBar;

      if (Math.abs(scaleDiffE) < 0.01 && Math.abs(opacityDiffE) < 0.01 && Math.abs(scaleDiffBar) < 0.01 && Math.abs(opacityDiffBar) < 0.01) {
        scaleE = targetScaleE;
        opacityE = targetOpacityE;
        scaleBar = targetScaleBar;
        opacityBar = targetOpacityBar;
        isAnimating = false;
        return;
      }

      scaleE += scaleDiffE * step;
      opacityE += opacityDiffE * step;
      scaleBar += scaleDiffBar * step;
      opacityBar += opacityDiffBar * step;

      drawLogo();
      requestAnimationFrame(stepAnimation);
    }

    stepAnimation();
  }

  // Dibujar el logo inicialmente
  drawLogo();

  // Eventos para la animación
  canvas.addEventListener("mouseover", () => {
    isHovered = true;
    animate(1.2, 0.8, 1.1, 0.9);
  });

  canvas.addEventListener("mouseout", () => {
    isHovered = false;
    animate(1, 1, 1, 1);
  });
});
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>

<style scoped>
canvas {
  display: block;
  width: 45px;
  height: 45px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
</style>
