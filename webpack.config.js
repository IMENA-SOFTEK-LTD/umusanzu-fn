module.exports = {
    // Other Webpack configuration settings...
  
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        }
      ]
    }
    // Other Webpack configuration settings...
  };
  