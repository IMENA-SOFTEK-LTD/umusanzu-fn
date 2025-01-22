# Create image based on the official Node 6 image from the dockerhub
FROM node:20.18.0

# Create a directory where our app will be placed
RUN mkdir -p /usr/src/umusanzu_fn

# Change directory so that our commands run inside this new directory
WORKDIR /usr/src/umusanzu_fn

# Copy dependency definitions
COPY ["package.json","package-lock.json*", "/usr/src/umusanzu_fn/"]

# Install dependecies
RUN npm install

# Get all the code needed to run the app
COPY . /usr/src/umusanzu_fn

RUN npm run build


# Use Nginx as the base image
FROM nginx:latest

# Copy the dist folder to the Nginx HTML directory
COPY dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]