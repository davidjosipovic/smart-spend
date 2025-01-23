# Use the official Node.js image as the base image
FROM node:lts

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./ 

# Install the dependencies
RUN npm install --force

# Copy the rest of the application files
COPY . .

# Build the React app for production
RUN npm run build

# Install `serve` to run the application.
RUN npm install -g serve

# Uses port which is used by the actual application
EXPOSE 3000

# Run application
CMD [ "npm", "start" ]
#CMD serve -s build