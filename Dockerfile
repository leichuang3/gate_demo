FROM node:16-alpine
RUN rm -rf /next
WORKDIR /next

COPY . /next
RUN npm config set registry http://registry.npm.taobao.org/ && npm install && npm run build

EXPOSE 7500
CMD [ "npm", "start"]