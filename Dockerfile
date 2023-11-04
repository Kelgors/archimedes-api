FROM node:20-slim as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-slim as runner
LABEL maintainer="kelgors@pm.me"
ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80
WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist/src /app/dist
HEALTHCHECK CMD node /app/dist/healthcheck.js
CMD ["node", "/app/dist/index.js"]
