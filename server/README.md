# Optional backend sketch

The Media Basket Mini MVP is fully client-side. When you are ready to connect a
real backend, start with `server/index.ts`. It lazily imports Express, CORS and
node-postgres so the dependencies are only required when you actually want to
run the server.

```bash
npm install express cors pg
node --loader ts-node/esm server/index.ts
```

Replace the mock mission/share handlers with your own logic. The Express app is
returned from `createMediaBasketServer` so you can embed it in an existing
infrastructure or extend it with authentication and bot webhook endpoints.
