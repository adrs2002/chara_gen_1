//////
/////   進行管理のベースクラス
/////   THREE.js　の threeComps.scene とは全く別物になる

"use strict";

export default class GameScene_base {
  constructor() {
    this.sceneId = 0;
    this.sceneId_sub = 0;

    this.screenAssets = [];
  }
  
  sceneControl(){

  }

  update(_delta) {
    this._update(_delta);
  }

  draw() {
    this._draw();
  };

  _update(_delta) {
    
  }

  _draw() {

  }

  addScreenAsset(_name, _obj){
    this.screenAssets.push(_name);
  }

  dispose(){
    for(let i =0; i < this.screenAssets.length;i++){
      if(content.assets[this.screenAssets[i]]){
        content.assets[this.screenAssets[i]] = {};
        delete content.assets[this.screenAssets[i]];
      }
    }
  }

}