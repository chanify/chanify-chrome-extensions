document.getElementById('submit').addEventListener('click', e => {
    e.preventDefault();
    let name = document.getElementById('name').value || "";
    let endpoint = document.getElementById('endpoint').value || "";
    let token = document.getElementById('token').value || "";
    let sound = document.getElementById('sound').checked || false;
    let autocopy = document.getElementById('autocopy').checked || false;
    if (name.length > 0 && endpoint.length > 0 && token.length > 0) {
        var items = {};
        items[`item-${new Date().getTime()}`] = JSON.stringify({
            'name': name,
            'endpoint': endpoint,
            'token': token,
            'sound': sound,
            'autocopy': autocopy,
        });
        chrome.storage.sync.set(items, () => {
            console.log('Save item success');
            window.location.reload();
        });
    }
});

function createCheckbox(checked, onChange) {
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked || false;
    input.onchange = onChange;
    return input;
}

function createButton(name, onClick) {
    var input = document.createElement('input');
    input.type = 'button';
    input.value = chrome.i18n.getMessage(name) || "";
    input.onclick = onClick;
    return input;
}

function updateItem(key, item) {
    chrome.storage.sync.get(key, result => {
        var items = {};
        var value = JSON.parse(result[key]);
        for (const k in item) {
            value[k] = item[k];
        }
        items[key] = JSON.stringify(value);
        chrome.storage.sync.set(items, () => {
            console.log('Update item success');
        });
    });
}

function deleteItem(key) {
    if (key != null && key.startsWith('item-')) {
        chrome.storage.sync.remove([key], () => {
            document.getElementById(key).remove();
            chrome.storage.sync.get(null, result => {
                if (result['active-target'] == key) {
                    var keyNew = "";
                    for (const k in result) {
                        if (k.startsWith('item-')) {
                            keyNew = k;
                            break;
                        }
                    }
                    chrome.storage.sync.set({ 'active-target': keyNew });
                }
            });
        });
    }
}

function formatToken(token) {
    if (token != null) {
        if (token.length <= 24) {
            return token;
        }
        return token.substr(0, 19) + "..." + token.substr(-4);
    }
    return "";
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(null, (result) => {
        let tbl = document.getElementById('items');
        for (const key in result) {
            if (key.startsWith('item-')) {
                let item = JSON.parse(result[key]);
                var row = tbl.insertRow();
                row.id = key;
                row.insertCell().appendChild(document.createTextNode(item['name']));
                row.insertCell().appendChild(document.createTextNode(item['endpoint']));
                row.insertCell().appendChild(document.createTextNode(formatToken(item['token'])));
                row.insertCell().appendChild(createCheckbox(item['sound'], e => {
                    updateItem(key, { 'sound': e.target.checked });
                }));
                row.insertCell().appendChild(createCheckbox(item['autocopy'], e => {
                    updateItem(key, { 'autocopy': e.target.checked });
                }));
                row.insertCell().appendChild(createButton('delete', () => {
                    deleteItem(key);
                }));
            }
        }
    });
});