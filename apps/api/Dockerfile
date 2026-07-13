FROM node:22-alpine AS builder
WORKDIR /app

# Copy the entire monorepo for straightforward workspace installation
COPY . .

# Install dependencies
RUN npm ci

# Build shared packages, workers, and the API
# npm run build in root runs build:shared, build:api, and build:workers
RUN npm run build

# Expose the API port
EXPOSE 4000

# Start the API
CMD ["npm", "run", "start", "-w", "apps/api"]
