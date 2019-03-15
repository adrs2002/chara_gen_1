import baseShaderdObject from './baseShaderdObject';

export default class bodyObject extends baseShaderdObject {
    constructor(_parent, _bodyAsset) {
        super(_parent);
        this.bodyObj = _bodyAsset.getMeshbyName('chara1');

        this.bodyObj.position.set(0, 0, 0);

        this.mopthArray = [];
        _bodyAsset.seachShape(this.bodyObj, this.mopthArray);

        super.initMopthDictionaryArray();

        /*
          window.skeletonHelper = new THREE.SkeletonHelper( this.bodyObj );
          window.skeletonHelper.material.linewidth = 2;
          Engine.scene.add(  window.skeletonHelper );    
    */

        this.ColArray = [];
        this.ColArray.push(
            new THREE.Vector3().copy(this.parent.col_BodyColor_Base)
        ); //固定・ノーマル肌

        for (let i = 0; i < 8 - 1; i++) {
            const col = new THREE.Vector3(
                Math.random(),
                Math.random(),
                Math.random()
            );
            if (col.length() > 1.6 || col.length() < 0.4) {
                col.normalize();
            }
            this.ColArray.push(col);
        }

        this.setMeinMeshMaterial();

        super.addParent(this.bodyObj);
    }

    setMeinMeshMaterial() {
        const tgt = super._getMatbyName(this.bodyObj, 'mat_bodyBase');

        if (tgt) {
            tgt.material = this.parent.InnerMaterialBase;

            tgt.onBeforeRender = super.getOnBeforeRender;
            tgt.onAfterRender = super.getOnAfterRender;
        }
    }

    changeVal_Hand(_val, _lrSuffix, _setType) {
        const sutSetType = _setType.substr(0, 7);
        for (let m = 0; m < this.mopthArray.length; m++) {
            for (let i = 0; i < this.mopthDictionaryArray[m].length; i++) {
                if (this.mopthDictionaryArray[m][i].endsWith(_lrSuffix)) {
                    //左右判断
                    if (
                        this.mopthDictionaryArray[m][i].startsWith(sutSetType)
                    ) {
                        //Type判断

                        if (
                            this.mopthDictionaryArray[m][i].startsWith(_setType)
                        ) {
                            this.mopthArray[m].morphTargetInfluences[i] = _val;
                        } else {
                            this.mopthArray[m].morphTargetInfluences[i] = 0.0;
                        }
                    }
                }
            }
        }
    }

    changeVal_bastSize(_val, _type) {
        super.initArrayedMopth(
            Engine.gameScene.editableSetting.editableItems.bastSize,
            this.mopthArray
        );
        super.setMopth(_val, _type, this.mopthArray);
    }
}
