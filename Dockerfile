FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy client package.json
COPY client/package*.json ./client/

# Install client dependencies
RUN cd client && npm install

# Copy server and client code
COPY . .

# Build client
RUN cd client && npm run build

# Expose the API port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
