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
 * resize                                                          *
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
 * 游戏实例创建                                                          *
 ********************************************************************/
var w = 750;
var h = 1200;
var mySound;
var myTicker = function(){}
var app = new PIXI.Application({width:w,height: h,backgroundColor:0xffffff});
app.view.style.position = "absolute";
app.view.style.display = "block";
app.ticker.add(function(delta) {myTicker(delta);});
document.body.appendChild(app.view);
//屏幕适配
resize();



/********************************************************************
 * 场景布局                                                          *
 ********************************************************************/
var stage1     = new PIXI.Container();
var stage2     = new PIXI.Container();

function getAllMaterial(res){
  //这个配置文件是对所有动画json文件的维护，使用起来非常方便
  var characterAnimation = res['characterAnimation'].data;
  return {
    bgImg:function(){
      //创建背景图片
      var bgImg = new PIXI.Sprite(res.background.texture)
      bgImg.height = h;
      return bgImg;
    },
    // viewBtn:function(){
    //   var bgImg;
    //   return viewBtn;
    // },
    btn1:function(){
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
      return btn1;
    },
    soundBtns:function(){
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
      soundBtns.gotoAndStop(0); 
      soundBtns.interactive = true;
      soundBtns.buttonMode = true;
      soundBtns.scale.x = soundBtns.scale.y = 1.5;
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
      return soundBtns;
    },
    btn:function(){
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
      return btn;
    },
    loadingBox:function(){
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
      return loadingBox;
    },

  }
}
//场景布局1
function stage1_layout(res){
  const{bgImg,btn1,soundBtns} = getAllMaterial(res);
  stage1.removeChildren(0, stage1.children.length);
  stage1.addChild(bgImg(),btn1(),soundBtns());
}
//场景布局2
function stage2_layout(res){   
  const{btn} = getAllMaterial(res);
  stage2.removeChildren(0, stage2.children.length);
  stage2.addChild(btn());
}



/********************************************************************
 * ticker                                                          *
 ********************************************************************/
function stage1_ticker(delta){}
function stage2_ticker(delta){}



/********************************************************************
 * 游戏入口                                                          *
 ********************************************************************/
//这部分逻辑后期可以优化成promise，代码更加优美
PIXI.loader
  .add("characterAnimation", "./img/characterAnimation.json") 
  .add("background", "./img/bg.png")
  .add("loadingBox", "./img/loader.json")
  .load(function(xxx,res){
    //优先加载一部分图片，用来做资源加载页
    const{bgImg,loadingBox} = getAllMaterial(res);
    app.stage.addChild(bgImg(),loadingBox());
    //加载声音
    sounds.load([
      "sounds/bgm.mp3",
    ]);
  });

sounds.whenLoaded = function(){
  mySound = sounds['sounds/bgm.mp3']
  mySound.loop = true;
  mySound.play();
  //剩余资源加载
  PIXI.loader
    .add("btn", "./img/btn.json")
    .add("buttons", "./img/buttons.json")
    .load(setup);
};



/********************************************************************
 * 游戏主体逻辑部分                                                    *
 ********************************************************************/
function setup(xxx,res) {
  //场景布局（创建容器）
  stage1_layout(res);
  stage2_layout(res);
  //舞台显示 (容器挂载)
  app.stage = stage1;
  //使用场景对应的ticker
  myTicker = stage1_ticker;
}



/********************************************************************
 * 事件绑定                                                          *
 ********************************************************************/
window.addEventListener('resize', resize);
console.log('=======>')


















//这个已经被取缔了。以后使用 PIXI.settings.SCALE_MODE 
//PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;



//这两个等效
//var bgImg = PIXI.Sprite.fromImage("background")
//var bgImg = new PIXI.Sprite(res.background.texture)