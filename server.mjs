import { createServer } from 'node:http';
import { loadConfig, assertProductionConfig } from './src/config.mjs';
import { createHandler } from './src/app.mjs';

const config = loadConfig(process.env);
assertProductionConfig(config);

const server = createServer(createHandler(config));

server.listen(config.port, config.host, () => {
  const mode = config.stubMode ? 'stub' : 'live';
  console.log(
    `Bazodiac Fusion Preview listening on http://${config.host}:${config.port} (${mode} mode)`,
  );
});
