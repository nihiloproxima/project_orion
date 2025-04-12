FROM node:20

WORKDIR /app

# Copy shared-types first
COPY shared-types ./shared-types/
WORKDIR /app/shared-types
RUN npm install
RUN npm run build

# Build main application
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Laisse CMD vide, on l'override dans docker-compose
CMD ["node", "build/server.js"]