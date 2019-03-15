
window.uiBase = {};

window.uiBase.hide = function(_id){
    const tgt = window.document.getElementById(_id);
    if(tgt){
        window.uiBase._hideElement(_tgt);
    }
}

window.uiBase.replaceableJsStr = "ui_using";
window.uiBase.editableContentStr = "editableContent";

window.uiBase._hideElement = function(_tgt){
    _tgt.style.display = "none";
}


window.uiBase.visible = function(_id){
    const tgt = window.document.getElementById(_id);
    if(tgt){
        window.uiBase._visibleElement(tgt);
    }
}

window.uiBase._visibleElement = function(_tgt){
    _tgt.style.display = "inherit";
}

/**
 * 別のHTMLファイルを取得する
 */
window.uiBase.getHtml = function(_uri){
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
window.uiBase.replaseElement = function(_id, _url){
    const tgt = window.document.getElementById(_id);
    if(tgt){
        window.uiBase._hideElement(tgt);
    } else {
        return;
    }
    window.uiBase.getHtml(_url).then((_response)=>{
        if(tgt){
            tgt.innerHTML = _response.data.getElementById(window.uiBase.editableContentStr).innerHTML;           
            window.uiBase._visibleElement(tgt);

            //jsも置き換え
            const Jstgt = window.document.getElementById(window.uiBase.replaceableJsStr);
            if(Jstgt){
                document.getElementsByTagName('head')[0].removeChild( Jstgt );
                delete Jstgt;
            } 
            
            const script = document.createElement('script');
            script.id = window.uiBase.replaceableJsStr;
            const replaceJs = _response.data.getElementById(window.uiBase.replaceableJsStr);
            if(replaceJs){
                script.textContent = replaceJs.textContent;    
                document.getElementsByTagName('head')[0].appendChild(script); 
            }
            
            console.log("end replaseElement");
        }
    });
    console.log("out replaseElement");
}