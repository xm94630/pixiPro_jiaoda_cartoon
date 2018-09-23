import '../css/base.css';
import '../css/game.less';

import _ from 'lodash';
import * as PIXI from 'pixi.js'

import WebFont from './lib/webfontloader.js';
import {sounds,loadSound} from './lib/sound.js'

import T from './tool/tweenFun.js';

//因为sounds的方法有对其的依赖(另外这个sound.js在npm库中也是有的，可惜也不是模块化的，所以就用这个吧)
window.loadSound = loadSound;
//字体下载
WebFont.load({custom: {families: ['Conv_monogram','Conv_Minecraftia-Regular']}});


/********************************************************************
 * 函数定义                                                          *
 ********************************************************************/
function resize(){
  var ratio = Math.min(window.innerWidth/w,window.innerHeight/h);
  app.view.style.width = Math.ceil(w * ratio) + "px";
  app.view.style.height = Math.ceil(h * ratio) + "px";
  //居中
  var ratio2 = w/h;
  if(window.innerWidth/window.innerHeight>w/h){
    app.view.style.top = 0
    app.view.style.left = (window.innerWidth-window.innerHeight*ratio2)/2+'px'
  }else{
    app.view.style.left = 0
    app.view.style.top = (window.innerHeight-window.innerWidth/ratio2)/2+'px'
  }
}



/********************************************************************
 * 全局变量                                                          *
 ********************************************************************/
var w = 750;
var h = 1200;
var mySound;

//所有动画json文件的控制
var characterAnimation = null;
//核心函数，用于app.ticker的回调之中
var myTicker = function(){}

//创建实例
var app = new PIXI.Application({width:w,height: h,backgroundColor:0xffffff});
app.view.style.position = "absolute";
app.view.style.display = "block";
document.body.appendChild(app.view);

//屏幕适配
resize();




app.ticker.add(function(delta) {
  myTicker(delta);
});

//创建容器（场景）
var background = new PIXI.Container();
var stage1     = new PIXI.Container();
var stage2     = new PIXI.Container();
var stage3     = new PIXI.Container();

//各个场景中的状态改变器：
function stage1_ticker(delta){}
function stage2_ticker(){}
function stage3_ticker(){}


//场景1绘制
function stage1_layout(res){

  //这个是清空场景作用
  //对于多次调用stage1_layout函数的时候，不会被反复地向舞台新增素材
  //如果要保持场景的状态，stage1_layout函数仅仅需要调用一次，切换场景的时候，只要把它隐藏就好了。
  stage1.removeChildren(0, stage1.children.length); 

  //创建背景图片
  var bk = new PIXI.Sprite(res.background.texture)
  bk.height = h;


  //按钮文字1
  var btn1 = new PIXI.Text('观看',{
    //fontFamily:"Conv_monogram",
    fontFamily:"Conv_Minecraftia-Regular",
    fontSize:50, 
    padding:20
  });
  btn1.anchor.set(.5)
  btn1.x = w/2+300;
  btn1.y = 1100;
  btn1.interactive = true;
  btn1.buttonMode = true;
  btn1.on('pointerdown', function(){
    app.stage = stage2;
  });
  

  

  //声音暂停/继续按钮
  //var soundBtn = PIXI.Texture.fromFrame('icon-sound-on.png');//注意，如果只有单帧，不能用 PIXI.Texture.fromFrame
  //var soundBtn = PIXI.Sprite.fromImage('icon-sound-on.png'); //单帧用这个。
  //这里用影片剪辑来实现
  var soundBtn = PIXI.Texture.fromFrame('icon-sound-on.png');
  var soundBtnFrames=[];
  for (var i = 0; i < characterAnimation['button.json']['soundBtn'].length; i++) {
    soundBtnFrames.push(PIXI.Texture.fromFrame( characterAnimation['button.json']['soundBtn'][i] ));
  }
  var soundBtns = new PIXI.extras.AnimatedSprite(soundBtnFrames);
  soundBtns.x = w-soundBtns.width/2-30;
  soundBtns.y = soundBtns.height/2+30;
  soundBtns.anchor.set(0.5);
  soundBtns.gotoAndStop(0); //就像flash一样控制影片剪辑
  soundBtns.interactive = true;
  soundBtns.buttonMode = true;
  soundBtns.scale.x = soundBtns.scale.y = 1.5;//放大一点，方便点击
  var flag = false;
  soundBtns.on('pointerdown', function(){
    if(flag){
      soundBtns.gotoAndStop(0);
      mySound.play();
      flag = false;
    }else{
      soundBtns.gotoAndStop(1);
      mySound.pause();
      flag = true;
    }
  });
  
  

  //场景（容器）添加元素
  stage1.addChild(bk,btn1,soundBtns);
}

