FROM node:20
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN rm -rf dist
RUN node -e "require('./node_modules/@prisma/client/generator-build/index.js')" 2>/dev/null || node node_modules/@prisma/internals/dist/cli/getCliQueryEngineBinaryType.js 2>/dev/null || npm run postinstall 2>/dev/null || true
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/src/main"]
