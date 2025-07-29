# Dockerfile para Next.js Static Export + Nginx
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copiar código fonte
COPY . .

# Build da aplicação estática
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage final - Nginx para servir arquivos estáticos
FROM nginx:alpine

# Copiar arquivos estáticos gerados
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuração do Nginx para SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    # Cache para assets estáticos \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    # Gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]