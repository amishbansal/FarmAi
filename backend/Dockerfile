# Use Bun official image
FROM oven/bun:latest

# Set working directory inside the container
WORKDIR /app

# Copy all backend code into the container
COPY . .

# Install dependencies
RUN bun install

# Expose the backend port (change if necessary)
EXPOSE 3000

# Start the backend service
CMD ["bun", "run", "dev"]
