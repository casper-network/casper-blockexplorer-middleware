# Blockexplorer Middleware

Here is the [frontend repo](https://github.com/casper-network/casper-blockexplorer-frontend) for the blockexplorer app.

### Setup

Docker and Docker Compose must be set and running before the following steps:

1. Create an `.env` file in /app.

Example:

```
PORT=4000
NODE_URLS=https://rpc.mainnet.casperlabs.io/rpc
SIDECAR_REST_URL=<optional>
SIDECAR_EVENTSTREAM_URL=<optional>
```

2. Run `make prod-build` or `make dev-build` if you are using the app for development purposes (HMR and debug modes will be enabled).
3. Run `make prod-start` if you are using the app for production (optimized builds) or `make dev-start` for development.
4. The middleware will be running at port `4000` or different if `PORT` was set in `.env`.

## Testing

We use mocha for unit test and e2e test.

- Unit test files are named like \*.spec.ts.

  To run unit test

  ```bash
  npm run test:unit
  ```

- E2E test files that require 3rd party are named like \*.test.ts.

  To run e2e test

  ```bash
  npm run test:e2e
  ```

## Swagger Docs

Start development server and access `http://localhost:<PORT>/docs`.
