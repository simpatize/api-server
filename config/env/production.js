var googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY || require('../secrets').googlePlacesApiKey;

console.log(googlePlacesApiKey);
module.exports = {
  db: {
    mongodb: 'mongodb://localhost:27017/simpatize-prod',
  },
  googlePlacesApiKey: googlePlacesApiKey
};
