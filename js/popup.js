function createItem(key, name) {
    var option = document.createElement('option');
    option.value = key;
    option.appendChild(document.createTextNode(name));
    return option;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('items').onchange = function () {
        chrome.storage.sync.set({ 'active-target': this.value });
    };
    chrome.storage.sync.get(null, function(result) {
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
});