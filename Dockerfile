# Base image
FROM node:14-alpine

# Working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Serve the build files using a simple HTTP server
RUN npm install -g serve
CMD ["serve", "-s", "build"]

# Expose port
EXPOSE 3000
