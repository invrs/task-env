var path = require('path')

module.exports = {
  entry: path.join(__dirname, 'lib/index.js'),
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            "presets": [
              "node6"
            ],
            "plugins": [
              "transform-async-to-generator",
              "transform-object-rest-spread"
            ]
          }
        }
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs'
  },
  target: 'node',
  externals: [ 'camel-dot-prop-immutable', 'commandland', 'mri', 'structured-json' ]
}
