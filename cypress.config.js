const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://qa.bigheartapp.org/',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
