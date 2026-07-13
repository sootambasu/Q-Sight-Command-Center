FROM node:22-alpine AS builder
WORKDIR /app

# Copy the entire monorepo for straightforward workspace installation
COPY . .

# Install dependencies
RUN npm ci

# Build shared packages and the Web app
RUN npm run build:shared
RUN npm run build:web

# Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose the web port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
