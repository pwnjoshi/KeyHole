# Keyhole Autonomous Zero-Knowledge Gateway - Production Container
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all repository source files
COPY . .

# Install dependencies across all workspaces
RUN npm install

# Build both backend gateway and frontend dashboard
RUN npm run build:prod

# Production runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Copy build artifacts and dependencies from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/gateway/dist ./gateway/dist
COPY --from=builder /app/gateway/package*.json ./gateway/
COPY --from=builder /app/dashboard/dist ./dashboard/dist

EXPOSE 4000

CMD ["node", "gateway/dist/index.js"]
