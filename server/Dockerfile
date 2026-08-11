FROM node:20-alpine

WORKDIR /usr/src/app

# Install build tools for native addons (like bcrypt)
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    gcc

# Copy package manifest
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Remove compilation tools to keep image slim
RUN apk del .build-deps

# Copy server code
COPY . .

# Set production environment
ENV NODE_ENV=production
ENV SERVER_PORT=3000

# Run as the built-in non-root node user
USER node

# Expose the API port
EXPOSE 3000

# Start Express server
CMD ["node", "index.js"]
