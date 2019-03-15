import * as THREE from './../../node_modules/three/build/three.module';
import * as state from './stateObject';

export class movingObject {
    /**
     * ：移動ステートとActステートは分けたい
     * ：それに伴い、モーションも分けたい
     * ：移動ステートの状況により、Actステートは中断＆クリアされることがある。
     * ：Actステートから移動ステートを操作することは、基本的にない? （全身モーションとかあるかも。ある）
     * ：移動ステートは並列動作なし・Actステートも並列動作なし？
     *    →並列ありにすると、「優先」フラグが必要になって、整理が大変
     *
     * ：移動ステートは、Actステートをロックすることがある。
     */

    constructor(_assetName) {
        this.assetName = _assetName;
        this.Asset = Engine.content.assets[_assetName];

        this.moveVector = new THREE.Vector3();
        this.moveV2 = new THREE.Vector2();
        this.movePower = 0;
        this.stickFactor = 0;
        this.lastMoveV = new THREE.Vector2();

        this.isAnimatingObject = false;
        this.mixer = null;
        this.actions = null;
        this.actionNames = [];

        /* 移動管理ステート */
        this.moveState = new state.stateObject();
        this.attackState = new state.stateObject();
        /* 姿勢&基礎状態管理ステート */
        this.attitudeState = new state.stateObject();
    }

    updateState(_state, _dul) {
        if (_state) {
            _state.update(_dul);
            if (_state.nextState) {
                _state = _state.nextState;
                _state.nextState = null;
            }
        }
    }

    update(_dul) {
        this.updateState(this.moveState, _dul);
        this.updateState(this.attackState, _dul);
        this.movingUpdate(null);

        if (this.isAnimatingObject) {
            this.animeTime += _dul;
            if (
                this.beforeAnime != this.currentAnime &&
                this.AttakingStep == 0
            ) {
                this.animeTime = 0;
            }
            // Engine.content.assets['mixers'][this.assetName].update(_dul);
            if (this.mixer != null) {
                this.mixer.update(_dul);
            }
        }
    }

    stateChange(_next) {
        if (_next != this.state) {
            if (this.state && this.state.changeCallBack) {
                this.state.changeCallBack();
            }
        }
        if (_next) {
            this.state = _next;
        }
        this.onChangeStateFrame = true;
    }

    /**
     *
     * @param { String } _state  変化先のステータス名
     */
    setMoveState(_stateName, _forceFlag) {
        if (_stateName != this.state.name || _forceFlag) {
            this._setMoveState(_stateName);
        }
    }

    /**
     *
     * @param {*} _state
     * 外部からはアクセスしない。継承元クラスで中身を描く
     */
    // eslint-disable-next-line no-unused-vars
    _setMoveState(_state) {}

    /**
     *
     * @param { String } _state  変化先のステータス名
     */
    setAttackState(_stateName, _forceFlag) {
        if (_stateName != this.state.name || _forceFlag) {
            this._setAttackState(_stateName);
        }
    }

    /**
     *
     * @param {*} _state
     * 外部からはアクセスしない。継承元クラスで中身を描く
     */
    // eslint-disable-next-line no-unused-vars
    _setAttackState(_state) {}

    changeAnimation(_anime, _fouce) {
        if (this.currentAnime == _anime && !_fouce) {
            return;
        }
    }

    setMoveStartFromInput(_vect2, _power) {
        if (this.AttakingStep == 0) {
            this.moveV2.copy(_vect2);
            this.stickFactor = _power;
        }
    }

    setStopfromInput() {
        if (this.AttakingStep == 0) {
            this.moveV2.set(0, 0);
            this.stickFactor = 0;
        }
    }

    // eslint-disable-next-line no-unused-vars
    movingUpdate(_map) {
        this.movePower = this.moveState.getMovePower(this.stickFactor);
        if (this.movePower != 0 && (this.moveV2.x != 0 || this.moveV2.y != 0)) {
            const moveVect = new THREE.Vector3();
            moveVect.x = this.moveV2.x * this.movePower;
            moveVect.z = this.moveV2.y * this.movePower;
            /*
      const moveChecker = Engine.checkMoveGround(_map, this.Asset, moveVect);

      if (moveChecker.isHit) {
        this.Asset.position.x += moveChecker.revisedVector.x;
        this.Asset.position.z += moveChecker.revisedVector.z;
        this.Asset.position.y = moveChecker.height;
      }
      */

            // 向き
            const angle = gameMath.limitPi(
                Math.atan2(-this.moveV2.x, -this.moveV2.y)
            );
            gameMath.setLookAngleY(this.Asset, angle);

            /*
      if (this.AttakingStep < 0) {
        // エフェクト
        const tmpP3 = new THREE.Vector3();
        tmpP3.copy(this.Asset.position);
        tmpP3.y += 1.0 + Math.random() - 0.5;
        tmpP3.x += Math.random() - 0.5;
        tmpP3.z += Math.random() - 0.5;
        moveVect.normalize();
        if (this.movePower > 0.3) {
          Engine.gameScene.jenP1.appearsParticle(1, {
            basePos: tmpP3,
            vect: moveVect,
            speed: -this.movePower,
            explose: 0.0,
            scale: 0.2,
            scaleRandom: 0.03,
            lifeTimeFactor: 2.0 - this.movePower
          });
        }

        this.movePower = this.movePower * 0.85;
        if (this.movePower < 0.1) {
          this.movePower = 0;
          this.setAttack(0);
        }
      }
      */
        }
    }

    setDashFromInput(ev) {
        if (this.AttakingStep >= 0) {
            this.moveV2.set(ev.deltaX, ev.deltaY);
            this.moveV2.normalize();
            this.movePower = 1.0;
            this.AttakingStep = -1;

            this.changeAnimation(this.Anime.kamae);
        }
    }
}
