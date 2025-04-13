
FROM node:20 as builder

WORKDIR /app

# Install canvas dependencies for production
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY . .
RUN npm install
RUN npm run build

FROM node:20
WORKDIR /app
COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]