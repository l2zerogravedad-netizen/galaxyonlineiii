FROM node:20-alpine

WORKDIR /app

# Copy root package files for workspace
COPY package.json package-lock.json ./
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app
WORKDIR /app/apps/web
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
