FROM node:20 as builder

WORKDIR /app

# Build shared-types first
COPY shared-types ./shared-types/
WORKDIR /app/shared-types
RUN npm install
RUN npm run build

# Build main application
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:20
WORKDIR /app
COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]