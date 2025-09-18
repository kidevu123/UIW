FROM node:18-alpine

WORKDIR /app

# Install ffmpeg for media processing
RUN apk add --no-cache ffmpeg

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

USER node

CMD ["npm", "start"]