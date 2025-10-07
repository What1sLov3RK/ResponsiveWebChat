# --- Backend ---
FROM node:18 AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./src
WORKDIR /app/backend/src
CMD ["node", "src/index.js"]

# --- Frontend ---
FROM node:18 AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# --- Final image ---
FROM node:18
WORKDIR /app
COPY --from=backend /app/backend /app/backend
COPY --from=frontend /app/frontend/build /app/frontend/build

WORKDIR /app/backend/src
ENV PORT=4000
EXPOSE 4000

CMD ["node", "src/index.js"]

