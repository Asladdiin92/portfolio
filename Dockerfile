FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm@8.15.1

COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

RUN pnpm install --no-frozen-lockfile

RUN pnpm --filter @portfolio/shared build || true

RUN pnpm --filter @portfolio/server build

EXPOSE 5000

CMD ["node", "apps/server/dist/server.js"]
