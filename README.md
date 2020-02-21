# Cloudflare-Worker-Examples

## Ingest Only usage
Replace 'YOUR-API-KEY-HERE' with the API Key we have provided in the examples/IngestOnly/index.js file
```
    cd examples/IngestOnly
    npm i
    npm run build
```

## Mitigation and Ingest usage
Replace 'YOUR-API-KEY-HERE' with the API Key we have provided in the examples/MitigationAndIngest/index.js file
Replace 'YOUR-SECRET-KEY-HERE' with the secret Key we have provided in the examples/MitigationAndIngest/index.js file
```
    cd examples/MitigationAndIngest
    npm i
    npm run test
    npm run build
```

## **Ensure the `npm run test` tests pass before continuing.**


Build output is pushed to the ./dist folder. Paste this in your cloudflare worker and click update preview to test within the sandbox.

