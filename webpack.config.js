const path = require('path');

module.exports = {
  entry: './src/app.ts', // what is the entry file
  output: {
    filename: 'bundle.js', // what is the name you want to give to the output file
    path: path.resolve(__dirname, 'dist'), // what is the ABSOLUTE path of your output file
  },
};
