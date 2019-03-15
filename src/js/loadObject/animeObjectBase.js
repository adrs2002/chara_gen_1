export default class animeObjectBase {
    constructor(_animeAsset) {
        this.animations = _animeAsset.animations;

        this.dumyBones = _animeAsset.gltfData.scene.children[0];
        this.dumyBones.visible = false;
    }
}
