const path = require("path");
const EsLintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
const TerserWebpackPlugin = require(
    'terser-webpack-plugin'
)
const ImageMinimizerPlugin = require(
    'image-minimizer-webpack-plugin'
)
const CopyPlugin = require("copy-webpack-plugin");

const getStyleLoaders = (pre) => {
    return [
        MiniCssExtractPlugin.loader,
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
        path: path.resolve(__dirname, "../dist"),
        filename: 'static/js/[name].[contenthash:10].chunk.js',
        chunkFilename: 'static/js/[name].[contenthash:10].chunk.js',
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
        clean: true,
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
        new MiniCssExtractPlugin(
            {
                filename: 'static/css/[name].[contenthash:10].css',
                chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
            }
        ),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, '../public'),
                    to: path.resolve(__dirname, '../dist'),
                    globOptions: {
                        // 忽略index.html的copy操作
                        ignore: ["**/index.html"],
                      },
                },
            ],
          }),
    ],

    mode: 'production',
    devtool: 'source-map',
    optimization: {
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}.js`,
        },
        minimizer: [
            new CssMinimizerWebpackPlugin(),
            new TerserWebpackPlugin(),
            new ImageMinimizerPlugin({
                minimizer: {
                  implementation: ImageMinimizerPlugin.imageminGenerate,
                  options: {
                    plugins: [
                      ["gifsicle", { interlaced: true }],
                      ["jpegtran", { progressive: true }],
                      ["optipng", { optimizationLevel: 5 }],
                      [
                        "svgo",
                        {
                          plugins: [
                            "preset-default",
                            "prefixIds",
                            {
                              name: "sortAttrs",
                              params: {
                                xmlnsOrder: "alphabetical",
                              },
                            },
                          ],
                        },
                      ],
                    ],
                  },
                },
              }),
        ]
    },
    resolve: {
        extensions: [".jsx", ".js", ".json"],
    }
}