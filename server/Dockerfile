FROM node:20

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# Laisse CMD vide, on l’override dans docker-compose
CMD ["node", "build/server.js"]