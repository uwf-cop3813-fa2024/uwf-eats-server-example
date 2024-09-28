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

Developers should run two separate commands to watch server code for changes.

To watch server-side code and automatically restart express when code is changed, run:
```
nodemon server.js
```

In a separate terminal, navigate to the uwf-eats-client and then run the dev command automatically build and serve React app code:
```
cd uwf-eats-client && npm run dev
```

## Tests

To test the server-side code, run this command:
```
npm run test
```
This will run the code using the Jest test runner.

## Database

Ensure that you have prisma installed globally by running

```npm install -g prisma'```

To create the database files, you need to run a migration. You can enter this command:
```
npx prisma migrate dev --name init
```

To seed the initial data using the provided seed file, run this command:
```
npx prisma seed
```

To reset the database:
```
npx prisma migrate reset
```
This command will reset the database and erase all previous data.