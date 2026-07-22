# Base Image
FROM node:22-alpine

# Working Directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Application listens on port 5000
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
