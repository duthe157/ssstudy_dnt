# FROM 516546176233.dkr.ecr.ap-southeast-1.amazonaws.com/coreimg:node-v1016-20200611
# USER node
# WORKDIR /home/node/
# COPY package.json package-lock.json* ./
# COPY . .
# RUN npm install && npm cache clean --force
# EXPOSE 4548
# CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "production" ]

FROM node:16.20.2-alpine

RUN apk add --no-cache wget tar gzip

RUN wget https://github.com/jgm/pandoc/releases/download/3.8.2/pandoc-3.8.2-linux-amd64.tar.gz \
    && tar -xzf pandoc-3.8.2-linux-amd64.tar.gz --strip-components 1 -C /usr/local \
    && rm pandoc-3.8.2-linux-amd64.tar.gz

WORKDIR /home/node/

COPY package.json package-lock.json* ./
RUN npm install --unsafe-perm
RUN npm cache clean --force
RUN npm install -g pm2

COPY . .

EXPOSE 3013
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]

