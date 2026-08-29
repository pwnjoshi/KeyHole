# Keyhole Autonomous Zero-Knowledge Gateway - Production Container
FROM node:20-slim AS builder

WORKDIR /app

# Copy all repository source files
COPY . .

# Install dependencies with Linux platform binaries
RUN npm install
RUN npm install --prefix dashboard @rollup/rollup-linux-x64-gnu

# Build both backend gateway and frontend dashboard
RUN npm run build:prod

# Production runtime stage
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Copy all node_modules and built workspace code
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/gateway ./gateway
COPY --from=builder /app/dashboard/dist ./dashboard/dist
COPY --from=builder /app/contracts ./contracts

EXPOSE 4000

CMD ["node", "gateway/dist/index.js"]
