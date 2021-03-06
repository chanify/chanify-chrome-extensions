function getVersion() {
    var manifest = chrome.runtime.getManifest();
    return `chanify-chrome-exts/${manifest.version}`;
}

console.log(`version: ${getVersion()}`);

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'chsent/selection',
        title: 'Send text',
        contexts: ['selection']
    });
    chrome.contextMenus.create({
        id: 'chsent/link',
        title: 'Send link',
        contexts: ['link']
    });
    chrome.contextMenus.create({
        id: 'chsent/image',
        title: 'Send image',
        contexts: ['image']
    });
    chrome.contextMenus.create({
        id: 'chsent/audio',
        title: 'Send audio',
        contexts: ['audio']
    });
    chrome.contextMenus.create({
        id: 'chsent/page',
        title: 'Send page url',
        contexts: ['page']
    });
});

chrome.contextMenus.onClicked.addListener(function(info, _) {
    if (info.menuItemId.startsWith('chsent/')) {
        onSendClicked(info);
    }
});

function base64ToBlob(dataURI) {
    var ss = dataURI.split(',');
    var data = atob(ss[1]);
    var mimeType = ss[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(data.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < data.length; i++) {
        ia[i] = data.charCodeAt(i);
    }
    var bb = new Blob([ab], {type: mimeType});
    return bb;
}

function sendTo(form) {
    chrome.storage.sync.get(null, function(result) {
        let active = result['active-target'];
        if (active != null && active.length > 0) {
            let item = JSON.parse(result[active]);
            if (item != null) {
                var endpoint = item['endpoint'];
                if (endpoint.length > 0) {
                    if (endpoint[endpoint.length - 1] == '/') {
                        endpoint = endpoint.substr(0, endpoint.length - 1);
                    }
                    form.append('token', item['token']);
                    if (item['sound']) {
                        let soundName = item['sound-name'] || '';
                        if (soundName.length <= 1) {
                            soundName = '1';
                        }
                        form.append('sound', soundName);
                    }
                    if (item['autocopy']) {
                        form.append('autocopy', 1);
                    }
                    let interruptionLevel = item['interruption-level'] || '';
                    if (interruptionLevel.length > 0) {
                        form.append('interruption-level', interruptionLevel);
                    }
                    fetch(`${endpoint}/v1/sender`, {
                        method: 'POST',
                        mode: 'no-cors',
                        cache: 'no-cache',
                        redirect: 'follow',
                        referrer: 'no-referrer',
                        body: form
                    })
                    .catch(error => console.log('Error:', error))
                    .then(response => console.log('Success:', response.status));
                }
            }
        }
    });
}

function onSendClicked(info) {
    var form = new FormData();
    if (info.menuItemId == 'chsent/selection' && info.selectionText != null && info.selectionText.length > 0) {
        form.append('text', info.selectionText);
        sendTo(form);
    } else if (info.mediaType == 'image' && info.menuItemId != 'chsent/link') {
        var imgUrl = info.srcUrl;
        if (imgUrl.startsWith('data:')) {
            let data = base64ToBlob(imgUrl);
            form.append('image', data, 'image');
            sendTo(form);
        } else {
            fetch(imgUrl, { mode: 'no-cors' })
            .then(response => response.blob())
            .catch(error => console.log('Error:', error))
            .then(blob => {
                var form = new FormData();
                form.append('image', blob, 'image');
                sendTo(form);          
            });
        }
    } else if (info.mediaType == 'audio') {
        var audioUrl = info.srcUrl;
        if (audioUrl.startsWith('http')) {
            fetch(audioUrl, { mode: 'no-cors' })
            .then(response => response.blob())
            .catch(error => console.log('Error:', error))
            .then(blob => {
                var form = new FormData();
                form.append('audio', blob, 'audio');
                sendTo(form);          
            });
        }
    } else if (info.linkUrl != null && info.linkUrl.length > 0) {
        form.append('link', info.linkUrl);
        sendTo(form);
    } else if (info.pageUrl != null && info.pageUrl.length > 0) {
        form.append('link', info.pageUrl);
        sendTo(form);
    }
}
