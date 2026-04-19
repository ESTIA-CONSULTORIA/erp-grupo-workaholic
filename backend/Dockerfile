FROM node:20
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY . .
RUN rm -rf dist
RUN npx prisma generate
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/src/main"]
