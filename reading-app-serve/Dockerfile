FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# 创建上传目录
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"]