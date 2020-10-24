declare const genBaseHash: string;

type Serializable = string | Set<Serializable> | Array<Serializable> | number

function serialize(obj: Serializable): string {
    return JSON.stringify(obj);
}

function deserialize(s: string): Serializable {
    return JSON.parse(s);
}

function getRawHash(): string {
    return window.document.location.hash.slice(1); // Because I was typing this way too much
}

/**
 * Determines whether the current hash is valid for the document (i.e. timestamp).
 * Does not perform any kind of formatting validation.
 */
function isHashValid(): boolean {
    return getRawHash().startsWith(genBaseHash);
}

function getParams(): URLSearchParams {
    if (!isHashValid()) {
        updateHashWithParams(new URLSearchParams());
        return new URLSearchParams();
    }
    return new URLSearchParams(getRawHash().slice(genBaseHash.length));
}

function setParam(paramName: string, value: any) {
    let params = getParams();
    params.delete(paramName);
    params.append(paramName, serialize(value));
    updateHashWithParams(params);
}

function getParam(paramName: string): Serializable {
    try {
        return deserialize(getParams().get(paramName));
    } catch (e) {
        console.log(e);
        return null;
    }
}

/**
 * Pushes params to hash
 * @param params
 */
function updateHashWithParams(params: URLSearchParams) {
    window.location.hash = genBaseHash + params;
}