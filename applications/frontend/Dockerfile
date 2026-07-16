# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# TODO: Install production dependencies
RUN npm ci
COPY . .
# TODO: Implement build logic
# RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# TODO: Add non-privileged execution security controls
# RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
# USER nextjs

COPY --from=builder /app ./

EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
