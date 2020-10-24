let oldParams = new URLSearchParams();
let _subscriptions = new Map();
function serialize(obj) {
    return JSON.stringify(obj);
}
function deserialize(s) {
    try {
        return JSON.parse(s);
    }
    catch (e) {
        console.log(e);
        return null;
    }
}
function getRawHash() {
    return window.document.location.hash.slice(1); // Because I was typing this way too much
}
/**
 * Determines whether the current hash is valid for the document (i.e. timestamp).
 * Does not perform any kind of formatting validation.
 */
function isHashValid() {
    return getRawHash().startsWith(genBaseHash);
}
function clearHash() {
    if (window.location.hash == "") {
        return;
    }
    window.location.hash = "";
    history.replaceState(null, document.title, window.location.pathname + window.location.search);
}
function getParams() {
    if (!isHashValid()) {
        clearHash();
        return new URLSearchParams();
    }
    return new URLSearchParams(getRawHash().slice(genBaseHash.length));
}
function deleteParam(paramName) {
    let params = getParams();
    params.delete(paramName);
    if (Array.from(params).length == 0) {
        clearHash();
    }
    else {
        updateHashWithParams(params);
    }
}
function setParam(paramName, value) {
    let params = getParams();
    params.set(paramName, serialize(value));
    updateHashWithParams(params);
}
function getParam(paramName) {
    return deserialize(getParams().get(paramName));
}
/**
 * Pushes params to hash
 * @param params
 */
function updateHashWithParams(params) {
    window.location.hash = genBaseHash + params;
}
function broadcastHashChange() {
    console.log("Broadcasting.");
    const newParams = getParams();
    const allKeys = new Set(Array.from(oldParams.keys()).concat(Array.from(newParams.keys()))); //Pretty, I know.
    for (const paramName of allKeys) {
        // Compare strings because comparing objects sucks.
        const oldValue = oldParams.get(paramName);
        const newValue = newParams.get(paramName);
        if (oldValue != newValue) {
            for (const callback of _subscriptions.get(paramName)) {
                console.log("Callback: " + paramName);
                callback(getParam(paramName));
            }
        }
    }
    oldParams = newParams;
}
function subscribeToHashChange(paramName, callback) {
    console.log("Subscriber added: " + paramName);
    if (!_subscriptions.has(paramName)) {
        _subscriptions.set(paramName, []);
    }
    _subscriptions.get(paramName).push(callback);
}
window.onhashchange = broadcastHashChange;
window.addEventListener("load", broadcastHashChange);
