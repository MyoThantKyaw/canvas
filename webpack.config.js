var path = require("path")

module.exports = {
    mode : "development",
    entry : {
        app : "./src/app.js"
    },
    output : {
        path : path.resolve(__dirname, "dis"),
        filename : "app.bundle.js"
    },

    module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
      }
      
}