FROM node:alpine3.18
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
CMD [ "npx", "prisma", "db", "push"]
EXPOSE 8800
CMD [ "npm", "run", "start" ]
