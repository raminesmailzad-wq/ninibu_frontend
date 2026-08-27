const base = require('./app.json').expo;

module.exports = () => {
  const apiKey = process.env.EXPO_GOOGLE_MAPS_API_KEY || '';
  return {
    ...base,
    ios: {
      ...base.ios,
      config: {
        ...(base.ios?.config || {}),
        ...(apiKey ? { googleMapsApiKey: apiKey } : {})
      }
    },
    android: {
      ...base.android,
      ...(apiKey ? { config: { ...(base.android?.config || {}), googleMaps: { apiKey } } } : {})
    }
  };
};
