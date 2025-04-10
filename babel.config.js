module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true
      }],
      '@babel/plugin-transform-optional-chaining',
      '@babel/plugin-transform-nullish-coalescing-operator',
      '@babel/plugin-transform-class-properties'
    ]
  };
}; 