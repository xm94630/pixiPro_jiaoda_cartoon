import '../css/base.css';
import '../css/game.less';

//import _ from 'lodash'; //不使用就不会被打包，lodash文件太大，暂时不用了
import * as PIXI from 'pixi.js'
import 'pixi-sound'  //有依赖关系的是这样子引入的就行

import WebFont from 'webfontloader';


import T from './tool/tweenFun.js';



//字体下载(本项目不使用字体)
WebFont.load({custom: {families: ['monogram']}});

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
var progress;
var nPage = 1; //第几页
var totalPage = 38;
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
      mc.scale.x = mc.scale.y = 1;
      var flag = false;
      mc.on('pointerdown', function(){
        if(flag){
          mc.gotoAndStop(0);
          mySound && mySound.play();
          flag = false;
        }else{
          mc.gotoAndStop(1);
          mySound && mySound.stop();
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
      mc.visible = false;
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
      var mc = PIXI.Sprite.fromImage("page"+nPage);
      mc.name = "page"+nPage;
      return mc;
    },
    pageNumberMC:function(){
      var txt = new PIXI.Text( nPage+"/"+totalPage,{
        fontSize: 30,
        fill: 0xc3592f,
        align: 'left',
        fontFamily:'monogram',
      });
      txt.anchor.set(.5)
      txt.x = w/2;
      txt.y = 1100;
      txt.interactive = true;
      txt.buttonMode = true;
      txt.name="pageNumber"
      return txt;
    },
    homeBtnMC:function(){
      var mc = PIXI.Sprite.fromImage("icon-exit.png");
      mc.x = mc.width/2+30;
      mc.y = mc.height/2+30;
      mc.anchor.set(0.5);
      mc.interactive = true;
      mc.buttonMode = true;
      mc.scale.x = mc.scale.y = 1;
      var flag = false;
      mc.on('pointerdown', function(){
        app.stage.getChildByName('stage1').visible = true;
        app.stage.getChildByName('stage2').visible = false;
        nPage=1;
        stage2.getChildByName('prevBtn').visible=false;
        stage2.getChildByName('nextBtn').visible=true;
        //复位
        var bookMC = stage2.getChildByName('book');
        bookMC.removeChildren(0, bookMC.children.length);
        bookMC.addChild(list.pageMC(nPage));
      });
      return mc;
    }
  }
  return list;
}

//加载声音前的loading场景
function stage0_layout(res){
  var characterAnimation = res['characterAnimation'].data;
  //进度条(图形)
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
  //进度条（文字）
  var progressTextMC = new PIXI.Text(progress,{
    fontSize: 60,
    fill: 0x000,
    align: 'left'
  });
  progressTextMC.anchor.set(.5)
  progressTextMC.x = w/2;
  progressTextMC.y = 700;
  progressTextMC.name="progressText"
  //背景图
  var img = new PIXI.Sprite(res.background.texture)
  img.height = h;

  stage0.name = "stage0"
  stage0.removeChildren(0, stage0.children.length);
  stage0.addChild(
    img,mc,progressTextMC
  );
  //使用场景对应的ticker
  myTicker = stage0_ticker;
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
    homeBtnMC,
  } = getAllMaterial(res);
  stage2.removeChildren(0, stage2.children.length);
  stage2.addChild(
    bookMC(),
    nextBtnMC(),
    prevBtnMC(),
    pageNumberMC(),
    homeBtnMC(),
  );
}


/********************************************************************
 * ticker                                                          *
 ********************************************************************/
function stage0_ticker(delta){
  stage0.getChildByName('progressText').text = progress;
}
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

    //剩余资源加载
    PIXI.loader
      .add("bgmSound","./sounds/bgm.mp3")
      .add("btn", "./img/btn.json")
      .add("buttons", "./img/buttons.json")
      .add("page1", "./img/page1.png")
      .add("page2", "./img/page2.png")
      .add("page3", "./img/page3.png")
      .add("page4", "./img/page4.png")
      .add("page5", "./img/page5.png")
      .add("page6", "./img/page6.png")
      .add("page7", "./img/page7.png")
      .add("page8", "./img/page8.png")
      .add("page9", "./img/page9.png")
      .add("page10", "./img/page10.png")
      .add("page11", "./img/page11.png")
      .add("page12", "./img/page12.png")
      .add("page13", "./img/page13.png")
      .add("page14", "./img/page14.png")
      .add("page15", "./img/page15.png")
      .add("page16", "./img/page16.png")
      .add("page17", "./img/page17.png")
      .add("page18", "./img/page18.png")
      .add("page19", "./img/page19.png")
      .add("page20", "./img/page20.png")
      .add("page21", "./img/page21.png")
      .add("page22", "./img/page22.png")
      .add("page23", "./img/page23.png")
      .add("page24", "./img/page24.png")
      .add("page25", "./img/page25.png")
      .add("page26", "./img/page26.png")
      .add("page27", "./img/page27.png")
      .add("page28", "./img/page28.png")
      .add("page29", "./img/page29.png")
      .add("page30", "./img/page30.png")
      .add("page31", "./img/page31.png")
      .add("page32", "./img/page32.png")
      .add("page33", "./img/page33.png")
      .add("page34", "./img/page34.png")
      .add("page35", "./img/page35.png")
      .add("page36", "./img/page36.png")
      .add("page37", "./img/page37.png")
      .add("page38", "./img/page38.png")
      .load(setup)
      .onProgress.add((myLoader,res) => {
        progress = 'Loading...'+ Math.round(myLoader.progress) +'%';
      });
  });




/********************************************************************
 * 游戏主体逻辑部分                                                    *
 ********************************************************************/
function setup(xxx,res) {

  mySound = res.bgmSound.sound;
  mySound && mySound.play();

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