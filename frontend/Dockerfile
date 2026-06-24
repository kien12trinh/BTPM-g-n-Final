FROM node:20-alpine

WORKDIR /app

# Install deps (layer cache)
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --host 0.0.0.0 cho phép Docker expose ra ngoài container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
