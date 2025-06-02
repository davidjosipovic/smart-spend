# Use Node.js LTS version as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 3000 for Angular dev server
EXPOSE 3000

# Add environment variable for file watching
ENV CHOKIDAR_USEPOLLING=true

# Start Angular development server with host 0.0.0.0 to allow external access
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "3000", "--disable-host-check", "--poll", "2000"]
