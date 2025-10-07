# ---------- Stage 1: Build React ----------
FROM node:18 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# ---------- Stage 2: Backend ----------
FROM node:18 AS backend
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend ./

COPY --from=frontend /app/frontend/build ./frontend/build

EXPOSE 4000
CMD ["node", "src/index.js"]
