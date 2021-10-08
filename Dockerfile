FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g ts-node
RUN npm install ffmpeg-static --save
COPY . .
CMD ["ts-node", "./src/main.ts"]