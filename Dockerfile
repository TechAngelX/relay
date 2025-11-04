FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency manifests for frontend + backend
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies for frontend
RUN npm install

# Install git (required by next.config.ts)
RUN apk add --no-cache git

# Install backend dependencies
WORKDIR /app/server
RUN npm install

# Go back to root
WORKDIR /app

# Copy full project
COPY . .

# Build both (ignore errors if frontend already built)
RUN npm run build || echo "frontend build skipped"
WORKDIR /app/server
RUN npm run build || echo "backend build skipped"

# Install concurrently to run both together
WORKDIR /app
RUN npm install -g concurrently

# Expose ports: 3000 (backend) + 3001 (frontend)
EXPOSE 3000 3001

# Start both servers
CMD ["concurrently", "node server/dist/server.js", "npm run dev"]

