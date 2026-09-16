FROM node:20-alpine

WORKDIR /app

# Install pnpm and typescript
RUN npm install -g pnpm@8.15.1 tsx typescript

# Copy server package files (we are inside apps/server/ context)
COPY package.json ./
COPY tsconfig.json ./
COPY src/ ./src/

# Install dependencies directly (no workspace protocol)
RUN node -e "
const pkg = require('./package.json');
const deps = {...(pkg.dependencies||{}), ...(pkg.devDependencies||{})};
const cleaned = {};
for (const [k,v] of Object.entries(deps)) {
  cleaned[k] = v.replace('workspace:*', '*');
}
pkg.dependencies = cleaned;
delete pkg.devDependencies;
require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"
RUN npm install --legacy-peer-deps

# Build TypeScript
RUN npx tsc

EXPOSE 5000

CMD ["node", "dist/server.js"]
