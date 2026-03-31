FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install && chmod -R +x node_modules/.bin
COPY . .
RUN node_modules/.bin/prisma generate
RUN node_modules/.bin/tsc -p tsconfig.json --skipLibCheck --noEmitOnError false || true
EXPOSE 4000
CMD ["node", "dist/main"]