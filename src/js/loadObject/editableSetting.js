export default class editableSetting {
    constructor() {
        /* THANKS to:http://phiary.me/javascript-url-parameter-query-string-parse-stringify/ */
        this.QueryString = {
            parse: function(text, sep, eq, isDecode) {
                text = text || location.search.substr(1);
                sep = sep || '&';
                eq = eq || '=';
                var decode = isDecode
                    ? decodeURIComponent
                    : function(a) {
                          return a;
                      };
                return text.split(sep).reduce(function(obj, v) {
                    var pair = v.split(eq);
                    obj[pair[0]] = decode(pair[1]);
                    return obj;
                }, {});
            },
            stringify: function(value, sep, eq, isEncode) {
                sep = sep || '&';
                eq = eq || '=';
                var encode = isEncode
                    ? encodeURIComponent
                    : function(a) {
                          return a;
                      };
                return Object.keys(value)
                    .map(function(key) {
                        return key + eq + encode(value[key]);
                    })
                    .join(sep);
            },
        };

        //選択可能なオブジェクトをココて定義
        this.editableItems = {
            hair_f: ['hair_f_1', 'hair_f_2', 'hair_f_3', 'hair_f_6'],

            hair_b: ['hair_b_1', 'hair_b_2', 'hair_b_3', 'hair_b_5'],

            bastSize: [
                {
                    text: '',
                    value: 'body_Hinnyu',
                },
                {
                    text: '',
                    value: 'body_Kyonyu',
                },
            ],

            handMopth_all: [
                {
                    text: '標準',
                    value: 'Hand_1234_hiraki_999',
                }, //最後の数値部分だけありえない数値にすると、他のクリアとなる。
                {
                    text: '開き１',
                    value: 'Hand_1234_hiraki_1',
                },
            ],

            handMopth_0: [
                {
                    text: '標準',
                    value: 'Hand_0_hiraki_999',
                }, //最後の数値部分だけありえない数値にすると、他のクリアとなる。
                {
                    text: '開き１',
                    value: 'Hand_0_hiraki_1',
                },
            ],

            outerMopth: [
                {
                    text: '標準',
                    value: 's_aki_999',
                }, //最後の数値部分だけありえない数値にすると、他のクリアとなる。
                {
                    text: '開き１',
                    value: 's_aki_1',
                },
                {
                    text: '開き２',
                    value: 's_aki_2',
                },
            ],

            mzgTex: ['inner_tex0', 'inner_tex1', 'inner_tex2'],

            pose: ['pose_0', 'pose_1'],

            /*
      type系列は、textを空文字、Valueにモーフ名を入れると、選択不能だが値の一括変更の対象にできる、という形になる
      */
            eye_type: [
                {
                    text: '標準',
                    value: '',
                },

                {
                    text: 'ウィンクA・左',
                    value: 'eye_close_1_L',
                },
                {
                    text: 'ウィンクA・右',
                    value: 'eye_close_1_R',
                },
                {
                    text: 'にっこり',
                    value: 'eye_close_1_W',
                },

                {
                    text: 'ウィンクB・左',
                    value: 'eye_close_2_L',
                },
                {
                    text: 'ウィンクB・右',
                    value: 'eye_close_2_R',
                },
                {
                    text: '閉じ目',
                    value: 'eye_close_2_W',
                },

                {
                    text: '上を見る',
                    value: 'eye_look_up',
                },
                //{text:"下を見る", value:"eye_look_down"},
                {
                    text: '左を見る',
                    value: 'eye_look_Left',
                },
                {
                    text: '右を見る',
                    value: 'eye_look_Right',
                },

                {
                    text: '驚く',
                    value: 'eye_small_W',
                },

                {
                    text: '',
                    value: 'ExEye_1',
                },
                {
                    text: '',
                    value: 'ExEye_2',
                },
            ],

            ExEye_type: [
                {
                    text: 'なし',
                    value: '',
                },

                {
                    text: '嬉しすぎ',
                    value: 'ExEye_1',
                },
                {
                    text: '白目…',
                    value: 'ExEye_2',
                },
            ],

            mayu_type: [
                {
                    text: '標準',
                    value: '',
                },

                {
                    text: '左上がり',
                    value: 'mayu_agari_L',
                },
                {
                    text: '右上がり',
                    value: 'mayu_agari_R',
                },
                {
                    text: '両上がり',
                    value: 'mayu_agari_W',
                },
                {
                    text: '左下がり',
                    value: 'mayu_sagari_L',
                },
                {
                    text: '右下がり',
                    value: 'mayu_sagari_R',
                },
                {
                    text: '両下がり',
                    value: 'mayu_sagari_W',
                },
            ],

            mouth_type: [
                {
                    text: '標準',
                    value: 'mouth_close_s_0',
                },

                /*{text:"", value:"mouth_close_s_0"},*/
                {
                    text: 'スマイル１',
                    value: 'mouth_close_s_1',
                },
                {
                    text: '不機嫌１',
                    value: 'mouth_close_s_2',
                },
                {
                    text: '不機嫌２',
                    value: 'mouth_close_s_3',
                },
                {
                    text: 'スマイル２',
                    value: 'mouth_open_s_1',
                },
                {
                    text: '「お」',
                    value: 'mouth_open_s_3',
                },
                {
                    text: '「あ」',
                    value: 'mouth_open_B_0',
                },
                {
                    text: '',
                    value: 'mouth_open_B_1',
                },
                {
                    text: 'スマイル３',
                    value: 'mouth_open_B_2',
                },
                {
                    text: '不機嫌３',
                    value: 'mouth_open_B_3',
                },
                {
                    text: '叫び１',
                    value: 'mouth_open_B_4',
                },
            ],
        };

        this.setting = {
            bc1: 'ffffff',
            bc2: 'ffffff',
            bc3: 'ffffff',
            p: 0,

            //c1//////
            c1: null,

            c2: null,
        };
    }

    setFromURLStr() {
        this.setting = QueryString.parse();
    }

    putURLStr() {
        return QueryString.stringify(this.setting);
    }

    change(_grp, _type, _val) {
        if (_type === 'bc1') {
            Engine.gameScene.backGround.changeCol_1(_val);
            return;
        }
        if (_type === 'bc2') {
            this.setting.bc2 = _val;
            Engine.gameScene.backGround.changeCol_2(_val);
            return;
        }
        if (_type === 'bc3') {
            this.setting.bc3 = _val;
            Engine.gameScene.backGround.changeCol_3(_val);
            return;
        }

        if (_type === 'p') {
            this.setting.p = _val;
            Engine.gameScene.changePose(_val);
            return;
        }

        if (_grp === 'c2') {
            Engine.gameScene.girl2.changeEdiSetting(_type, _val);
            return;
        }

        if (_grp === 'c1') {
            Engine.gameScene.girl1.changeEdiSetting(_type, _val);
            return;
        }
    }
}

