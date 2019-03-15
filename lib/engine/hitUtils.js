Engine.checkMoveGround = function(_ground, _object, _vector) {
    let moveLength = _vector.length();
    const hitRadius = _object.boundingSphere
        ? _object.boundingSphere.radius * _object.scale.z
        : _object.geometry.boundingSphere.radius * _object.scale.z;
    const tmpV = new THREE.Vector3();
    tmpV.copy(_vector);

    // まず、キャラの移動先に、「床」があるかどうかチェック
    tmpV.add(_object.position);

    // 高さの半分の半分くらいを、許容高さとしてみるが。
    if (_object.boundingBox) {
        tmpV.y += _object.boundingBox.max.y * 1.5 * _object.scale.y;
    } else {
        if (_object.geometry.boundingBox) {
            tmpV.y +=
                _object.geometry.boundingBox.max.y * 1.5 * _object.scale.y;
        }
    }

    // eslint-disable-next-line no-undef
    const ray1 = new THREE.Raycaster(tmpV, gameMath.HitAxisY);
    const hit1 = ray1.intersectObject(_ground);
    // なければ、その時点でアウト
    if (hit1 == null || hit1.length == 0) {
        return { isHit: false, height: null, revisedVector: null };
    }

    // その後、その床までに、壁がないかどうかチェック
    const tmpV2 = new THREE.Vector3();
    tmpV2.copy(_vector);
    tmpV2.normalize();
    tmpV2.y = 0.5; // ナナメ45度上に向かうベクトル
    tmpV2.normalize();

    const ray2 = new THREE.Raycaster(tmpV, tmpV2);
    const hit2 = ray2.intersectObject(_ground);

    if (hit2 != null && hit2.length > 0) {
        hit2.sort(function(a, b) {
            return a.distance > b.distance;
        });

        // 距離を見て、移動ベクトル長より短い点があったら、壁に当たったとする。
        if (hit2[0].distance < moveLength) {
            // 壁までの位置で、Vectorを補正する
            moveLength = hit2[0].distance;
        }

        if (hit2[0].distance < hitRadius) {
            moveLength = 0;
        }
    }

    // 移動可能な高さの床があった、という判断。
    // 高さが複数あった場合は、一番高い点にする
    if (hit1.length > 1) {
        hit1.sort(function(a, b) {
            return a.point.y > b.point.y;
        });
    }

    return {
        isHit: true,
        height: hit1[0].point.y,
        revisedVector: tmpV2.multiplyScalar(moveLength),
    };
};
