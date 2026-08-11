# ── Build Stage ──────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copy package configuration
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy client source code
COPY . .

# Build the production bundle
RUN npm run build

# ── Production Stage ─────────────────────────────────────
FROM nginx:1.25-alpine

# Copy built static assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx custom configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP and HTTPS ports
EXPOSE 8001 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
