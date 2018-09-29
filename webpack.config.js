const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const { getIfUtils, removeEmpty } = require('webpack-config-utils');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
//这个工具就是之前鲈鱼弄的，我之前居然不知道是怎么回事..
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');


module.exports = function(env){
  const { ifProd, ifNotProd } = getIfUtils(env);
  return  {
    mode:ifNotProd("development","production"),
    entry: {
      //polyfill:'babel-polyfill',  //如果要使用es7\es8这种，需要有这个
      tools:'./src/js/tool/tweenFun.js',
      
      //这个就不要了
      // libs: [
      //   './src/js/lib/sound.js',
      //   './src/js/lib/webfontloader.js',
      // ],
      
      main: './src/js/index.js',
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist')
    },
  
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
        filename: ifNotProd('[name].bundle.css','[name].[hash].css'),
        chunkFilename: ifNotProd('[id].bundle.css','[id].[hash].css'),
      }),
      //拷贝
      new CopyWebpackPlugin([
        { from: 'src/img/*',   to: 'img', flatten:true}, //不需要原来的文件夹结构
        { from: 'src/fonts/**', to: 'fonts', flatten:true},
        { from: 'src/sounds/*', to: 'sounds', flatten:true},
      ], {}),
  
      //HMR
      new webpack.HotModuleReplacementPlugin({}),
      
      //注意，这里要在各自端口开，不然的话，就会报错，
      //第一个事开发环境的文件、第二个是生产环境的，我们从图中对比可以发现，前者同名文件更大，因为要监听代码变化，还打包了sockjs.js
      ifNotProd(
        new BundleAnalyzerPlugin({ analyzerPort: 9001 }),
        new BundleAnalyzerPlugin({ analyzerPort: 9002 })
      ),

      //生成.gz文件,不过我试了，不能直接用的，以后再说
      //new CompressionPlugin()
    ]
    
    //分开打包
    ,optimization: {
      
      //这个坑死我了，怎么弄也不行，有时候能把壳压缩下，自己的代码还是不能压缩，而且也不能混淆
      //我参照uglify的官方网站，配了半天也搞不好，后来才发现关键是必须是“production”模式下！
      minimize: true, //这个要有，坑死我了
      minimizer: [new UglifyJsPlugin({})],  

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
            //如果这里匹配不到的依赖，就会被打包到 main.bundle 中
            //所以下面这样子的写法，对于嵌套的组件依赖，会被打包到main.bundle（比如 pixi.js还依赖了resource-loader..）
            //这就是我之前一起好奇，为什么 main.bundle 被打包了一些莫名其妙的东西...
            //test: /[\\/]node_modules[\\/](pixi.js|pixi-sound)[\\/]/, 
            
            test: /[\\/]node_modules[\\/]/, //这个写法就对全部相关的node_modules、嵌套的模块都打到一个包中，这就是我要的
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
            //ifNotProd('style-loader',MiniCssExtractPlugin.loader),
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
}