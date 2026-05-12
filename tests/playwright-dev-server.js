const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../webpack.config');

const config = {
  ...webpackConfig,
  mode: 'development',
  devServer: {
    ...webpackConfig.devServer,
    client: {
      overlay: false
    }
  }
};

const compiler = webpack(config);
const server = new WebpackDevServer(config.devServer, compiler);

const shutdown = async () => {
  try {
    await server.stop();
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.start().catch((error) => {
  console.error(error);
  process.exit(1);
});
