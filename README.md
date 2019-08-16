# Zap Server
Server: https://zap-app.zanekuehn.now.sh

## Summary
This Server is for the Zap app. An inventory app that allows users to keep track of a multitude of items with a few options for each.

If you navigate to the base URL there will be a brief description about the server endpoints.

 ## API Documentation
There are two top level endpoints:

/api/inventory

Inventory supports GET, POST, PATCH and DELETE requests. For PATCH and DELETE requests you must supply the respective id in the endpoint's path.

For example:

GET /api/inventory


POST /api/inventory
PATCH /api/inventory/:itemid

DELETE /inventory/:item

## Technologies
Front-end: React, HTML, CSS, Javascript, testing with Enzyme

API: Node.js, Express, PostgreSQL, Knex, testing with Mocha

## Scripts
Start the application npm start

Start nodemon for the application npm run dev

Run the tests npm test

## Deploying
When your new project is ready for deployment, add a new Heroku application with heroku create. This will make a new git remote called "heroku" and you can then npm run deploy which will push to this remote's master b