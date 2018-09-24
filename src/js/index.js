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
var nPage = 1; //第几页
var totalPage = 3;
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
var stage0 = new PIXI.Container();//加载
var stage1 = new PIXI.Container();
var stage2 = new PIXI.Container(); 
stage1.name = "stage1"
stage2.name = "stage2"

function getAllMaterial(res){
  //这个配置文件是对所有动画json文件的维护，使用起来非常方便
  var characterAnimation = res['characterAnimation'].data;
  var list = {
    bgImg:function(){
      var img = new PIXI.Sprite(res.background.texture);
      return img;
    },
    viewBtnMC:function(){
      var sourceArr = characterAnimation['button.json']['viewBtn'];
      var frameArr=[];
      for (var i = 0; i < sourceArr.length; i++) {
        frameArr.push(PIXI.Texture.fromFrame( sourceArr[i] ));
      }
      var mc = new PIXI.extras.AnimatedSprite(frameArr);
      mc.x = w-mc.width/2-12;
      mc.y = mc.height/2+892;
      mc.anchor.set(0.5);
      mc.gotoAndStop(0); 
      mc.interactive = true;
      mc.buttonMode = true;
      mc.on('pointerdown', function(){
        //舞台切换场景
        app.stage.getChildByName('stage1').visible = false;
        app.stage.getChildByName('stage2').visible = true;
      });
      return mc;
    },
    soundBtnMC:function(){
      var sourceArr = characterAnimation['button.json']['soundBtn']
      var frameArr=[];
      for (var i = 0; i < sourceArr.length; i++) {
        frameArr.push(PIXI.Texture.fromFrame( sourceArr[i] ));
      }
      var mc = new PIXI.extras.AnimatedSprite(frameArr);
      mc.x = w-mc.width/2-30;
      mc.y = mc.height/2+30;
      mc.anchor.set(0.5);
      mc.gotoAndStop(0); 
      mc.interactive = true;
      mc.buttonMode = true;
      mc.scale.x = mc.scale.y = 1.5;
      var flag = false;
      mc.on('pointerdown', function(){
        if(flag){
          mc.gotoAndStop(0);
          mySound.play();
          flag = false;
        }else{
          mc.gotoAndStop(1);
          mySound.pause();
          flag = true;
        }
      });
      return mc;
    },
    nextBtnMC:function(){
      var sourceArr = characterAnimation['button.json']['viewBtn'];
      var frameArr=[];
      for (var i = 0; i < sourceArr.length; i++) {
        frameArr.push(PIXI.Texture.fromFrame( sourceArr[i] ));
      }
      var mc = new PIXI.extras.AnimatedSprite(frameArr);
      mc.x = w-mc.width/2-20;
      mc.y = h-mc.height/2-20;
      mc.anchor.set(0.5);
      mc.gotoAndStop(2); 
      mc.interactive = true;
      mc.buttonMode = true;
      mc.scale.x = mc.scale.y = 1;
      mc.on('pointerdown', function(){
        nPage++;
        if(nPage>=totalPage){
          stage2.getChildByName('nextBtn').visible=false;
        }else{
          stage2.getChildByName('prevBtn').visible=true;
          stage2.getChildByName('nextBtn').visible=true;
        }
        var bookMC = stage2.getChildByName('book');
        bookMC.removeChildren(0, bookMC.children.length);
        bookMC.addChild(list.pageMC(nPage));
      });
      mc.name="nextBtn"
      return mc;
    },
    prevBtnMC:function(){
      var sourceArr = characterAnimation['button.json']['viewBtn'];
      var frameArr=[];
      for (var i = 0; i < sourceArr.length; i++) {
        frameArr.push(PIXI.Texture.fromFrame( sourceArr[i] ));
      }
      var mc = new PIXI.extras.AnimatedSprite(frameArr);
      mc.x = mc.width/2+20;
      mc.y = h-mc.height/2-20;
      mc.anchor.set(0.5);
      mc.gotoAndStop(1); 
      mc.interactive = true;
      mc.buttonMode = true;
      mc.scale.x = mc.scale.y = 1;
      mc.on('pointerdown', function(){
        nPage--;
        if(nPage<=1){
          stage2.getChildByName('prevBtn').visible=false;
        }else{
          stage2.getChildByName('prevBtn').visible=true;
          stage2.getChildByName('nextBtn').visible=true;
        }
        var bookMC = stage2.getChildByName('book');
        bookMC.removeChildren(0, bookMC.children.length);
        bookMC.addChild(list.pageMC(nPage));
      });
      mc.name="prevBtn"
      return mc;
    },
    btn:function(){
      var txt = new PIXI.Text('游戏开始',{
        fontSize: 60,
        fill: 0x000,
        align: 'left'
      });
      txt.anchor.set(.5)
      txt.x = w/2;
      txt.y = 200;
      txt.interactive = true;
      txt.buttonMode = true;
      return txt;
    },
    page01Img:function(){var img = new PIXI.Sprite(res.page01.texture);img.name = "page01";return img;},
    page02Img:function(){var img = new PIXI.Sprite(res.page02.texture);img.name = "page02";return img;},
    bookMC:function(){
      var mc = new PIXI.Container();
      mc.name = "book";
      mc.addChild(list.pageMC(1))
      return mc;
    },
    pageMC:function(nPage){
      var mc = PIXI.Sprite.fromImage("page0"+nPage);
      mc.name = "page0"+nPage;
      return mc;
    },
    pageNumberMC:function(){
      var txt = new PIXI.Text( nPage+"/"+totalPage,{
        fontSize: 30,
        fill: 0xc3592f,
        align: 'left'
      });
      txt.anchor.set(.5)
      txt.x = w/2;
      txt.y = 1100;
      txt.interactive = true;
      txt.buttonMode = true;
      txt.name="pageNumber"
      return txt;
    },
  }
  return list;
}

