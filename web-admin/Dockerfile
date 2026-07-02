FROM node:16-alpine

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash

COPY package*.json ./

RUN rm -f package-lock.json

RUN npm install --legacy-peer-deps --no-package-lock

RUN chmod +x node_modules/.bin/react-scripts

COPY . .

ENV PORT=3012
ENV HOST=0.0.0.0

EXPOSE 3012

CMD ["npm", "start"]
