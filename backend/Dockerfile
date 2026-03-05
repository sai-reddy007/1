FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev
COPY --from=base /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=base /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 4000
CMD ["./docker-entrypoint.sh"]
