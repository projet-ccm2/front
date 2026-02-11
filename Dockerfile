FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

RUN apk add --no-cache bash

COPY . .
RUN npm run build
COPY env.sh .
RUN chmod +x env.sh

EXPOSE 4173

CMD ["/bin/bash", "-c", "./env.sh && npm run preview -- --host 0.0.0.0"]

