
window.editableUi = {};

window.editableUi.editGroup = "";

window.editableUi.hide = function(_id){
    const tgt = window.document.getElementById(_id);
    if(tgt){
        window.editableUi._hideElement(_tgt);
    }
}

window.editableUi.replaceableJsStr = "ui_using";
window.editableUi.editableContentStr = "editableContent";

window.editableUi._hideElement = function(_tgt){
    _tgt.style.display = "none";
}


window.editableUi.visible = function(_id){
    const tgt = window.document.getElementById(_id);
    if(tgt){
        window.editableUi._visibleElement(tgt);
    }
}

window.editableUi._visibleElement = function(_tgt){
    _tgt.style.display = "inherit";
}

/**
 * 別のHTMLファイルを取得する
 */
window.editableUi.getHtml = function(_uri){
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open('GET', _uri, true);
        req.onload = function() {
          if (req.status === 200 || (req.status === 0  && req.responseText.length > 0)) {
            const parser = new DOMParser();
            resolve({stat : "ok", data:parser.parseFromString(req.responseText, "text/html") });
          } else {
            reject(new Error({stat : "ng", data:req.statusText}));
          }
        };
        req.onerror = function() {
          reject(new Error({stat : "ng", data:req.statusText}));
        };
        req.send();
      });
}

/**
 * 指定したIDのElementの内容を、別のHTMLファイルのBody以下で置き換える
 */
window.editableUi.replaseElement = function(_id, _url){
    const tgt = window.document.getElementById(_id);
    if(tgt){
        window.editableUi._hideElement(tgt);
    } else {
        return;
    }
    window.editableUi.getHtml(_url).then((_response)=>{
        if(tgt){
            tgt.innerHTML = _response.data.getElementById(window.editableUi.editableContentStr).innerHTML;         
              
            window.editableUi._visibleElement(tgt);

            //jsも置き換え
            const Jstgt = window.document.getElementById(window.editableUi.replaceableJsStr);
            if(Jstgt){
                document.getElementsByTagName('head')[0].removeChild( Jstgt );
                delete Jstgt;
            } 
            
            const script = document.createElement('script');
            script.id = window.editableUi.replaceableJsStr;
            const replaceJs = _response.data.getElementById(window.editableUi.replaceableJsStr);
            if(replaceJs){
                script.textContent = replaceJs.textContent;    
                document.getElementsByTagName('head')[0].appendChild(script); 
            }
            
            console.log("end replaseElement");
        }
    });
    console.log("out replaseElement");
}

/***
 * 
 * ここの役割は、イベントで飛んで来たHTMLのエレメントなどの値を、変更値に適用するまでの中間加工
 */

window.editableUi.changeHair_f = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "hf", parseInt(_val));
}
window.editableUi.changeHair_b = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "hb", parseInt(_val));
}
window.editableUi.changeHair_c = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "hc", _val);
}
/////////
window.editableUi.changeEye_c = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "ec", _val);
}
window.editableUi.changeEye_h = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "eh", _val);
}
window.editableUi.changeEye_b = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "eb", _val);
}

window.editableUi.changeEye_t = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "et", _val);
}
window.editableUi.changeEye_tv = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "ev", _val);
}
window.editableUi.changeEye_ex = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "ex", _val);
}

window.editableUi.changeEye_m = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "bt", _val);
}
window.editableUi.changeEye_mv = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "bv", _val);
}
///
window.editableUi.changeMouse_t = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "mt", _val);
}
window.editableUi.changeMouse_tv = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "mv", _val);
}

window.editableUi.changeFace_ceek = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "rr", _val);
}
window.editableUi.changeFace_gaan = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "gn", _val);
}
///
window.editableUi.changeBody_c = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "bc", _val);
}

window.editableUi.changeBody_bast = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "bst", _val);
}
///
window.editableUi.changeOuter_c = function(_tgt, _val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "w" + _tgt, _val);
}

window.editableUi.changeOuter_t = function(_tgt){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "wmt", _tgt);
}

window.editableUi.changeOuter_tv = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "wmv", _val);
}
///
window.editableUi.changeInner_c = function(_tgt, _val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "p" + _tgt, _val);
}
window.editableUi.changeInner_t = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "pt", _val);
}
///
window.editableUi.changeHand_l_t = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "ltt", _val);
}
window.editableUi.changeHand_l_a = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "lat", _val);
}
window.editableUi.changeHand_r_t = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "rtt", _val);
}
window.editableUi.changeHand_r_a = function(_val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, "rat", _val);
}

window.editableUi.changeHand_v = function(_tgt, _val){
    Engine.gameScene.editableSetting.change(window.editableUi.editGroup, _tgt, _val);
}
///
window.editableUi.changePose = function(_tgt){
    Engine.gameScene.editableSetting.change("", "p", _tgt);
}


