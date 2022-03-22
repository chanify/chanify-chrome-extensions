document.getElementById('submit').addEventListener('click', e => {
    e.preventDefault();
    let name = document.getElementById('name').value || '';
    let endpoint = document.getElementById('endpoint').value || '';
    let token = document.getElementById('token').value || '';
    let interruptionLevel = document.getElementById('interruption-level').value || '';
    let sound = document.getElementById('sound').checked || false;
    let soundName = document.getElementById('sound-name').value || '';
    let autocopy = document.getElementById('autocopy').checked || false;
    if (name.length > 0 && endpoint.length > 0 && token.length > 0) {
        var items = {};
        items[`item-${new Date().getTime()}`] = JSON.stringify({
            'name': name,
            'endpoint': endpoint,
            'token': token,
            'sound': sound,
            'sound-name': soundName,
            'autocopy': autocopy,
            'interruption-level': interruptionLevel,
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
    input.value = chrome.i18n.getMessage(name) || '';
    input.onclick = onClick;
    return input;
}

function createOption(name, value) {
    var option = document.createElement('option');
    option.text = name;
    option.value = value;
    return option;
}

function createInterruptionLevel(value, onChange) {
    var select = document.createElement('select');
    select.style = "font-size: x-small; height: 20px; padding-top: 2px; padding-bottom: 2px;";
    let items = [ 'passive', 'active', 'time-sensitive' ];
    for (var i = 0; i < items.length; i++) {
        var option = document.createElement('option');
        option.text = chrome.i18n.getMessage(items[i].replace('-', '_'));
        option.value = items[i];
        select.appendChild(option);
    }
    select.value = value || 'active';
    select.onchange = onChange;
    return select;
}

function createSoundNameSelect(value, onChange) {
    var select = document.createElement('select');
    select.style = "font-size: x-small; display: inline-block; height: 20px; padding-top: 0px; padding-bottom: 0px;";
    initSoundNameSelectOptions(select);
    select.value = value || '';
    select.onchange = onChange;
    return select;
}

function initSoundNameSelectOptions(select) {
    [
        { title: chrome.i18n.getMessage('default'), code: '' }, 
        { title: 'Alarm', code: 'alarm' }, 
        { title: 'Anticipate', code: 'anticipate' },
        { title: 'Bell', code: 'bell' },
        { title: 'Bloom', code: 'bloom' },
        { title: 'Calypso', code: 'calypso' },
        { title: 'Chime', code: 'chime' },
        { title: 'Choo', code: 'choo' },
        { title: 'Descent', code: 'descent' },
        { title: 'Electronic', code: 'electronic' },
        { title: 'Fanfare', code: 'fanfare' },
        { title: 'Glass', code: 'glass' },
        { title: 'Go to sleep', code: 'go_to_sleep' },
        { title: 'Health notification', code: 'health_notification' },
        { title: 'Horn', code: 'horn' },
        { title: 'Ladder', code: 'ladder' },
        { title: 'Minuet', code: 'minuet' },
        { title: 'Multiway invitation', code: 'multiway_invitation' },
        { title: 'New mail', code: 'new_mail' },
        { title: 'News flash', code: 'news_flash' },
        { title: 'Noir', code: 'noir' },
        { title: 'Payment success', code: 'payment_success' },
        { title: 'Sent mail', code: 'sent_mail' },
        { title: 'Sent SMS', code: 'sent_sms' },
        { title: 'Shake', code: 'shake' },
        { title: 'Sherwood forest', code: 'sherwood_forest' },
        { title: 'Spell', code: 'spell' },
        { title: 'Suspense', code: 'suspense' },
        { title: 'Telegraph', code: 'telegraph' },
        { title: 'Tiptoes', code: 'tiptoes' },
        { title: 'Typewriters', code: 'typewriters' },
        { title: 'Update', code: 'update' },  
    ].forEach(s => {
        select.appendChild(createOption(s.title, s.code));
    })
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
                    var keyNew = '';
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
        return token.substr(0, 19) + '...' + token.substr(-4);
    }
    return '';
}

document.addEventListener('DOMContentLoaded', () => {
    initSoundNameSelectOptions(document.getElementById('sound-name'));
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
                let cell = row.insertCell();
                let chk = createCheckbox(item['sound'], e => {
                    updateItem(key, { 'sound': e.target.checked });
                });
                chk.style = "margin-top: 3px;";
                cell.appendChild(chk);
                cell.appendChild(createSoundNameSelect(item['sound-name'] || '', e => {
                    updateItem(key, { 'sound-name': e.target.value });
                }));
                row.insertCell().appendChild(createCheckbox(item['autocopy'], e => {
                    updateItem(key, { 'autocopy': e.target.checked });
                }));
                row.insertCell().appendChild(createInterruptionLevel(item['interruption-level'], e => {
                    updateItem(key, { 'interruption-level': e.target.value });
                }));
                row.insertCell().appendChild(createButton('delete', () => {
                    deleteItem(key);
                }));
            }
        }
    });
});