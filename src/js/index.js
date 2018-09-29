import '../css/base.css';
import '../css/game.less';

import WebFont from 'webfontloader';
import * as PIXI from 'pixi.js'
import 'pixi-sound'  //有依赖关系的是这样子引入的就行

import T from './tool/tweenFun.js';

//自定义字体加载
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
      mc.width = w; 
      mc.height = h; 
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
//我已经尝试使用promise，似乎并不能在代码上进行优化，所以还是用这里的

PIXI.loader
  .add("characterAnimation", "./img/characterAnimation.json") 
  .add("background", "./img/bg.jpg")
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
      .add("page1", "./img/1.jpg")
      .add("page2", "./img/2.jpg")
      .add("page3", "./img/3.jpg")
      .add("page4", "./img/4.jpg")
      .add("page5", "./img/5.jpg")
      .add("page6", "./img/6.jpg")
      .add("page7", "./img/7.jpg")
      .add("page8", "./img/8.jpg")
      .add("page9", "./img/9.jpg")
      .add("page10", "./img/10.jpg")
      .add("page11", "./img/11.jpg")
      .add("page12", "./img/12.jpg")
      .add("page13", "./img/13.jpg")
      .add("page14", "./img/14.jpg")
      .add("page15", "./img/15.jpg")
      .add("page16", "./img/16.jpg")
      .add("page17", "./img/17.jpg")
      .add("page18", "./img/18.jpg")
      .add("page19", "./img/19.jpg")
      .add("page20", "./img/20.jpg")
      .add("page21", "./img/21.jpg")
      .add("page22", "./img/22.jpg")
      .add("page23", "./img/23.jpg")
      .add("page24", "./img/24.jpg")
      .add("page25", "./img/25.jpg")
      .add("page26", "./img/26.jpg")
      .add("page27", "./img/27.jpg")
      .add("page28", "./img/28.jpg")
      .add("page29", "./img/29.jpg")
      .add("page30", "./img/30.jpg")
      .add("page31", "./img/31.jpg")
      .add("page32", "./img/32.jpg")
      .add("page33", "./img/33.jpg")
      .add("page34", "./img/34.jpg")
      .add("page35", "./img/35.jpg")
      .add("page36", "./img/36.jpg")
      .add("page37", "./img/37.jpg")
      .add("page38", "./img/38.jpg")
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