//场景2绘制
function stage2_layout(res){   
    var btn = new PIXI.Text('游戏开始',{
      fontSize: 60,
      fill: 0x000,
      align: 'left'
    });
    btn.anchor.set(.5)
    btn.x = w/2;
    btn.y = 200;
    btn.interactive = true;
    btn.buttonMode = true;
    stage2.addChild(btn);
}





//入口1
PIXI.loader
  //优先加载一部分用来基础显示，然后再慢慢加载别的
  .add("characterAnimation", "./img/characterAnimation.json") 
  .add("background", "./img/bg.png")
  .add("loadingBox", "./img/loader.json")
  .load(function(xxx,res){

      //这个配置文件是对所有动画json文件的维护，使用起来非常方便
      characterAnimation = res['characterAnimation'].data;

      //创建背景图片
      var bk =PIXI.Sprite.fromImage("background")
      bk.height = h;

      //创建进度条动画
      var frames = [];
      for (var i = 0; i < characterAnimation['loadingBox.json']['loadingBox'].length; i++) {
          frames.push(PIXI.Texture.fromFrame( characterAnimation['loadingBox.json']['loadingBox'][i] ));
      }
      var loadingBox = new PIXI.extras.AnimatedSprite(frames);
      loadingBox.name="loadingBoxm";
      loadingBox.x = w / 2;
      loadingBox.y = h / 2;
      loadingBox.anchor.set(0.5);
      loadingBox.animationSpeed = 0.25
      loadingBox.play();
      
      app.stage.addChild(bk,loadingBox);

      //入口2
      sounds.load([
        "sounds/bgm.mp3",
      ]);
  });

sounds.whenLoaded = function(){
  //播放背景音乐（但是不会在手机中触发，手机中需要在点击中触发的，所以我要找一个地方来触发下，比如“开始游戏按钮”之类）
  mySound = sounds['sounds/bgm.mp3']
  mySound.loop = true; //其他属性设置可以参考官网（注意区分sound.js、soundJS，我们是前者）
  mySound.play(); //这个在手机上第一次的时候并不会被触发
  //mySound.playFrom(0); //控制具体从哪里开始播放

  //资源加载
  PIXI.loader
    .add("btn", "./img/btn.json")
    .add("buttons", "./img/buttons.json")
    .load(setup);
};

//加载后回调
function setup(xxx,res) {

  //完成3个容器进行布局
  stage1_layout(res);
  stage2_layout(res);

  
  //把容器1进行展示
  //app.stage.addChild(stage1);
  app.stage = stage1;
  //使用容器1对应的“状态改变器”
  myTicker = stage1_ticker;
  


}



//注意点：
//1 就是字体显示模糊的问题，已经解决。坑了我很久
//2 就是场景控制问题，
//  1)比如只有一个场景，其他的内容都用容器的显示和隐藏来解决
//  2)比如有多个场景，可以通过切换场景来进行
//  3)那些内容是需要复位的，而那些是可以单独运行的，而时间计时器是如何在各个场景中运行的，这些都要搞明白
//3 理解app.ticker.add，清空其回调，就是暂停。之前因为理解不够透彻，被坑了很久！

// 关于加载的一般步骤，我参考了“足球”游戏的加载顺序（3G网络下观察）
// 开始是一片空白，这个时候是加载依赖的css、js之类
// 然后出现舞台，空白的舞台 
// 然后是声音全部加载完毕 （可见这个时候，json、图片资源尚未完成，也就是声音先于他们加载）
// 然后是出现加载进度条的场景 （这个应该是优先加载“加载进度”所需的素材，剩余素材再以进度条的形式加载）
// 最后加载完成

// 容器的这个cacheAsBitmap属性设置为true的话，内容的元素就会不随时间的推移而改变，换句话说，就是状态就不会再发生变化了（表现为相对静止状态）

console.log('=======>')








/********************************************************************
 * 事件绑定                                                          *
 ********************************************************************/
window.addEventListener('resize', resize);








//这个已经被取缔了。以后使用 PIXI.settings.SCALE_MODE 
//PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;