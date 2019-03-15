/* 大本ページに設定する共通js */

window.content = new Content();
window.frame1 = document.getElementById('frame1');

window.nextPage = '';
window.transferData = null;

window.onload = function() {
    window.frame1.onload = () => {
        this.onresize();
    };
    window.frame1.contentWindow.addEventListener(
        'orientationchange resize',
        function() {
            if (this.Engine) {
                this.Engine.onWindowResize();
            }
        }
    );
    parentCall('location', { url: window.defaultpage });
};

function parentCall(_ev, _opt) {
    switch (_ev) {
        case 'view_load':
            document.getElementById('loader_d').style.display = 'block';
            break;
        case 'hide_load':
            document.getElementById('loader_d').style.display = 'none';
            break;
        case 'location':
            let url = null;
            if (_opt && _opt.url) {
                url = _opt.url;
            }
            if (!url) {
                url = window.nextPage;
            }
            if (_opt.nextUrl) {
                window.nextPage = _opt.nextUrl;
            } else {
                window.nextPage = null;
            }
            if (_opt.transferData) {
                window.transferData = _opt.transferData;
            }

            if (window.frame1.contentDocument == null) {
                var iframed = window.frame1.contentWindow || window.frame1.contentDocument;
                window.frame1.location.replace(url);
            } else {
                window.frame1.contentDocument.location.replace(url);
            }
    }
}

window.reSizeTimer = null;
window.onresize = () => {
    if (window.reSizeTimer > 0) {
        clearTimeout(window.reSizeTimer);
    }

    window.reSizeTimer = setTimeout(() => {
        window.frame1.width = window.innerWidth;
        window.frame1.height = window.innerHeight;

        if (window.frame1.contentWindow.Engine) {
            window.frame1.contentWindow.Engine.onWindowResize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
    }, 200);
};