//加载声音前的loading场景
function stage0_layout(res){
  var characterAnimation = res['characterAnimation'].data;
  //进度条
  var sourceArr = characterAnimation['loadingBox.json']['loadingBox'];
  var frames = [];
  for (var i = 0; i < sourceArr.length; i++) {
      frames.push(PIXI.Texture.fromFrame( sourceArr[i] ));
  }
  var mc = new PIXI.extras.AnimatedSprite(frames);
  mc.name="loadingBox";
  mc.x = w / 2;
  mc.y = h / 2;
  mc.anchor.set(0.5);
  mc.animationSpeed = 0.25
  mc.play();
  //背景图
  var img = new PIXI.Sprite(res.background.texture)
  img.height = h;

  stage0.name = "stage0"
  stage0.removeChildren(0, stage0.children.length);
  stage0.addChild(
    img,mc
  );
}

//场景布局1
function stage1_layout(res){
  const{bgImg,soundBtnMC,viewBtnMC,page01Img} = getAllMaterial(res);
  stage1.removeChildren(0, stage1.children.length);
  stage1.addChild(
    bgImg(),
    viewBtnMC(),
  );
}

//场景布局2
function stage2_layout(res){   
  const{
    prevBtnMC,
    nextBtnMC,
    soundBtnMC,
    bookMC,
    pageMC,
    pageNumberMC,
  } = getAllMaterial(res);
  stage2.removeChildren(0, stage2.children.length);
  stage2.addChild(
    bookMC(),
    nextBtnMC(),
    prevBtnMC(),
    pageNumberMC(),
  );
}


/********************************************************************
 * ticker                                                          *
 ********************************************************************/
function stage1_ticker(delta){}
function stage2_ticker(delta){
  stage2.getChildByName('pageNumber').text = nPage+" / "+totalPage;
}



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
    stage0_layout(res);
    app.stage.addChild(stage0);

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
    .add("page01", "./img/page01.png")
    .add("page02", "./img/page02.png")
    .add("page03", "./img/page03.png")
    .load(setup);
};



/********************************************************************
 * 游戏主体逻辑部分                                                    *
 ********************************************************************/
function setup(xxx,res) {
  const{soundBtnMC} = getAllMaterial(res);
  //场景布局（创建容器）
  stage1_layout(res);
  stage2_layout(res);
  //舞台显示 (容器挂载)
  app.stage.removeChild(app.stage.getChildByName('stage0')); //移除（后续不会再用）
  app.stage.addChild(stage1,stage2,soundBtnMC());
  app.stage.getChildByName('stage1').visible = true;
  app.stage.getChildByName('stage2').visible = false;
  //使用场景对应的ticker
  myTicker = stage2_ticker;
}


/********************************************************************
 * 事件绑定                                                          *
 ********************************************************************/
window.addEventListener('resize', resize);
console.log('=======>')