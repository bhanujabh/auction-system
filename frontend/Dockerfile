# Frontend Dockerfile
FROM node:20-alpine as build

WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
