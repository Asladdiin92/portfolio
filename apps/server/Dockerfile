FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.1

# Copy monorepo root files
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./

# Copy workspace packages
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/

# Install all workspace dependencies
RUN pnpm install --no-frozen-lockfile

# Build shared types
RUN pnpm --filter @portfolio/shared build || true

# Build server
RUN pnpm --filter @portfolio/server build

EXPOSE 5000

CMD ["node", "apps/server/dist/server.js"]
