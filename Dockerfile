FROM node:16.14.0-alpine

ENV NODE_ENV "production"

COPY . /app

WORKDIR /app

RUN npm install --production
RUN npm run build 

CMD npm start

EXPOSE 4000
