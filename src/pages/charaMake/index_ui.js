// Index画面共通UI編集メソッド関連

window.index_ui = {};

window.index_ui.replacePicker = function() {
    //pickrを一部乗っ取る。Ver変わったら使えないぞきっと
    window.ui_using.pickrElements = document.querySelectorAll('.pcr-app');
    //console.log(window.ui_using.pickrElements.length);
    window.ui_using.pickrElements.forEach(function(userItem) {
        userItem.style.position = 'fixed';
        userItem.style.marginLeft = '50vw';
        userItem.style.marginTop = '50vh';
        userItem.style.left = '-11em';
        userItem.style.top = '0';
        //console.log('replaced ' + userItem.style.left);
    });
};

/**
 * 対の配列になったエレメントから、１つの要素のみを表示する。
 */
window.index_ui.setVisibleOne = function(_tgt, _array, _array2) {
    for (let i = 0; i < _array.length; i++) {
        if (i === _tgt) {
            _array[i].style.display = 'inherit';
        } else {
            _array[i].style.display = 'none';
        }
    }

    if (_array2) {
        window.index_ui.setSelectingColor(_tgt, _array2);
    }
};

//配列の要素の１つを選択状態、残りを選択解除状態にする
window.index_ui.setSelectingColor = function(_selId, _array) {
    for (let i = 0; i < _array.length; i++) {
        if (i === _selId) {
            _array[i].classList.add('selecting');
        } else {
            _array[i].classList.remove('selecting');
        }
    }
};

window.index_ui.makeComboBox = function(_elm, _array, _addNum) {
    for (let i = 0; i < _array.length; i++) {
        const option = new Option(
            (_addNum ? i.toString().padStart(2, '0') + '：' : '') +
                _array[i].text,
            _array[i].value,
            i === 0
        );
        _elm.appendChild(option);
    }
};

window.index_ui.makeImaegSelectBox = (
    _array,
    _baseElm,
    _dataAtt,
    _func,
    _valueSlider,
    _isText
) => {
    const makedArray = [];
    let added = 0;
    for (let c_i = 0; c_i < _array.length; c_i++) {
        if (_array[c_i].text != undefined && _array[c_i].text.length === 0) {
            continue;
        }

        const elm_adding = document.createElement('span');
        if (_isText) {
            elm_adding.textContent = _array[c_i].text;
        } else {
            elm_adding.textContent = (added + 1).toString().padStart(2, '0');
        }

        elm_adding.classList.add('editable_text_1');
        elm_adding.classList.add('bdr_lerf');
        elm_adding.setAttribute('byindex', added);
        elm_adding.setAttribute(
            _dataAtt,
            _array[c_i].value ? _array[c_i].value : c_i
        );
        if (_func) {
            elm_adding.onclick = e => {
                _func(e.target.getAttribute(_dataAtt));
                window.index_ui.setSelectingColor(
                    e.target.getAttribute('byindex') - 0,
                    makedArray
                );
                if (_valueSlider) {
                    document.getElementById(_valueSlider).value = 1.0;
                }
            };
        }
        _baseElm.appendChild(elm_adding);
        makedArray.push(elm_adding);
        added++;
    }

    return makedArray;
};

window.index_ui.makeLinkVisibleBox = _array => {
    window.ui_using.leftArray = [];
    window.ui_using.rightArray = [];

    for (let i = 0; i < _array.length; i++) {
        window.ui_using.leftArray.push(
            document.getElementById('sc1_' + _array[i])
        );
        window.ui_using.rightArray.push(
            document.getElementById('sc2_' + _array[i])
        );

        window.ui_using.leftArray[i].onclick = () => {
            window.index_ui.setVisibleOne(
                i,
                window.ui_using.rightArray,
                window.ui_using.leftArray
            );
        };
    }
};