/*** キャラ1体ごとのセッティング */
export class charaSettings {
    constructor() {
        //c1//////
        /*** 前髪形状 */
        this.hf = 0;
        /*** 後ろ髪形状 */
        this.hb = 0;
        /*** 髪の色 */
        this.hc = new THREE.Color();

        /*** 目の色 */
        this.ec = new THREE.Color();
        /*** ツリ目 (hard eye らしい)*/
        this.eh = 0;
        /*** 目の細さ */
        this.eb = 0;
        /*** 表情たいぷ */
        this.et = 0;
        /*** 表情value */
        this.ev = 0;
        /*** 眉毛タイプ */
        this.bt = 0;
        /*** 眉毛value */
        this.bv = 0;

        /*** 口タイプ*/
        this.mt = 0;
        /*** 口 value*/
        this.mv = 0;
        /*** ほほの赤 value*/
        this.rr = 0;
        /*** ガーン色 value*/
        this.gn = 0;
        /*** 特殊目 type*/
        this.xe = 0;

        /*** 服の色 */
        this.wc1 = new THREE.Color();
        /*** 服の色 */
        this.wc2 = new THREE.Color();
        /*** 服の色 */
        this.wc3 = new THREE.Color();
        /*** 服の色 */
        this.wc4 = new THREE.Color();
        /*** 服の色 */
        this.wc5 = new THREE.Color();

        /*** 服のモーフtype*/
        this.wmt = 0;
        /*** 服のモーフvalue*/
        this.wmv = 0;

        /*** 体の色（赤身 */
        this.bc = 0;
        /*** 胸値*/
        this.bst = 1; /* -1 to 0 to +1 */

        /*** 右手全体*/
        this.rat = 0;
        /*** 右手全体 value*/
        this.rav = 0;
        /*** 右手親指*/
        this.rtt = 0;
        /*** 右手親体 value*/
        this.rtv = 0;

        /*** 左手全体*/
        this.lat = 0;
        /*** 左手全体 value*/
        this.lav = 0;
        /*** 左手親指*/
        this.ltt = 0;
        /*** 左手親体 value*/
        this.ltv = 0;

        /*** pnt*/
        this.pt = 0;
        this.pc1 = new THREE.Color();
        this.pc2 = new THREE.Color();
        this.pc3 = new THREE.Color();
        this.pc4 = new THREE.Color();
    }
}
