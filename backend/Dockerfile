# Express API
FROM node:20-alpine

WORKDIR /app

# Install only production deps using the lockfile for reproducible builds
COPY package*.json ./
RUN npm ci --omit=dev

# App source
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
