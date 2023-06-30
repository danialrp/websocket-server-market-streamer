# Use an official Node.js runtime as a parent image
FROM node:alpine

# Set the working directory to /app-dir
WORKDIR /wss

# Copy the package.json and package-lock.json files to /app-dir
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to /app-dir
COPY . .

# Build project
RUN npm run build

# Open ports
EXPOSE 8080

# Start the application
#CMD ["pm2-runtime", "./dist/server.js"]
ENTRYPOINT ["tail", "-f", "/dev/null"]