FROM node:boron

WORKDIR /usr/app

COPY package.json .
RUN npm install

COPY . .
EXPOSE 9002
CMD [ "node", "app.js" ]