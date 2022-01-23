# Synesthesia-Test - README

## Development

To run the development environment use the npm script:

```shell
npm run dev
```

This command will use docker-compose to setup a mongo database and run the application on port `4000`. The environment variables used are found in the `.env.compose` file. Any changes to the codebase will restart the application through `nodemon`.

**NOTE**: If for any reason you want to run the application _directly_ on your machine you will need a mongo database listening on port `27017`.
For example you can run a mongo instance trough a docker container:

```shell
docker run -p 27017:27017 mongo:latest
```

Then you need to use the following npm script:

```shell
npm run dev:ts-node:local
```

The environment variables used are found in the `.env.local` file.
By using this command all changes to the codebase won't be reflected on the application unless you restart it manually.

## Docker image

To create a docker image of the application use the following command:

```shell
docker build -t syn-test:latest .
```

It uses `rollup.js` to bundle the application and make it easier to dockerize.

## Build

To create the `rollup.js` bundle use the following npm script:

```shell
npm run build
```

## Test

To run tests you will need a mongo database listening on port `27018`.

```shell
docker run -p 27018:27017 mongo:latest
```

Then you need to use the following npm script:

```shell
npm test
```

The environment variables used by the test suite are found in the `.env.test` file.

## Postman collection

You can import the postman collection from the `postman.json` file.
**NOTE**: since the application uses JWT authentication you have to first create an user with the `User/Signup` request and then generate a token with the `User/Signin` request. If, for some reason, postman doesn't persist the token correctly, you'll have to input it by hand in the authorization tab for each request.
