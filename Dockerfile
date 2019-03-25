FROM node:8
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "bin/redis-queue-worker.js" ]
