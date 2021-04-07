function localizeNode(name, callback) {
    let data = document.querySelectorAll('[' + name + ']');
    for (var i in data) {
        if (data.hasOwnProperty(i)) {
            let node = data[i];
            let tag = node.getAttribute(name).toString();
            let msg = tag.replace(/__MSG_(\w+)__/g, function(_, v1) {
                return v1 ? chrome.i18n.getMessage(v1) : '';
            });
            if(msg != tag) {
                callback(node, msg)
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    localizeNode('data-localize', function(node, text) {
        node.innerText = text;
    })
    localizeNode('data-localize-value', function(node, text) {
        node.value = text;
    })
    localizeNode('data-localize-placeholder', function(node, text) {
        node.placeholder = text;
    })
});