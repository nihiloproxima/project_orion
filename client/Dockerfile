# client/Dockerfile

# --- Base Stage ---
# Sets up the monorepo structure and installs all dependencies
FROM node:20 as base

WORKDIR /app

# Install system dependencies for canvas
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy root dependency manifests and base TS config first
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./

# Copy environment files from root and client directory
COPY .env* ./
COPY client/.env* ./client/

# Copy workspace manifests and TS configs (if they exist)
COPY client/package.json ./client/
COPY shared-types/package.json ./shared-types/
# Copy tsconfig files if they exist and differ from the base
COPY client/tsconfig.json ./client/
COPY shared-types/tsconfig.json ./shared-types/

# Install ALL dependencies for the monorepo using npm workspaces
# This links packages (client, server, shared-types) in node_modules
RUN npm install

# Copy ALL source code into the image
COPY client/ ./client/
COPY shared-types/ ./shared-types/

# --- Builder Stage ---
# Builds the Next.js client application
FROM base as builder

# Set the working directory to the client package
WORKDIR /app/client

# Run the Next.js build script defined in client/package.json
# TypeScript path aliases for 'shared-types' should resolve correctly
RUN npm run build

# --- Production Stage ---
# Creates the final image to run the Next.js app
FROM node:20 as production

WORKDIR /app

ENV NODE_ENV=production

# Install runtime dependencies for canvas
# Added pkg-config which is needed for native build during npm install
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango1.0-dev \ 
    libjpeg62-turbo \
    librsvg2-2 \
    pkg-config \
    build-essential \
    libcairo2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy necessary package manifests and environment files from the 'base' stage
COPY --from=base /app/ ./

# Copy environment files explicitly (in case they're overwritten)
COPY --from=base /app/.env* ./
COPY --from=base /app/client/.env* ./client/

# Install production dependencies ONLY for the client workspace
WORKDIR /app/client
RUN npm install --omit=dev

# Copy the built Next.js application (.next folder, public folder, next.config.js)
# from the 'builder' stage to the final image
WORKDIR /app

# Expose the port Next.js runs on (default 3000)
EXPOSE 3000

# Set the default command to run the Next.js production server
WORKDIR /app/client
CMD ["npm", "run", "start"]