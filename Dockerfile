# Base image
FROM node:16.18.1-alpine

# Create app directory
WORKDIR /usr/src/app

# Expose port
EXPOSE 5000:5000

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Migrate database via prisma
RUN npx prisma migrate deploy 

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Start the server using the production build
CMD [ "node", "dist/main.js" ]