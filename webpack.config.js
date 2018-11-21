const path = require('path');

const HtmlWebpackPlugin = require("html-webpack-plugin");

const examplesPage = new HtmlWebpackPlugin({
    template: path.join(__dirname, "examples/index.html"),
    filename: "index.html"
});

module.exports = {
    entry: path.join(__dirname, "examples/index.js"),
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {}
                  }
                ]
              },
            {
                test: /\.(js|jsx)$/,
                use: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    plugins: [
        examplesPage
    ],
    resolve: {
        extensions: [".js", ".jsx"]
    },
    devServer: {
        port: 3001
    }
};
