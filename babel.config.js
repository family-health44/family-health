module.exports = function (api) {
  api.cache(true);
  const isProd = process.env.NODE_ENV === 'production' || process.env.EAS_BUILD === 'true';
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
        },
      ],
    ],
    plugins: [
      // Strip console.log/debug/info in production EAS builds.
      // console.warn and console.error are kept so crash reporters still work.
      ...(isProd
        ? [['transform-remove-console', { exclude: ['warn', 'error'] }]]
        : []),
    ],
  };
};
