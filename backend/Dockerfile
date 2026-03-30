FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx tsc -p tsconfig.json --skipLibCheck --noEmitOnError false || true
EXPOSE 4000
CMD ["node", "dist/main"]