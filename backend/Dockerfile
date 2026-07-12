# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Generate the Prisma Client
RUN npx prisma generate

# Expose the backend port
EXPOSE 5001

# Run database push to ensure SQLite is setup, then start the server
CMD npx prisma db push && node server.js