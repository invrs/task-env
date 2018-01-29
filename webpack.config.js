var path = require("path")

module.exports = {
  entry: path.join(__dirname, "lib/index.js"),
  externals: [
    "camel-dot-prop-immutable",
    "commandland",
    "graceful-fs",
    "inquirer",
    "proper-lockfile",
    "mri",
    "structured-json",
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [
              "transform-async-to-generator",
              "transform-object-rest-spread",
            ],
            presets: ["node6"],
          },
        },
      },
    ],
  },
  output: {
    filename: "index.js",
    library: "task-env",
    libraryTarget: "umd",
    path: path.join(__dirname, "dist"),
    umdNamedDefine: true,
  },
  target: "node",
}
