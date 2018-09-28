const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

const devMode = process.env.NODE_ENV !== 'production'

module.exports = {
  entry: {
    //polyfill:'babel-polyfill',  //如果要使用es7\es8这种，需要有这个
    tools:'./src/js/tool/tweenFun.js',
    libs: [
      './src/js/lib/sound.js',
      './src/js/lib/webfontloader.js',
    ],
    main: './src/js/index.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode:"development",

  //这个部分可以不写，默认就是这个 
  devServer: {
    port: 9000,
    host: '0.0.0.0',

    //回到整个项目的根目录下，默认访问的是我的项目首页（不管是不是以index.html命名）
    //这样子设置方便访问demo文件夹中的参考demo
    contentBase: path.resolve(__dirname, '../'), 

    hot:true,
  },

  //有了这个，如果页面中有js错误，可以有定位。不能用，速度太慢
  //devtool: 'inline-source-map', 
  
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({
      title: '新交大群侠传',
      template: './src/game.html'
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].bundle.css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].bundle.css' : '[id].[hash].css',
    }),
    //拷贝
    new CopyWebpackPlugin([
      { from: 'src/img/*',   to: 'img', flatten:true},
      { from: 'src/fonts/*', to: 'fonts', flatten:true},
      { from: 'src/sounds/*', to: 'sounds', flatten:true},
    ], {}),

    //HMR
    new webpack.HotModuleReplacementPlugin({})
  ]
  
  //分开打包
  ,optimization: {
    splitChunks: {
      cacheGroups: {

        //我对这部分的配置还没有掌握完全
        //下面这个注释打开，似乎会影响对tools、libs的打包，我先不研究了。

        //对自己的写的工具打包
        // tools: {
        //   name: 'tools',
        //   chunks: 'initial',
        //   minChunks: 2
        // },
        // //对别人的公用库的打包
        // libs: {
        //   name: 'libs',
        //   chunks: 'initial',
        //   minChunks: 2
        // },

        //对所有的node_modules中的模块打包
        //这样子做，可能会打包出一个非常大的包，推荐只打包核心的，必要的文件
        //其他的可以动态加载（按需加载）
        // commons: {
        //   test: /[\\/]node_modules[\\/]/,
        //   name: 'vendors',
        //   chunks: 'all'
        // }

        //对特定的node_modules中的模块打包
        vendor: {
          //test: /[\\/]node_modules[\\/](pixi.js|lodash)[\\/]/,
          test: /[\\/]node_modules[\\/](pixi.js|pixi-sound)[\\/]/, //如果这里匹配不到的依赖，就会被打包到main.bundle中
          name: 'vendor',
          chunks: 'all',
        }

      }
    }
  }

  
  ,module: {
    rules: [
      //{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            //这里相当于之前的.babelrc 文件的配置，放到这里也行
            presets: ['@babel/preset-env'],
            //plugins: ["syntax-async-functions"] //使用这个es8的，不仅要有该插件，还需要有 babel-polyfill.
          }
        }
      },
      


      {
        test: /\.(le|c)ss$/,
        use: [
          //根据环境选择，前者会打包到js，后者是单独的文件
          //devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          MiniCssExtractPlugin.loader, //这里采用单独文件的形式
          'css-loader',
          'less-loader',
        ],
      }

      //这个已经去了，先不删除这个用法，以后有用
      // ,{
      //   test: require.resolve('./src/js/lib/sound.js'),
      //   use: 'exports-loader?sounds,loadSound'  
      // }

      
    ]
  }

};