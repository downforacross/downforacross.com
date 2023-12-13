# Use the official Node.js Docker image as the base image
FROM node:14

# Set the working directory in the Docker image
WORKDIR /usr/src/app

# Copy the application code into the Docker image
COPY . .

# Install the application dependencies
RUN yarn install

# Run the script to set up the database
RUN chmod +x ./server/create_fresh_dbs.sh
RUN ./server/create_fresh_dbs.sh

# Set the command to start the application
CMD [ "node", "server/server.ts" ]
