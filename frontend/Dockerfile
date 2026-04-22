# Use Node.js 22 Alpine for a smaller image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for efficient caching
COPY package.json ./

# Install dependencies explicitly
RUN npm install --legacy-peer-deps && npm rebuild

# Verify Next.js installation
RUN npx next --version || echo "Next.js not found!"

# Copy the rest of the app
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3001

# Start Next.js server
CMD ["npm", "run", "start"]
