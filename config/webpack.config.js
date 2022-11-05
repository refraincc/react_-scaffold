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
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

// 获取环境变量
const isProduction =  process.env.NODE_ENV === 'production';

const getStyleLoaders = (pre) => {
    return [
        isProduction ? MiniCssExtractPlugin.loader : "style-loader",
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
        pre && {
            loader: pre,
            // options: pre === 'less-loader' ? {
            //     lessLoaderOptions: {
            //         lessOptions: {
            //           modifyVars: { '@primary-color': '#1DA57A' },
            //           javascriptEnabled: true,
            //         },
            //       },
            // } : {}
        }
    ].filter(Boolean);
};


module.exports = {
    entry: './src/main.js',
    output: {
        path: isProduction ? path.resolve(__dirname, "../dist") : undefined,
        filename: isProduction ? 'static/js/[name].[contenthash:10].js' : 'static/js/[name].js',
        chunkFilename: isProduction ? 'static/js/[name].[contenthash:10].chunk.js' : 'static/js/[name].chunk.js',
        assetModuleFilename: 'static/media/[hash:10][ext][query]',
        clean: isProduction ? true : false,
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
                        // 激活HMR
                        !isProduction && require.resolve('react-refresh/babel')
                    ].filter(Boolean),
                }
            },
            {
                // 处理ts
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }

        ]
    },
    // 处理html
    plugins: [
        new EsLintWebpackPlugin({
            context: path.resolve(__dirname, '../src'),
            exclude: "node_modules",
            cache: true,
            cacheLocation: path.resolve(__dirname, '../node_modules/.cache/.eslintcache'),
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "../public/index.html"),
        }),
        isProduction && new MiniCssExtractPlugin(
            {
                filename: 'static/css/[name].[contenthash:10].css',
                chunkFilename: 'static/css/[name].[contenthash:10].chunk.css',
            }
        ),
        isProduction && new CopyPlugin({
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
        !isProduction && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),

    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
    optimization: {
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                //react react-dom react-router-dom 一起打包成一个js文件
                react: {
                    test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
                    name: "chunk-react",
                    priority: 40,
                },
                //antd 打包成一个文件
                antd: {
                    test: /[\\/]node_modules[\\/]antd[\\/]/,
                    name: "chunk-antd",
                    priority: 30,
                },
                // node_modules 打包成一个js文件
                libs: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "chunk-libs",
                    priority: 20,
                },
            }
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}.js`,
        },
        minimize: isProduction,
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
        extensions: [".tsx", ".ts",".jsx", ".js", ".json"],
    },
    devServer: {
        host: 'localhost',
        port: 3000,
        open: true,
        hot: true,
        historyApiFallback: true,
    },
    /// 打包提醒开关，
    performance: false,
}