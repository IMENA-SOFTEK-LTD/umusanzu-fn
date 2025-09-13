# ----------------------
# Stage 1: Build
# ----------------------
FROM node:20.18.0 AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies first (cache-friendly)
COPY package*.json ./

# Use npm ci for clean install and less memory usage
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy source code
COPY . .

# Set environment variables
ARG NODE_ENV
ARG VITE_APP_API_URL

ENV NODE_ENV=$NODE_ENV
ENV VITE_APP_API_URL=$VITE_APP_API_URL

# Increase Node memory for build to avoid crashes
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# ----------------------
# Stage 2: Production image with Nginx
# ----------------------
FROM nginx:alpine AS production

# Remove default Nginx static files (optional)
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
