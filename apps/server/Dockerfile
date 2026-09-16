FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.1

# Copy monorepo root files needed for workspace
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Copy packages
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Build shared package
RUN pnpm --filter @portfolio/shared build || true

# Build server
RUN pnpm --filter @portfolio/server build

EXPOSE 5000

CMD ["node", "apps/server/dist/server.js"]
