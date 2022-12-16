FROM node:19-alpine

USER node
WORKDIR /app

COPY --chown=node:node package.json package-lock.json ./

RUN npm clean-install

COPY --chown=node:node . ./

RUN npm run build

CMD [ "npm", "run", "serve" ]