
# ========= Base image =========
FROM node:20-alpine

# ========= Set working directory =========
WORKDIR /app

# ========= Copy dependency manifests =========
COPY package*.json ./
COPY server/package*.json ./server/

# ========= Install dependencies =========
RUN npm install

# ✅ Install git so commit hashes can be read during build
RUN apk add --no-cache git

# ========= Install backend dependencies =========
WORKDIR /app/server
RUN npm install

# ========= Return to root =========
WORKDIR /app

# ========= Copy entire project =========
COPY . .

# ========= Build frontend + backend =========
RUN npm run build || echo "frontend build skipped"
WORKDIR /app/server
RUN npm run build || echo "backend build skipped"

# ========= Install concurrently globally =========
WORKDIR /app
RUN npm install -g concurrently

# 🛑 FIX: Override NEXT_PUBLIC_SOCKET_URL to point to the local backend service.
#         This resolves the 'timeout' by preventing the connection from leaving the container.
ENV NEXT_PUBLIC_SOCKET_URL=https://localhost:3000

# ========= Expose ports =========
EXPOSE 3000 3001

# ========= Start both frontend + backend =========
# - Backend: runs /server/dist/server.js
# - Frontend: runs Next.js HTTPS dev server
CMD ["concurrently", "node server/dist/server.js", "npm run dev-https"]
