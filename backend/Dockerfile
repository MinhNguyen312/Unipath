# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .  

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .
RUN yarn install --production
EXPOSE 8080
CMD ["node", "index.js"]