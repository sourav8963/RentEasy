# Stage 1: Build the Express application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files and build configuration
COPY . .

# Build the project (compiles TypeScript to JavaScript in the dist folder)
RUN npm run build

# Stage 2: Run the compiled application in production
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production-only dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled files from Stage 1 build
COPY --from=build /app/dist ./dist

# Copy local data files and uploads folder (supporting JSON DB fallback & files)
COPY --from=build /app/data ./data

EXPOSE 5005

ENV NODE_ENV=production
ENV PORT=5005

CMD ["node", "dist/server.js"]
