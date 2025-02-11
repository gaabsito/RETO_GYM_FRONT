<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  const canvas = document.getElementById("logoCanvas") as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Definir tamaño del canvas cuadrado
  canvas.width = 150;
  canvas.height = 150;

  function drawLogo() {
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo blanco anaranjado
    ctx.fillStyle = "#FFFAE5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Marco cuadrado
    ctx.strokeStyle = "white";
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Texto principal con color naranja
    ctx.font = "bold 80px Impact";
    ctx.fillStyle = "#FF8C00"; // Naranja fuerte
    ctx.textAlign = "center";
    ctx.fillText("E", canvas.width / 2, 90);

    // Mancuerna con discos centrados en color naranja
    ctx.strokeStyle = "#FF8C00";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(30, 110);
    ctx.lineTo(120, 110);
    ctx.stroke();

    // Discos rectangulares alineados con la barra en color naranja
    ctx.fillStyle = "#FF8C00";
    ctx.fillRect(25, 90, 10, 30); // Izquierdo
    ctx.fillRect(115, 90, 10, 30); // Derecho
  }

  // Dibuja el logo inicialmente
  drawLogo();

  // Evento para cambiar el tamaño o posición al pasar el ratón
  canvas.addEventListener("mouseover", () => {
    ctx.fillText("E", canvas.width / 2, 85);
    ctx.moveTo(25, 115);
    ctx.lineTo(125, 115);
    drawLogo();
  });

  canvas.addEventListener("mouseout", () => {
    drawLogo();
  });
});
</script>

<template>
  <canvas id="logoCanvas"></canvas>
</template>

<style scoped>
canvas {
  display: block;
  width: 70px;
  height: 70px;
}
</style>
