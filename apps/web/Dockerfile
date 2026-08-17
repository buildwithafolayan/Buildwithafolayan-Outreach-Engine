FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=development
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
