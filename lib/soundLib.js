
const Sounds = {};

Sounds.voiceTogl = false;
Sounds.keys = [];
Sounds.Sounds = [];
Sounds.BGMSouce = null;
Sounds.gainNode = null;
Sounds.BGMLoaded = false;
Sounds.BGMLoading = false;
Sounds.load = false;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// data url scheme を buffer に変換
Sounds.data2buffer = function(data) {
  const byteString = atob(data.split(',')[1])
  const len = byteString.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; ++i) {
    buffer[i] = byteString.charCodeAt(i);
  }
  return buffer.buffer;
};

Sounds.setSound = function(_sounds) {
  Sounds.gainNode = audioContext.createGain();
  
  Sounds.keys = Object.keys(_sounds);
  for (let i = 0; i < Sounds.keys.length; i++) {
    audioContext.decodeAudioData(Sounds.data2buffer(_sounds[Sounds.keys[i]]), function(buf) {
      Sounds.Sounds[Sounds.keys[i]] = buf;
    });
  }
  // Connect the gain node to the destination.
  Sounds.gainNode.connect(audioContext.destination);

  Sounds.load = true;
}

Sounds.setBGM = function(_bgmStr) {
  Sounds.BGMSouce = audioContext.createBufferSource();
  // バッファをセット
  Sounds.BGMSouce.buffer = _bgmStr;
  // context を connect
  Sounds.BGMSouce.connect(audioContext.destination);
  Sounds.BGMSouce.connect(Sounds.gainNode);
  Sounds.BGMLoaded = true;

  if (typeof BgmLoadedCallback === "function") {
    BgmLoadedCallback();
  }
}

/* 演奏開始位置＆ボリュームのリセット */
Sounds.initSound = function() {
  for (let i = 0; i < Sounds.keys.length; i++) {
    Sounds.Sounds[Sounds.keys[i]].currentTime = 0;
    Sounds.Sounds[Sounds.keys[i]].volume = 0;
  }
}

/* On/Offの二択で音量を分ける */
Sounds.setOnOff = function(_flg) {
  Sounds.voiceTogl = _flg;
  // これ、gain って加算倍率か！　0 = 原音ボリューム、　-1で音量ゼロということ
  Sounds.gainNode.gain.value = _flg ? 0 : -1;
}

Sounds.Play = function(_key) {
  if (Sounds.voiceTogl) {
    const source = audioContext.createBufferSource();
    // バッファをセット
    source.buffer = Sounds.Sounds[_key];
    // context を connect
    source.connect(audioContext.destination);
    // play
    source.start(0);
  }
}

Sounds.BgmPlay = function() {
  Sounds.BGMSouce.start(0);
}

Sounds.BgmStop = function() {
  Sounds.BGMSouce.stop(0);
}


Sounds.Stop = function(_key) {

}
