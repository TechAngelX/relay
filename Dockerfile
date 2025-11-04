# Use node:20-alpine image
FROM node:20-alpine

# ========= Set working directory =========
WORKDIR /app

# ========= Copy dependency manifests =========
COPY package*.json ./
COPY server/package*.json ./server/

# ========= Install dependencies =========
RUN npm install
RUN apk add --no-cache git

# ========= Copy source code =========
COPY src ./src
COPY server ./server
COPY ssl ./ssl
COPY server-https.js ./server-https.js

# ========= Build frontend =========
RUN npm run build || echo "frontend build skipped"

# ========= Expose ports =========
EXPOSE 3000
EXPOSE 3001

# ========= Default working directory =========
WORKDIR /app

# ========= Install concurrently for running multiple processes =========
RUN npm install concurrently

# ========= Default command (HTTPS Dev) =========
CMD ["npm", "run", "dev-all"]
