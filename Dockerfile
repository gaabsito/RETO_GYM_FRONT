# Etapa de compilación
FROM node:18-alpine AS build
WORKDIR /app

# Copiar archivos de configuración del proyecto
COPY GymFRONT/vue-gym/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar los archivos del proyecto
COPY GymFRONT/vue-gym/ .

# Construir la aplicación para producción
RUN npm run build

# Etapa de producción
FROM nginx:alpine AS production
WORKDIR /usr/share/nginx/html

# Copiar la configuración personalizada de nginx si es necesaria
# COPY GymFRONT/vue-gym/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar la aplicación compilada desde la etapa de compilación
COPY --from=build /app/dist .

# Crear un archivo de configuración para permitir el enrutamiento de Vue Router en Nginx
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]