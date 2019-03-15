import baseShaderdObject from './baseShaderdObject';

export default class hairObject extends baseShaderdObject {
    constructor(_parent, _Asset, _col) {
        super(_parent);
        this.nowAssetName = _Asset.AssetName;
        this.mainMesh = _Asset.getMeshbyMatName('hair_use');
        this.exMesh = _Asset.getMeshbyMatName('edgeLine');

        this.mainMesh.position.set(0, 0, 0);

        this.ColArray = [];
        if (_col) {
            this.ColArray.push(new THREE.Vector3().copy(_col));
        } else {
            this.ColArray.push(new THREE.Vector3(1.0, 1.0, 0.0));
        }
        this.ColArray.push(new THREE.Vector3(1.0, 1.0, 1.0));

        this.setMeinMeshMaterial();
        this.setEdgeMeshMaterial();

        super.addParent(this.mainMesh);
        if (this.exMesh) {
            super.addParent(this.exMesh);
        }
    }

    remove() {
        this.parent.remove(this.mainMesh);
        this.parent.remove(this.exMesh);
    }

    setMeinMeshMaterial() {
        const tgt = super._getMatbyName(this.mainMesh, 'hair_use');

        if (tgt) {
            tgt.material = this.parent.hairMaterialBase;
        }
    }

    setEdgeMeshMaterial() {
        if (!this.exMesh) {
            return;
        }
        const tgt = super._getMatbyName(this.exMesh, 'edgeLine');

        if (tgt) {
            tgt.material = this.parent.hairMaterialEdge;
        }
    }

    changeCol_hair(_vec) {
        this.mainMesh.material.uniforms.u_v3Col1.value[0].copy(_vec);
        this.mainMesh.material.uniforms.u_v3Col1.value.needsUpdate = true;

        this.exMesh.material.uniforms.u_v3Col1.value[0].copy(_vec);
        this.exMesh.material.uniforms.u_v3Col1.value.needsUpdate = true;
    }
}
