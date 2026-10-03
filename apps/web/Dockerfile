# Imagen base de Node.js en Alpine
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Instalar dependencias necesarias
COPY package*.json ./
RUN npm ci --only=production || npm install --omit=dev

# Copiar el código fuente y artefactos construidos
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
