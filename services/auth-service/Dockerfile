# 1. Base image
FROM node:20-alpine

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Copy package.json and package-lock.json first
#    (better caching for Docker layers)
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy source code
COPY . .

# 6. Build TypeScript
RUN npm install typescript ts-node @types/node --save-dev
RUN npx tsc

# 7. Expose port
EXPOSE 5000

# 8. Start the server
#    In production we use the compiled JS
CMD ["node", "dist/app.js"]
