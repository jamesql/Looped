# Use a lightweight base image
FROM node:19

# Set the working directory
WORKDIR /Util

# Copy all files from the current directory to the working directory in the container
COPY . /Util

# Install dependencies for building the app
RUN npm run build