FROM node:20

WORKDIR /usr/src/app/frontend
COPY . .

CMD yarn && yarn ng serve --host 0.0.0.0 --disable-host-check --proxy-config ../proxy.conf.docker.json
