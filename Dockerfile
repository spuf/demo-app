FROM node:10-alpine
WORKDIR /app
COPY . .

ENV PORT=4000 \
    DATADIR=/data

VOLUME /data
EXPOSE 4000
ENTRYPOINT ["node", "/app/main.js"]
