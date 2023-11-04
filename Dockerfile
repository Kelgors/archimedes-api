FROM node:20 as builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm ci --omit=dev

FROM node:20 as runner
LABEL maintainer="kelgors@pm.me"
ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80
WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist/src /app/dist
HEALTHCHECK CMD curl -sf http://127.0.0.1 > /dev/null && exit 0 || exit 1
CMD ["node", "/app/dist/index.js"]
