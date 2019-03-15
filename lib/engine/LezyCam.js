/*****************/

// eslint-disable-next-line no-unused-vars
class LezyCam {
    constructor(
        _lezyFrame = 10,
        _firstPos = new THREE.Vector3(),
        _firstLookat = new THREE.Vector3()
    ) {
        this.positions = [];
        this.lookAtPositions = [];
        this.lezyFrame = _lezyFrame;
        for (let i = 0; i < _lezyFrame; i++) {
            this.positions.push([_firstPos.x, _firstPos.y, _firstPos.z]);
            this.lookAtPositions.push([
                _firstLookat.x,
                _firstLookat.y,
                _firstLookat.z,
            ]);
        }
        this.loop = _lezyFrame - 1;
        this.tmpPos = new THREE.Vector3();
        this.tmpPos2 = new THREE.Vector3();
    }

    update(_cam, _pos, _lookat) {
        this.tmpPos.set(0, 0, 0);
        this.tmpPos2.set(0, 0, 0);
        for (let i = 0; i < this.loop; i++) {
            this.positions[i][0] = this.positions[i + 1][0];
            this.positions[i][1] = this.positions[i + 1][1];
            this.positions[i][2] = this.positions[i + 1][2];
            this.tmpPos.x += this.positions[i][0];
            this.tmpPos.y += this.positions[i][1];
            this.tmpPos.z += this.positions[i][2];

            this.lookAtPositions[i][0] = this.lookAtPositions[i + 1][0];
            this.lookAtPositions[i][1] = this.lookAtPositions[i + 1][1];
            this.lookAtPositions[i][2] = this.lookAtPositions[i + 1][2];
            this.tmpPos2.x += this.lookAtPositions[i][0];
            this.tmpPos2.y += this.lookAtPositions[i][1];
            this.tmpPos2.z += this.lookAtPositions[i][2];
        }
        this.positions[this.loop][0] = _pos.x;
        this.positions[this.loop][1] = _pos.y;
        this.positions[this.loop][2] = _pos.z;
        this.tmpPos.x += _pos.x;
        this.tmpPos.y += _pos.y;
        this.tmpPos.z += _pos.z;

        this.lookAtPositions[this.loop][0] = _lookat.x;
        this.lookAtPositions[this.loop][1] = _lookat.y;
        this.lookAtPositions[this.loop][2] = _lookat.z;
        this.tmpPos2.x += _lookat.x;
        this.tmpPos2.y += _lookat.y;
        this.tmpPos2.z += _lookat.z;

        if (this.tmpPos.length() > 0) {
            this.tmpPos.x = this.tmpPos.x / this.lezyFrame;
            this.tmpPos.y = this.tmpPos.y / this.lezyFrame;
            this.tmpPos.z = this.tmpPos.z / this.lezyFrame;
        }
        if (this.tmpPos2.length() > 0) {
            this.tmpPos2.x = this.tmpPos2.x / this.lezyFrame;
            this.tmpPos2.y = this.tmpPos2.y / this.lezyFrame;
            this.tmpPos2.z = this.tmpPos2.z / this.lezyFrame;
        }

        _cam.position.copy(this.tmpPos);
        _cam.lookAt(this.tmpPos2);
    }
}
