# Stage 1: Build the Node.js application
FROM node:20.18.0 AS build

WORKDIR /usr/src/umusanzu_fn

# Copy dependency definitions
COPY ["package.json", "package-lock.json*", "./"]

# Install dependencies and update Browserslist database
RUN npm install && npx update-browserslist-db@latest

# Copy all application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the built assets using Nginx
FROM nginx:latest

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the dist folder from the build stage to the Nginx HTML directory
COPY --from=build /usr/src/umusanzu_fn/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
