FROM node:20

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

EXPOSE 8080

# Laisse CMD vide, on l’override dans docker-compose
CMD ["node", "build/server.js"]