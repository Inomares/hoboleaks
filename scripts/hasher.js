function serialize(obj) {
    return JSON.stringify(obj);
}
function deserialize(s) {
    return JSON.parse(s);
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
function getParams() {
    if (!isHashValid()) {
        return new URLSearchParams();
    }
    return new URLSearchParams(getRawHash().slice(genBaseHash.length));
}
function setParam(paramName, value) {
    let params = getParams();
    params.delete(paramName);
    params.append(paramName, serialize(value));
    updateHashWithParams(params);
}
function getParam(paramName) {
    try {
        return deserialize(getParams().get(paramName));
    }
    catch (e) {
        console.log(e);
        return null;
    }
}
/**
 * Pushes params to hash
 * @param params
 */
function updateHashWithParams(params) {
    window.location.hash = genBaseHash + params;
}
