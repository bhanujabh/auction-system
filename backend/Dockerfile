# Backend Dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose backend port
EXPOSE 5001

# Start backend
CMD ["npm", "start"]
