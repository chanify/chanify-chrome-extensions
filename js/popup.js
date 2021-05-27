function createItem(key, name) {
    var option = document.createElement('option');
    option.value = key;
    option.appendChild(document.createTextNode(name));
    return option;
}

function getTabImagesCount() {
    var imgs = new Set();
    let images = document.images;
    for (let idx = 0; idx < images.length; idx++) {
        let src = images[idx].src;
        if (src && src.length > 0) {
            imgs.add(src);
        }
    }
    return Array.from(imgs).length;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('items').onchange = e => {
        chrome.storage.sync.set({ 'active-target': e.target.value });
    };
    chrome.storage.sync.get(null, result => {
        var actived = "";
        let lst = document.getElementById('items');
        for (const key in result) {
            if (key.startsWith('item-')) {
                let item = JSON.parse(result[key]);
                lst.appendChild(createItem(key, item['name']));
            } else if (key == 'active-target') {
                actived = result[key];
            }
        }
        lst.value = actived;
    });
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        var activeTab = tabs[0];
        if (activeTab.url) {
            let imagesBtn = document.getElementById('btn-images');
            imagesBtn.href = `pages/images.html?tabId=${activeTab.id}`;
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: getTabImagesCount,
            }, res => {
                if (res && res.length > 0) {
                    let { result } = res[0];
                    let label = document.getElementById('images');
                    label.innerText = `${chrome.i18n.getMessage('images')}: ${result}`;
                }
            });
        }
    });
});
