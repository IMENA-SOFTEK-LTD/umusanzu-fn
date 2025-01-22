# Stage 1: Build the Node.js application
FROM node:20.18.0 AS build

# Create a directory where the app will be placed
WORKDIR /usr/src/umusanzu_fn

# Copy dependency definitions
COPY ["package.json", "package-lock.json*", "/usr/src/umusanzu_fn/"]

# Install dependencies
RUN npm install

# Copy all application code
COPY . /usr/src/umusanzu_fn

WORKDIR /usr/src/umusanzu_fn

# Build the application (assuming you have a build script)
RUN npm run build

# Stage 2: Serve the built assets using Nginx
FROM nginx:latest

# Copy the dist folder from the build stage to the Nginx HTML directory
COPY --from=build /usr/src/umusanzu_fn/dist /usr/share/nginx/html

# Expose port 80 for the application
EXPOSE 80

# Start Nginx (it will serve the application)
CMD ["nginx", "-g", "daemon off;"]
