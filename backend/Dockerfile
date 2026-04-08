FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Dev: ts-node-dev with hot reload
CMD ["npm", "run", "dev"]
