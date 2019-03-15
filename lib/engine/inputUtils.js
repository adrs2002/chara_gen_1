

Engine.hammer = null;
Engine.hammerInit = function() {
    // 2dCanvas
    var hammer = new Hammer(Engine.el_Canvas, {
      inputClass: Hammer.TouchMouseInput
    });
  
    hammer.get('pan').set({
      direction: Hammer.DIRECTION_ALL,
      pointers: 0
    });
  
    hammer.get('press').set({
      time: 1,
    });
    hammer.get('tap');
  
    hammer.get('swipe').set({
      direction: Hammer.DIRECTION_ALL
    });
  
    if (Engine.stickCount == 1) {
      hammer.get('pinch').set({
        enable: true
      });
      hammer.on("pinch", function(ev) {
        if (Engine.gameScene.onPinch) Engine.gameScene.onPinch(ev);
      });
    }
  
    hammer.on("press", function(ev) {
      if (Engine.gameScene.onMouseDown) Engine.gameScene.onMouseDown(ev);
    });
    hammer.on("pressup", function(ev) {
      if (Engine.gameScene.onMouseUp) Engine.gameScene.onMouseUp(ev);
    });
  
    hammer.on("tap", function(ev) {
      if (Engine.gameScene.onTap) Engine.gameScene.onTap(ev);
    });
  
    hammer.on("panmove", function(ev) {
      Engine.virtualSticks.update(ev.pointers);
      if (Engine.gameScene.onMouseMove) Engine.gameScene.onMouseMove(ev);
    });
    hammer.on("panend", function(ev) {
      Engine.virtualSticks.release(ev.changedPointers);
      if (Engine.gameScene.onMouseUp) Engine.gameScene.onMouseUp(ev.changedPointers);
    });
  
    hammer.on("swipe", function(ev) {
      if (ev.deltaTime < 350 && Engine.gameScene.onSwipe) Engine.gameScene.onSwipe(ev);
    });
  
  }

  