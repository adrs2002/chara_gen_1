import { gltfAsset } from './gltfAsset.js';

export class animeBaseAsset extends gltfAsset {
    constructor(_suf) {
        super('animeBaseObject' + _suf, 'anime/composeTest.glb');
    }
    use() {
        return super.use();
    }
}

export class animeAsset extends gltfAsset {
    constructor(_name, _path) {
        super(_name, 'anime/' + _path + '.glb');
    }
    use() {
        return super.use();
    }
}

export class faceAsset extends gltfAsset {
    constructor(_suf) {
        super('faceObject' + _suf, 'model/faces.glb');
    }
    use() {
        return super.use();
    }
}

export class exFaceAsset extends gltfAsset {
    constructor(_suf) {
        super('exFaceAsset' + _suf, 'model/faces_ex.glb');
    }
    use() {
        return super.use();
    }
}

export class selectableAsset extends gltfAsset {
    constructor(_name, _path) {
        super(_name, 'model/' + _path + '.glb');
    }
    use() {
        return super.use();
    }
}

export class bodyAsset extends gltfAsset {
    constructor(_name, _path) {
        super(_name, 'model/' + _path + '.glb');
    }
    use() {
        return super.use();
    }
}

export class HukuAsset extends gltfAsset {
    constructor(_name, _path) {
        super(_name, 'model/' + _path + '.glb');
    }
    use() {
        return super.use();
    }
}

export class hairAsset extends gltfAsset {
    constructor(_name, _path) {
        super(_name, 'model/' + _path + '.glb');
    }
    use() {
        return super.use();
    }
}
