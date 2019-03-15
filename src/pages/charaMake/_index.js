import GameScene_base from './../../../lib/gameScene_base.js';

import editableSetting from './../../js/loadObject/editableSetting.js';
import backGround from './../../js/loadObject/glbackcolor.js';
import buildGirl from './../../js/loadObject/buildGirl.js';

// eslint-disable-next-line no-unused-vars
class charaMakeScene extends GameScene_base {
    constructor() {
        super();
        Engine.useBloom = false;
        Engine.useFXAA = true;
        Engine.reset3DScene(true);

        // 起動時に必要な読み込みオブジェクト数カウンタ
        this.loadTarget = 0;
        // 起動時に必要な読み込みオブジェクトを読み込んだ数カウンタ
        this.loadedModel = 0;

        this.editableSetting = new editableSetting();
        this.modelLoad();
        this.changed = false;

        Engine.addLight(
            new THREE.AmbientLight(new THREE.Color(0.1, 0.1, 0.01), 1)
        );
        const light1 = new THREE.DirectionalLight(
            new THREE.Color(0.9, 0.9, 1.0),
            1
        );
        light1.position.set(0.1, 5, 3).normalize();
        Engine.addLight(light1);

        this.nowCamPos = new THREE.Vector3(0, 1.4, 1.5);
        this.nowCamLookAt = new THREE.Vector3(0, 1.0, 0);
        Engine.camera.position.copy(this.nowCamPos);
        Engine.camera.lookAt(this.nowCamLookAt);
        Engine.camera.up.set(0, 1, 0);

        Engine.renderer.gammaOutput = true;

        this.stats = new Stats();
        window.document.body.appendChild(this.stats.dom);
        this.orbitBaseTarget = new THREE.Vector3();
        this.orbitExTarget = new THREE.Vector3();
        this.tmpV3 = new THREE.Vector3();

        this.uiVisible = true;
        this.firstUpdate = false;

        this.looktargetBoneName = 'chara1_Bone_mune'; //chara1_Bone_neck
        this.targetBoneId = -1;
        this.sceneId_sub = 0;
    }

    update(_delta) {
        Engine.camera.lookAt(this.nowCamLookAt);
        super._update(_delta);

        if (this.loadedModel >= this.loadTarget && this.targetBoneId > -1) {
            this.girl1.updateFrame(_delta);

            //首位置のボーンを取得
            this.tmpV3.set(0, 0, 0);
            this.orbitBaseTarget.set(0, 0, 0);
            this.girl1.skeletonBase.skeleton.bones[
                this.targetBoneId
            ].localToWorld(this.tmpV3);
            this.orbitBaseTarget.add(this.tmpV3);

            if (this.orbitBaseTarget.length() > 0) {
                this.controls.target.copy(this.orbitBaseTarget);
                this.controls.update();
            }
        }

        this.sceneControl();

        this.stats.update();
    }

    draw() {
        super._draw();
    }

    sceneControl() {
        switch (this.sceneId_sub) {
            case 0:
                this.scene_0_0();
                break;
            case 1:
                this.scene_0_1();
                break;
            case 2:
                this.scene_0_2();
                break;
            case 3:
                this.scene_0_3();
                break;
        }
    }

    modelLoad() {
        // 起動時に必要な読み込みオブジェクト数カウンタ
        this.loadTarget = 0;

        this.girl1 = new buildGirl();
        this.loadTarget++;

        this.girl1.load('_c1').then(() => {
            this.editableSetting.setting.c1 = this.girl1.EditSettings;
            this.girl1.randomInit();
            this.girl1.changeAnime('pose_0_' + this.girl1.Suf, 'pose_0_c1');
            this.loadedModel++;
        });

        this.backGround = new backGround();
        this.backGround.load(this.editableSetting);
        this.backGround.init(this.editableSetting);

        return;
    }

    changePose(_assetVal) {
        let assetName = '';
        if (isNaN(_assetVal)) {
            assetName = _assetVal;
        } else {
            assetName =
                Engine.gameScene.editableSetting.editableItems.pose[_assetVal];
        }

        this.girl1.changeAnime(
            assetName + this.girl1.Suf,
            assetName + this.girl1.Suf
        );
    }

    onTap(ev) {
        this.uiVisible = !this.uiVisible;
        ev.target.ownerDocument.getElementById('ui').style.display = this
            .uiVisible
            ? 'inherit'
            : 'none';
        this.stats.dom.style.display = this.uiVisible ? 'inherit' : 'none';
    }

    //////////////

    scene_0_0() {
        if (this.loadedModel >= this.loadTarget && !this.changed) {
            this.changed = true;
            this.sceneId_sub = 1;
            //changeScene();
            this.controls = new THREE.OrbitControls(
                Engine.camera,
                document.getElementById('c2d')
            );
            this.controls.enablePan = false;

            this.controls.minDistance = 0.5;
            this.controls.maxDistance = 1.35;
            this.controls.maxPolarAngle = 2.9; //下アングル制限
            this.controls.minPolarAngle = 0.93; //上アングル制限

            //this.controls.update();

            //this.targetBoneId
            for (
                let i = 0;
                i < this.girl1.skeletonBase.skeleton.bones.length;
                i++
            ) {
                // カメラの注視点となるボーンを探し、IDを保持しておく
                if (
                    this.girl1.skeletonBase.skeleton.bones[i].name ===
                    this.looktargetBoneName
                ) {
                    this.targetBoneId = i;
                    break;
                }
            }
        }
    }

    scene_0_1() {
        if (!this.firstUpdate) {
            this.firstUpdate = true;
            this.sceneId_sub = 2;
        }
    }

    scene_0_2() {
        window.parent.parentCall('hide_load');
        this.sceneId_sub = 3;
    }

    scene_0_3() {
        this.girl1.changeVisible(true);
        this.sceneId_sub = 4;
    }
}
