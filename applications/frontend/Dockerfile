FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --only=production
COPY . .
EXPOSE 3000
ENV PORT=3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 CMD node -e "require('http').get('http://localhost:3000/health', (r) => { if (r.statusCode === 200) process.exit(0); else process.exit(1); })"
CMD ["npm", "start"]