# Use the official Node.js Docker image as the base image
FROM node:18

# Set the working directory in the Docker image
WORKDIR /usr/src/app

# Copy the application code into the Docker image
COPY . .

# Install the application dependencies and run the test suite
RUN yarn install && yarn test

# Run the script to set up the database
# Placeholder command for database setup
# TODO: Replace with actual database setup script
RUN yarn run setup-db


# Set the command to start the application
CMD [ "yarn", "start" ]
