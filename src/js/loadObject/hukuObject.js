import baseShaderdObject from './baseShaderdObject';

export default class hukuObject extends baseShaderdObject {
    constructor(_parent, _Asset) {
        super(_parent);
        this.hukuObj = _Asset.getMeshbyName('chara1');

        this.hukuObj.position.set(0, 0, 0);

        this.mopthArray = [];
        _Asset.seachShape(this.hukuObj, this.mopthArray);

        super.initMopthDictionaryArray();

        this.setMeinMeshMaterial();

        super.addParent(this.hukuObj);
    }

    setMeinMeshMaterial() {
        const tgt = super._getMatbyName(this.hukuObj, 'mat_hukuBase');

        if (tgt) {
            tgt.material = this.parent.OuterMaterialBase;

            tgt.onBeforeRender = super.getOnBeforeRender;
            tgt.onAfterRender = super.getOnAfterRender;
        }
    }

    changeVal_Outer(_val, _setType) {
        super.initArrayedMopth(
            Engine.gameScene.editableSetting.editableItems.outerMopth,
            this.mopthArray
        );
        super.setMopth(_val, _setType, this.mopthArray);

        /*
        const sutSetType = _setType.substr(0, 5);

        for (let m = 0; m < this.mopthArray.length; m++) {
          for (let i = 0; i < this.mopthDictionaryArray[m].length; i++) {

            if (this.mopthDictionaryArray[m][i].startsWith(sutSetType)) { //Type判断

              if (this.mopthDictionaryArray[m][i].startsWith(_setType)) {
                this.mopthArray[m].morphTargetInfluences[i] = _val;
              } else {
                this.mopthArray[m].morphTargetInfluences[i] = 0.0;
              }

            }

          }

        }
        */
    }

    changeVal_bastSize(_val, _type) {
        super.initArrayedMopth(
            Engine.gameScene.editableSetting.editableItems.bastSize,
            this.mopthArray
        );
        super.setMopth(_val, _type, this.mopthArray);
    }
}
