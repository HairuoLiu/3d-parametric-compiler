FROM node:18

# 安装 OpenSCAD
RUN apt-get update && apt-get install -y openscad

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]