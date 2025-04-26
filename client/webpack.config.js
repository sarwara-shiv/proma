const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // Resolves '@' to the 'src' directory
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],  // Include TypeScript extensions
  },
  // Other Webpack configuration...
};
