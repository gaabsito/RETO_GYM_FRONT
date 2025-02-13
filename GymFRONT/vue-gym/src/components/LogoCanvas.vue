<script setup lang="ts">
import { onMounted, ref } from "vue";

// Referencia al elemento <canvas> en el DOM
const canvasRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Define el tamaño del canvas
  canvas.width = 150;
  canvas.height = 150;

  // Variables de control de animación
  let scaleE = 1, scaleDisk = 1; // Escala de la letra 'E' y del disco
  let opacityE = 1;
  let barRotation = -Math.PI / 10; // Inclinación inicial de la barra
  let isAnimatingE = false;
  let isAnimating = false;
  let rotationE = -Math.PI / 10; // Inclinación inicial de la 'E'

  // Función para dibujar el logotipo
  function drawLogo() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas
    
    // Dibujar el disco de pesas
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(barRotation);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.fillStyle = "#FFFAE5";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50 * scaleDisk, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50 * scaleDisk, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 40 * scaleDisk, 0, Math.PI * 2);
    ctx.stroke();

    // Dibujar el agujero en el centro del disco
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    
    // Dibujar la barra horizontal con ajuste para que no se monte sobre el disco
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(barRotation);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.lineWidth = 14;
    ctx.strokeStyle = "#000";

    // Parte izquierda más larga
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 75, canvas.height / 2);
    ctx.lineTo(canvas.width / 2 - 2, canvas.height / 2);
    ctx.stroke();

    // Parte derecha ajustada para no montarse sobre el disco
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 + 52, canvas.height / 2);
    ctx.lineTo(canvas.width / 2 + 72, canvas.height / 2);
    ctx.stroke();

    ctx.restore();
    
    // Dibujar la letra 'E' centrada en el medio del disco
    ctx.save();
    ctx.translate(canvas.width / 1.975, canvas.height / 1.82);
    ctx.rotate(rotationE);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.globalAlpha = opacityE;
    ctx.font = `bold ${90 * scaleE}px Staatliches`;
    ctx.fillStyle = "#FF8C00";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("E", canvas.width / 2, canvas.height / 2);
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  function animate(targetScaleDisk: number, targetRotation: number) {
    if (isAnimating) return;
    isAnimating = true;
    const step = 0.1;
    
    function stepAnimation() {
      let scaleDiffDisk = targetScaleDisk - scaleDisk;
      let rotationDiff = targetRotation - barRotation;
      
      if (Math.abs(scaleDiffDisk) < 0.01 && Math.abs(rotationDiff) < 0.01) {
        scaleDisk = targetScaleDisk;
        barRotation = targetRotation;
        isAnimating = false;
        return;
      }
      
      scaleDisk += scaleDiffDisk * step;
      barRotation += rotationDiff * step;
      
      drawLogo();
      requestAnimationFrame(stepAnimation);
    }
    stepAnimation();
  }

  function animateE(targetRotation: number) {
    if (isAnimatingE) return;
    isAnimatingE = true;
    const step = 0.1;

    function stepAnimation() {
      let rotationDiff = targetRotation - rotationE;
      if (Math.abs(rotationDiff) < 0.01) {
        rotationE = targetRotation;
        isAnimatingE = false;
        return;
      }
      rotationE += rotationDiff * step;
      drawLogo();
      requestAnimationFrame(stepAnimation);
    }
    stepAnimation();
  }

  drawLogo();

  canvas.addEventListener("mouseover", () => {
    animate(1.1, -Math.PI / 8);
    animateE(0);
  });

  canvas.addEventListener("mouseout", () => {
    animate(1, -Math.PI / 10);
    animateE(-Math.PI / 10);
  });
});
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>

<style scoped>
canvas {
  display: block;
  width: 65px;
  height: 65px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}
</style>
