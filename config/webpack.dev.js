const path = require("path");
const EsLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');


const getStyleLoaders = (pre) => {
    return [
        "style-loader",
        "css-loader",
        {
            // 处理css兼容性问题
            // 配合package.json中的browserslist来指定兼容性
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: ["postcss-preset-env"],
                }
            }
        },
        pre,
    ].filter(Boolean);
};


module.exports = {
    entry: './src/main.js',
    output: {
        path: undefined,
        filename: 'static/js/[name].chunk.js',
        chunkFilename: 'static/js/[name].chunk.js',
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
    },
    module: {
        rules: [
            // 处理css
            {
                test: /\.css$/,
                use: getStyleLoaders(),
            },
            // 处理less
            {
                test: /\.less$/,
                use: getStyleLoaders("less-loader"),
            },
            // 处理sass
            {
                test: /\.s[ac]ss$/,
                use: getStyleLoaders("sass-loader"),
            },
            // 处理style
            {
                test: /\.styl$/,
                use: getStyleLoaders("stylus-loader"),
            },
            {
                test: /\.(jpe?g|png|gift|webp|svg)$/,
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        // 小于10kb的图片会转换成base64，
                        maxSize: 10 * 1024,
                    }
                }
            },
            {
                // 处理字体
                test: /\.(wodd2?|ttf)$/,
                type: "asset/resource",
            },
            {
                // 处理js
                test: /\.jsx?$/,
                include: path.resolve(__dirname, "../src"),
                loader: "babel-loader",
                options: {
                    cacheDirectory: true,
                    cacheCompression: false,
                    plugins: [
                        require.resolve('react-refresh/babel')
                    ]
                }
            }

        ]
    },
    // 处理html
    plugins: [
        new EsLintWebpackPlugin({
            context: path.resolve(__dirname, '../src'),
            exclude: "node_modules",
            cache: true,
            cacheLocation: path.resolve(__dirname, '../mode_modules/.cache/.eslintcache'),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../public/index.html"),
        }),
        new ReactRefreshWebpackPlugin(),
    ],

    mode: 'development',
    devtool: 'cheap-module-source-map',
    optimization: {
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}.js`,
        }
    },
    resolve: {
        extensions: [".jsx", ".js", ".json"],
    },
    devServer: {
        host: 'localhost',
        port: 3000,
        open: true,
        hot: true,
        historyApiFallback: true,
    }
}