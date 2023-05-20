# Use an official Node.js runtime as a parent image
FROM node:alpine

# Set the working directory to /app-dir
WORKDIR /wss

# Copy the package.json and package-lock.json files to /app-dir
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN NODE_ENV=development npm i
RUN npm i -g typescript@4.5.4
RUN npm i -g pm2@5.1.2

# Copy the rest of the application code to /app-dir
COPY . .

# Build project
RUN npm run build

# Open ports
EXPOSE 8080

# Start the application
CMD ["pm2-runtime", "./dist/server.js"]