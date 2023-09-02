FROM node

COPY . /project
WORKDIR /project

RUN npm install

EXPOSE 3000

CMD npm start
