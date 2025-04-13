# server/Dockerfile

# --- Base Stage ---
# Sets up the monorepo structure and installs all dependencies
FROM node:20 as base

WORKDIR /app

# Copy root dependency manifests and base TS config first
COPY package.json package-lock.json ./
COPY tsconfig.base.json ./

# Copy only server and shared-types workspace manifests and TS configs
COPY server/package.json ./server/
COPY shared-types/package.json ./shared-types/
COPY server/tsconfig.json ./server/
COPY shared-types/tsconfig.json ./shared-types/

# Install ONLY the server workspace dependencies
# This avoids installing canvas from the client workspace
WORKDIR /app
RUN npm install --workspace=server --workspace=shared-types

# Copy ONLY the server and shared-types source code
COPY server/ ./server/
COPY shared-types/ ./shared-types/

# Debug: List server source files
RUN echo "=== Server source files ===" && ls -la server/src/

# --- Builder Stage ---
# Builds the specific application (server in this case)
FROM base as builder

# Set the working directory to the package we want to build
WORKDIR /app/server

# Run the build script defined in server/package.json
# TypeScript can now resolve imports from 'shared-types' via path aliases
RUN npm run build

# --- Production Stage ---
# Creates the final lean image with only production artifacts
FROM node:20 as production

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary package manifests from the 'base' stage for installing prod dependencies
COPY --from=base /app/package.json /app/package-lock.json ./
COPY --from=base /app/server/package.json ./server/

# Install production dependencies ONLY for the server workspace
WORKDIR /app/server
RUN npm install --omit=dev

# Copy the built application code from the 'builder' stage
WORKDIR /app
COPY --from=builder /app/server/build ./build/

# Debug: List copied build artifacts in detail
RUN echo "=== Production build files ===" && ls -la build/server/src && \
    echo "=== Worker directory ===" && ls -la build/server/src/worker/ 


# Default command is overridden in docker-compose.yml, but good to have a sensible default
CMD [ "node", "build/server.js" ]