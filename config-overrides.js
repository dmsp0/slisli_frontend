const webpack = require("webpack");

module.exports = function override(config, env) {
  if (!config.plugins) {
    config.plugins = [];
  }

  config.plugins.push(
    new webpack.ProvidePlugin({ adapter: ["webrtc-adapter", "default"] })
  );

  if (!config.module.rules) {
    config.module.rules = [];
  }

  config.module.rules.push({
    test: require.resolve("janus-gateway"),
    loader: "exports-loader",
    options: {
      exports: "Janus",
    },
  });

  return config;
};
