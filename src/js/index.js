import '../css/base.css';
import '../css/game.less';

import _ from 'lodash';
import * as PIXI from 'pixi.js'


import T from './tool/tweenFun.js';

import WebFont from './lib/webfontloader.js';
import {sounds,loadSound} from './lib/sound.js'

//因为sounds的方法有对其的依赖
//另外这个sound.js在npm库中也是有的，可惜也不是模块化的，所以就用这个吧 
window.loadSound = loadSound;

WebFont.load({
  custom: {
    families: ['Conv_monogram','Conv_Minecraftia-Regular'] 
  }
});



  //小鸟缓动步调设置
  var newSin    = T.xyMod(T.sin,2,50,600);
  var birdSteps = T.createSteps(newSin,T.pi*4,0.1,true);

  //文字缓动步调设置
  var tweenFuncMod = T.xyMod(T.ttFun,1,2/9,2);
  var btnSteps  = T.createSteps(tweenFuncMod,20,0.1,true);





  //var w = 375;//这个是iphone6-x 的宽度
  //var h = 600;
  var w = 750;
  var h = 1200;
  var mySound;
  var count=0;
  var doScale=false; 

  //所有动画json文件的控制
  var characterAnimation = null;


  //这个是很重要的一个函数，用于 app.ticker 之中。
  //当 myTicker 赋予不同的处理函数的时候，就会对对应的函数处理
  //而不被处理的内容，状态就不会被改变，就好像被“暂停了”一样
  //所以所谓的“暂停”，无非就是某个场景的状态不被改变而已。
  //我之前在研究“faerieFM”的暂停的时候，一直找不到“暂停”的操作，后来一一排查，才恍然大悟！
  var myTicker = function(){}
  //另外，这里一开始设置的是一个空函数，有的案例中，直接有内容的，会导致一上来就执行这个回调
  //如果函数体中引用了没有赋值的元素就会出错，所以这种情况下，可用用 app.stop 来停止主帧的播放，需要的时候start就行

  //创建实例
  var app = new PIXI.Application({width:w,height: h,backgroundColor:0xffffff});
  app.view.style.position = "absolute";
  app.view.style.display = "block";
  document.body.appendChild(app.view);
  window.addEventListener('resize', resize);
  function resize(){
    //缩放
    var ratio = Math.min(window.innerWidth/w,window.innerHeight/h);
    //这个是解决缩放后文字变模糊的核心所在，之前的用法是错误的！
    app.view.style.width = Math.ceil(w * ratio) + "px";
    app.view.style.height = Math.ceil(h * ratio) + "px";
    //app.renderer.resize(Math.ceil(w * ratio),Math.ceil(h * ratio));
    //所有的场景也要缩放
    //stage1.scale.x = stage1.scale.y = ratio;
    //stage2.scale.x = stage2.scale.y = ratio;
    //stage3.scale.x = stage3.scale.y = ratio;
    
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
  resize();
  
  //这个已经被取缔了。以后使用 PIXI.settings.SCALE_MODE 
  //PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
  
  app.ticker.add(function(delta) {
    myTicker(delta);
  });

  //创建容器（场景）
  var background = new PIXI.Container();
  var stage1     = new PIXI.Container();
  var stage2     = new PIXI.Container();
  var stage3     = new PIXI.Container();

  //各个场景中的状态改变器：
  function stage1_ticker(delta){

    //通过名字引用小鸟，不过这个名字需要自己定义好，这样子使用起来非常方便
    var niao = stage1.getChildByName('anim');
    niao.x += delta*2;
    if(niao.x> w+niao.width/2){
      niao.x = 0-niao.width/2;
    }


    //【重要】缓动函数的原理 这是个重要的运用啊
    //使用 Math.sin 会有神奇的效果
    //之前我一直在思考如何实现，上下摆动的效果，我开始想到的是用 各种缓动函数 来实现。结果在看到别的案例的时候，发现这个 Math.sin 就是这样的一个函数。
    //Math.sin可以产生-1~1之前摆动的数字，正好用上。
    
    //究其原理，就是，本身元素在固定间隔时间改变状态，主要是改变距离，因为时间间隔是相等的，所以产生的效果在视觉上就是匀速的
    //只要能让每次修改状态的值不是固定的，我们就可以产生很多种效果，这里的sin就是这样子的函数。
    //我甚至可以创建很多属于自己的缓动函数。
    //而且这样子的函数可以常见很多不可思议、有趣的效果。
    //可以自己写、也可以使用自己写的函数。我也恍然想起，我好像之前用函数式编程实现过这样子的函数。

    //自己实现的小鸟步调
    niao.y = birdSteps.perAdd();

    //这里实现一个文字忽大忽小的功能（我称之为“跳蹦床“效果）
    var controlBtn = stage1.getChildByName('controlBtn');
    controlBtn.scale.x=controlBtn.scale.y = btnSteps.perAdd()
    
  }
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

    //创建标题文字
    var title = new PIXI.Text('新交大群侠传',{
      fontFamily: 'Arial',
      fontSize: 100,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#ffffff', '#00ff99'], // gradient
      stroke: '#4a1850',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: true,
      wordWrapWidth: 440
    });
    title.name = "logoFont";
    title.resolution = 2;
    title.anchor.set(.5)
    //注意，这里被坑了下，官方demo是没有resize的，所以用 app.screen.width 是可以的
    //其实我这里所有的定位，就根据最初的设定的w、h来进行处理就好
    //或者把 resize(); 放在这里之后。
    //title.x = app.screen.width/2;
    title.x = w/2;
    title.y = 150;

    //按钮文字1
    var btn1 = new PIXI.Text('GAME Start',{
      //fontFamily:"Conv_monogram",
      fontFamily:"Conv_Minecraftia-Regular",
      fontSize:32, 
      padding:20
    });
    btn1.anchor.set(.5)
    btn1.x = w/2;
    btn1.y = 300;
    btn1.interactive = true;
    btn1.buttonMode = true;
    btn1.on('pointerdown', function(){
      app.stage = stage2;
    });
    
    //按钮文字2
    var btn2 = new PIXI.Text('Author 介绍',{
      fontSize: 60
    });
    btn2.anchor.set(.5)
    btn2.x = w/2;
    btn2.y = 400;
    btn2.interactive = true;
    btn2.buttonMode = true;
    btn2.on('pointerdown', function(){
      app.stage = stage3;
      //注意这里一定要写上这两组，否者声音会被多次添加
      mySound.pause();
      mySound.play();
    });
    btn2.on('mouseover', function(){
      btn2.scale.x = 2;
      btn2.scale.y = 2;
    });
    btn2.on('mouseout', function(){
      btn2.scale.x = 1;
      btn2.scale.y = 1;
    });

    //动画暂停/继续按钮
    var btn3 = new PIXI.Text('stop',{fontSize: 60}); 
    btn3.anchor.set(.5)
    btn3.name = "controlBtn";
    btn3.x = w/2;
    btn3.y = 1000;
    btn3.interactive = true;
    btn3.buttonMode = true;
    btn3.on('pointerdown', function(){

      if(anim.playing){
        //状态改变器切换成空
        myTicker = function(){};
        //小鸟动画停止
        stage1.getChildByName('anim').stop();
        //修改文字
        btn3.setText("play")
      }else{
        //状态改变器切换成stage1_ticker
        myTicker = stage1_ticker
        //修改文字
        btn3.setText("stop")
        stage1.getChildByName('anim').play();
      }
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
    

    //创建影片  小鸟
    var frames = [];

    // for (var i = 0; i < n; i++) {
    //     frames.push(PIXI.Texture.fromFrame('frame-' + (i+1) + '.png'));
    // }

    //使用这个写法代替上述写法，具有很好的维护性
    for (var i = 0; i < characterAnimation['monster.json']['fly'].length; i++) {
        frames.push(PIXI.Texture.fromFrame( characterAnimation['monster.json']['fly'][i] ));
    }

    var anim = new PIXI.extras.AnimatedSprite(frames);
    anim.x = 100;
    anim.name="anim"; //起一个名字方便以后引用
    anim.y = app.screen.height / 2;
    anim.anchor.set(0.5);
    anim.animationSpeed = 0.25
    anim.play();
    //这个有点像flash中的实现
    //anim.gotoAndStop(2);

    

    //场景（容器）添加元素
    stage1.addChild(bk,title,btn1,btn2,btn3,anim,soundBtns);
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

  //场景3绘制
  function stage3_layout(res){

    // 如果加上下面这些，stage3被多次调用有重置场景的效果。看情况使用
    // stage3 = new PIXI.Container();
    // resize();
    
    var btn = new PIXI.Text('作者是一个画家，如果这里文字很长很长很长，我需要会折行的文字',{
      //下面三行是实现文字折行的重要配置
      //谷歌搜索 pixi text 查得 => https://pixijs.io/pixi-text-style/#
      "breakWords": true,
      "wordWrapWidth": w,
      "wordWrap": true
    });
    btn.anchor.set(.5)
    btn.x = w/2;
    btn.y = 200;
    btn.interactive = true;
    btn.buttonMode = true;

    var btn2 = new PIXI.Text('返回首页',{
      fontSize: 60,
      fill: 0x000,
      align: 'left'
    });
    btn2.anchor.set(.5)
    btn2.x = w/2;
    btn2.y = 400;
    btn2.interactive = true;
    btn2.buttonMode = true;
    btn2.on('pointerdown', function(){
      //如果再次调用这个布局函数的话，会进行重新布局，这样子，之前的动画啥的，就被清空了
      stage1_layout(res)
      
      app.stage = stage1;
    });
    stage3.addChild(btn);
    stage3.addChild(btn2);
  }




  //入口1
  PIXI.loader
    //优先加载一部分用来基础显示，然后再慢慢加载别的
    .add("characterAnimation", "./img/characterAnimation.json") 
    .add("background", "./img/background.png")
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
      .add("monster", "./img/monster.json")
      .add("buttons", "./img/buttons.json")
      .load(setup);
  };

  //加载后回调
  function setup(xxx,res) {

    //完成3个容器进行布局
    stage1_layout(res);
    stage2_layout(res);
    stage3_layout(res);
    
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