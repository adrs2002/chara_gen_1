import * as THREE from './../node_modules/three/build/three.module.js';

const gameMath = {};

gameMath.Pi2 = Math.PI * 2.0;

gameMath.rotateAxisY = new THREE.Vector3(0, 1, 0).normalize();
gameMath.rotateAxisX = new THREE.Vector3(1, 0, 0).normalize();
gameMath.rotateAxisZ = new THREE.Vector3(0, 0, 1).normalize();

gameMath.HitAxisY = new THREE.Vector3(0, -1, 0).normalize();

/**
 * 引数の角度を、-PI　～　+PI　の間にする
 */
gameMath.limitPi = function(_f) {
  if (_f == 0) {
    return 0;
  }

  if (_f > 0) {
    if (_f > Math.PI) {
      return gameMath.limitPi(_f - gameMath.Pi2);
    } else {
      return _f;
    }
  } else {
    if (_f < -Math.PI) {
      return gameMath.limitPi(_f + gameMath.Pi2);
    } else {
      return _f;
    }
  }

}

/**
 * 指定方向に向くには、左右どちらに向くかを検出する。 true　なら時計回り（右回り）。
 */
gameMath.checkClockwise = function(current, target) {
  return target > current ? !(target - current > Math.PI) : current - target > Math.PI;
}

/**
 * 指定方向に向く角度を、角度リミッター付きで検出します。
 */
gameMath.getLookAngle = function(current, target, speed) {
  if(!speed) { speed = 0.2;}
  const rolRL = gameMath.checkClockwise(current, target);
  const f = rolRL ? speed : -speed;
  return gameMath.limitPi(current + f);
}

/**
 * 指定したオブジェクトのY軸方向を、指定した角度にセットします（リミッター付き）
 */
gameMath.setLookAngleY = function(object, target, speed) {
  if (speed == 0) {
    current.rotation.y = target;
  } else {
    let subAngle = gameMath.limitPi(target - object.rotation.y);
    if (Math.abs(subAngle) > 0.2) {
        object.rotation.y = gameMath.getLookAngle(object.rotation.y, target, speed);
    } else {
        object.rotation.y = target;
    }
  }
}