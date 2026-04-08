FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Dev: Vite with hot reload, host 0.0.0.0 so Docker port mapping works
CMD ["npx", "vite", "--host", "0.0.0.0"]
