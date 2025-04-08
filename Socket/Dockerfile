# Use the official Node.js image as a base
FROM node:19

# Set the working directory in the container
WORKDIR /Socket

# Copy the package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies (both production and dev dependencies)
RUN npm install

# Install TypeScript and ts-node globally if needed
RUN npm install -g typescript ts-node

# Copy the entire source code to the container
COPY . .

# Expose the port your app will run on
EXPOSE 444

# Command to run the app using ts-node
CMD ["ts-node", "./"]
