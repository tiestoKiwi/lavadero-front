FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y curl ca-certificates gnupg && rm -rf /var/lib/apt/lists/*

# Node LTS (20.x) desde NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get update && apt-get install -y nodejs \
  && node -v && npm -v \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar deps primero (cache)
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

# IMPORTANTe: Vite debe escuchar en 0.0.0.0 dentro del contenedor
EXPOSE 5173
CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173","--strictPort"]
