# Stage 1: Build
FROM node:20.18.0 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

ARG NODE_ENV
ARG VITE_APP_API_URL

ENV NODE_ENV=$NODE_ENV
ENV VITE_APP_API_URL=$VITE_APP_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

