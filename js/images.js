function getTabImages() {
    let imgs = new Set();
    let images = document.images;
    for (let idx = 0; idx < images.length; idx++) {
        let src = images[idx].src;
        if (src && src.length > 0) {
            imgs.add(src);
        }
    }
    return JSON.stringify(Array.from(imgs));
}

function listTabImages(res) {
    if (res && res.length > 0) {
       let { result } = res[0];
       let imgs = JSON.parse(result);
       let label = document.getElementById('log');
       label.innerText = `images: ${imgs.length}`;
    }
}

function getQueryVar(name) {
    let query = window.location.search.substring(1);
    let vars = query.split('&');
    for (let i = 0; i< vars.length; i++) {
        let pair = vars[i].split('=');
        if (pair[0] == name) {
            return pair[1];
        }
    }
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    let tabId = parseInt(getQueryVar('tabId'));
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: getTabImages,
    }, res => {
        if (res && res.length > 0) {
            let { result } = res[0];
            let images = JSON.parse(result) || [];
            let tbl = document.getElementById('items');
            images.forEach((image, i) => {
                let row = tbl.insertRow();
                row.id = i;
                let img = document.createElement('img');
                img.src = image;
                img.onload = () => {
                    row.insertCell().appendChild(document.createTextNode(`${img.naturalHeight} x ${img.naturalWidth} px`));
                };
                img.onerror = () => {
                    tbl.removeChild(row);
                };
                row.insertCell().appendChild(img);
            });
        }
    });
});
