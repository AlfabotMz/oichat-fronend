# Stage 1: Install dependencies and build the project
FROM node:20-alpine AS builder

WORKDIR /app

# Copy pnpm-lock.yaml and package.json to leverage Docker cache
COPY package.json pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm@8

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN pnpm build

# Stage 2: Run the application
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV production

# Copy necessary files from the builder stage
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port Next.js runs on
EXPOSE 3000

# Command to run the Next.js application
CMD ["pnpm", "start"]
