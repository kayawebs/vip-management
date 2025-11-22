FROM node:18-alpine AS backend

ENV NODE_ENV=production \
    PORT=5000 \
    MONGODB_URI=mongodb://mongo:27017/vip-management

WORKDIR /app/backend

# Install dependencies first for better layer caching
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY backend ./

EXPOSE 5000

CMD ["node", "src/index.js"]
