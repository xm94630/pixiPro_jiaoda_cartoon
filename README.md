# pixiPro_jiaoda
应用


# 开发笔记
这个已经被取缔了。以后使用 PIXI.settings.SCALE_MODE 
PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

这两个等效
var bgImg = PIXI.Sprite.fromImage("background")
var bgImg = new PIXI.Sprite(res.background.texture)

同一个mc实例只能被添加到一个容器中...

使用 visible 来展示不同的容器，而不是用add、remove容器。
zOrder 视乎在没有效果？ 后来add的容器会覆盖之前的，所以不如一次性都向舞台添加容器，然后隐藏了先