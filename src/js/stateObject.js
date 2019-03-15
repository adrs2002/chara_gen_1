export const stateLoopType = {
  None: 0,
  Infnit: 1,
  // Spring: 2
};

export class stateRequireObjects {
  constructor(_model, _actions, _actionNames) {
    this.model = _model;
    this.actions = _actions;
    this.actionNames = _actionNames;
  }
}

export class stateObject {
  constructor(_beforeState, _stateRequires) {
    this.totalDelta = 0.0;
    this.beforeState = _beforeState ? _beforeState : null;

    this.beforeStateName = _beforeState ? _beforeState.name : "";
    this.name = "";
    this.useActionName = "";

    // timeToはミリ秒指定。1秒＝1000。
    this.timeTo = 150; // 5フレーム＝30*5= 150
    this.power = 0;
    this.endCallBack = null;
    this.changeCallBack = null;
    this.value = null;
    this.loopType = stateLoopType.None;
    this.isChanging = false;

    this.stateRequires = _stateRequires;
    this.nextState = null;
  }

  changeAnimation() {
    if (!this.stateRequires.actions) {
      return;
    }
    this.animeTime = 0;
    if (this.useActionName === "") {
      this.useActionName = this.name;
    }
    this.anotherAniationStop();

    this.stateRequires.actions[this.useActionName].enabled = true;
    this.stateRequires.actions[this.useActionName].reset().play();
    if (this.beforeState) {
      this.stateRequires.actions[this.useActionName].crossFadeFrom(this.stateRequires.actions[this.beforeState.useActionName], 200, false);
    }

  }

  anotherAniationStop() {
    if (this.beforeState) {
      for (let i = 0; i < this.stateRequires.actionNames.length; i++) {
        if (this.useActionName != this.stateRequires.actionNames[i]) {
          if (this.beforeState.useActionName != this.stateRequires.actionNames[i]) {
            this.stateRequires.actions[this.stateRequires.actionNames[i]].stop().enabled = false;
          } else {
            this.stateRequires.actions[this.stateRequires.actionNames[i]].weight = 1.0;
            this.stateRequires.actions[this.stateRequires.actionNames[i]].fadeOut(200);
          }
        }
      }
    }

  }

  update(_delta) {
    if (this.totalDelta < this.timeTo) {
      this.totalDelta += _delta;
      if (this.totalDelta >= this.timeTo) {
        this.power = 1.0;
        if (this.loopType == stateLoopType.Infnit) {
          this.totalDelta = 0;
        } else {
          this.totalDelta = this.timeTo;
        }
        if (this.endCallBack) {
          this.endCallBack();
        }
        return true;
      } else {
        this.power = this.totalDelta / this.timeTo;
      }
    }
    return false;
  }

  action() {

  }

  power() {
    if (this.totalDelta === 0) {
      return 0;
    }
    if (this.totalDelta === this.timeTo) {
      return 1;
    }
    return this.totalDelta / this.timeTo;
  }

  getMovePower(){
    return 0;
  }

}

/********************************/

export class groundState extends stateObject {
  constructor(_beforeState, _stateRequires) {
    super(_beforeState, _stateRequires);
    this.name = "ground";
  }
}

export class moveBasicState extends stateObject {
  constructor(_beforeState, _stateRequires) {
    super(_beforeState, _stateRequires);
    this.name = "groundMove";
    this.timeTo = 150; // 5フレーム＝30*5= 150
    this.useActionName = "";
    this.moveVector = new THREE.Vector2();

    this.frontMoveName = 'moveF';
    this.BackMoveName = 'moveB';
    this.RightMoveName = 'moveR';
    this.LeftMoveName = 'moveL';
    // this.changeAnimation();
  }

  // 移動速度になる
  getMovePower(_stickFactor) {
    return 1;
  }

  changeAnimation() {
    if (!this.stateRequires.actions) {
      return;
    }
    this.animeTime = 0;
    if (this.useActionName === "") {
      this.useActionName = this.name;
    }

    this.anotherAniationStop();

  }

  update(_dul) {
    super.update(_dul);

    // アニメーションの決定がここで行われている
    const motionCalcVect = new THREE.Vector2().copy(this.moveVector).normalize();
    if (motionCalcVect.y === 0) {
      this.setMotionDisable(this.frontMoveName);
      this.setMotionDisable(this.BackMoveName);
    } else {
      if (motionCalcVect.y > 0) {
        this.setMotionEnable(this.frontMoveName, motionCalcVect.y);
        this.setMotionDisable(this.BackMoveName);
      } else {
        this.setMotionDisable(this.frontMoveName);
        this.setMotionEnable(this.BackMoveName, motionCalcVect.y * -1);
      }
    }

    if (motionCalcVect.x === 0) {
      this.setMotionDisable(this.RightMoveName);
      this.setMotionDisable(this.LeftMoveName);
    } else {
      if (motionCalcVect.x > 0) {
        this.setMotionEnable(this.RightMoveName, motionCalcVect.x);
        this.setMotionDisable(this.LeftMoveName);
      } else {
        this.setMotionDisable(this.RightMoveName);
        this.setMotionEnable(this.LeftMoveName, motionCalcVect.x * -1);
      }
    }

  }

  setMotionEnable(_motion, _weight) {
    this.stateRequires.actions[_motion].play().enabled = true;
    this.stateRequires.actions[_motion].weight = _weight * this.power;

    if (_weight > 0.5) {
      this.useActionName = _motion;
    }
  }

  setMotionDisable(_motion) {
    this.stateRequires.actions[_motion].stop().enabled = false;
  }

}