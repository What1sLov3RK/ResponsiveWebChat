FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production
RUN npm rebuild bcrypt --build-from-source

COPY . .

EXPOSE 4000
CMD ["node", "src/server.js"]
