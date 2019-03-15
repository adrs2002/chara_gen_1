//import * as THREE from './../../../node_modules/three/build/three.module';

export class gltfAsset {
    // eslint-disable-next-line no-unused-vars
    constructor(_assetName, _url, _opt) {
        this.loader = new THREE.GLTFLoader(Engine.manager);
        if (_assetName) {
            this.AssetName = _assetName;
        }
        if (_url) {
            this.url = Engine.contentDir + _url;
        }

        this.meshes = null;
        this.animations = null;

        this.gltfData = null;
    }

    load(_assetName /*, _fource = true*/) {
        if (_assetName) {
            this.AssetName = _assetName;
        }

        return new Promise(resolve => {
            if (Engine.content.assets[_assetName]) {
                this.ExtractObject(Engine.content.assets[this.AssetName]);
                return resolve(null);
            } else {
                this.loader.load(this.url, data => {
                    this.setCotentAsset(data);
                    data = null;
                    this.ExtractObject(Engine.content.assets[this.AssetName]);
                    return resolve(null);
                });
            }
        });

        /*
      return new Promise((resolve, reject) => {
      this.loader.load(this.url, (data) => {
          this.gltfData = data;

          return resolve();
        });          
      });
*/
    }

    //必ず継承先でオーバーライド
    /**
     * 不要&必要なオブジェクトで選別する
     */
    setCotentAsset(_data) {
        if (_data.animations && _data.animations.length > 0) {
            Engine.content.assets[this.AssetName] = _data;
            return;
        }

        if (
            _data.scene &&
            (_data.scene.children[0].type === 'Group' ||
                _data.scene.children[0].type === 'Object3D')
        ) {
            Engine.content.assets[this.AssetName] = _data.scene.children[0];
        }
    }

    // eslint-disable-next-line no-unused-vars
    ExtractObject(_asset) {
        if (
            Engine.content.assets[this.AssetName].animations &&
            Engine.content.assets[this.AssetName].animations.length > 0
        ) {
            this.animations = Engine.content.assets[this.AssetName].animations;
            this.gltfData = Engine.content.assets[this.AssetName];
            return;
        }

        if (
            Engine.content.assets[this.AssetName].type === 'Group' ||
            Engine.content.assets[this.AssetName].type === 'Object3D'
        ) {
            this.meshes = Engine.content.assets[this.AssetName];
        }
    }

    getMeshbyName(_name) {
        if (this.meshes) {
            return this._getObjectByName(this.meshes, _name);
        } else {
            return null;
        }
    }

    getMeshbyMatName(_name) {
        if (this.meshes) {
            return this._getMatbyName(this.meshes, _name);
        } else {
            return null;
        }
    }

    seachShape(_o, _array) {
        if (_o.type.toLowerCase().indexOf('mesh') > -1) {
            if (_o.morphTargetDictionary) _array.push(_o);
        }

        if (_o.children && _o.children.length > 0) {
            for (let i = 0; i < _o.children.length; i++) {
                this.seachShape(_o.children[i], _array);
            }
        }
    }

    /*
      ボーンの名前を置き換える。
      Three.jsでも、アニメーションは「アニメーションキーの名称」と「ボーン名」をAnimationMixerのバインド時に合致させているため、
      あわせる必要がある。
      ここで書き直しているのは、Blender側での「アーマチュア名」になる。全ファイルで一致していれば、この作業は必要ない。
    */
    setNameToBone(_o, _name) {
        const nowMesh = this.getMesh(_o);
        //最初の _ を探す
        const firstUnder = nowMesh.skeleton.bones[0].name.indexOf('_');
        for (let i = 0; i < nowMesh.skeleton.bones.length; i++) {
            nowMesh.skeleton.bones[i].name =
                _name + nowMesh.skeleton.bones[i].name.substr(firstUnder);
        }
    }

    ////////////

    getMesh(_o) {
        let refO = null;

        if (_o.type.toLowerCase().indexOf('mesh') > -1) {
            return _o;
        }

        for (let i = 0; i < _o.children.length; i++) {
            refO = this.getMesh(_o.children[i]);
            if (refO) {
                break;
            }
        }
        return refO;
    }

    _getMeshbyName(_name) {
        if (this.gltfData && this.gltfData.scene) {
            return this._getObjectByName(this.gltfData.scene, _name);
        } else {
            return null;
        }
    }

    _getMeshbyMatName(_name) {
        if (this.gltfData && this.gltfData.scene) {
            return this._getMatbyName(this.gltfData.scene, _name);
        } else {
            return null;
        }
    }

    _getObjectByName(_o, _name) {
        let refO = null;

        if (_o.name.indexOf(_name) > -1) {
            return _o;
        }

        for (let i = 0; i < _o.children.length; i++) {
            refO = this._getObjectByName(_o.children[i], _name);
            if (refO) {
                break;
            }
        }
        return refO;
    }

    _getMatbyName(_o, _name) {
        let refO = null;

        if (_o.material && _o.material.name.indexOf(_name) > -1) {
            return _o;
        }

        if (_o.materials) {
            for (let i = 0; i < _o.materials.length; i++) {
                refO = this._getMatbyName(_o.materials[i], _name);
                if (refO) {
                    return refO;
                }
            }
        }

        for (let i = 0; i < _o.children.length; i++) {
            refO = this._getMatbyName(_o.children[i], _name);
            if (refO) {
                return refO;
            }
        }

        return refO;
    }
}
