# SE1 Iterative Development App - UWF Eats

This code is designed as a foundation for you to use in your iterative development process.

## Installing

To install the dependencies needed to run this app, run:

```
npm install -g jest
npm install
npm link jest
```

## Developing

To watch server-side code and automatically restart express when code is changed, run:
```
nodemon server.js
```

## Tests

To test the server-side code, run this command:
```
npm run test
```
This will run the code using the Jest test runner.

## Environment file

You will need to add an environment file to the root of your app. This will contain secret values that we don't want to put in git. You should use the following format, taking care not to have any spaces between the keys, equal sign, or values. You can change the JWT_SECRET value to your own, randomly generated value of 32 characters.

```
JWT_SECRET="asdf"
JWT_EXPIRES_IN="1d"
```

## Postman Collection

There is a json file located in the `postman` directory containing a collection of requests you can use to test the API. You can start with this collection and add to it over time. It will be very useful for testing in the absence of a UI.

## Database

Ensure that you have prisma installed globally by running

```
npm install -g prisma
```

To create the database files, you need to run a migration. You can enter this command:
```
npx prisma migrate dev --name init
```

To seed the initial data using the provided seed file, run this command:
```
node prisma/seed.js
```

To reset the database:
```
npx prisma migrate reset
```
This command will reset the database and erase all previous data.