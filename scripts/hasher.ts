declare const genBaseHash: string;

type Serializable = string | Set<Serializable> | Array<Serializable> | number

function serialize(obj: Serializable): string {
    switch (obj.constructor.name) {
        case "String":
        case "Number":
            return encodeURIComponent(obj as string);
        case "Set":
        case "Array":
            let ret = "";
            for (const subObj of (obj as Array<Serializable>).entries()) {
                ret += serialize(subObj[1]) + ",";
            }
            let prefix = "" + (ret.length - 1) as string + "_"
            return prefix + ret.slice(0, -1); // We do not encode. All subelements have been encoded. This will mess up nested arrays, but looks nicer. We probably don't need nested arrays.
    }
}

function deserialize(s: string, typeName: Array<String>): Serializable {
    if (!typeName || typeName.length == 0) {
        throw "Tried to deserialize without any valid type."
    }
    if (s.length == 0) {
        return null;
    }
    switch (typeName[0]) {
        case "String":
            return decodeURIComponent(s);
        case "Number":
            return Number(s);
        case "Set":
        case "Array":
            let temp: Array<Serializable> = [];
            const arrayStart = s.indexOf("_");
            const arraySize = Number(s.slice(0, arrayStart)); // Size of array as a string, not # of elements
            for (const subObj of s.slice(arrayStart + 1, arrayStart + 1 + arraySize).split(",")) {
                temp.push(deserialize(subObj, typeName.slice(1)));
            }
            return typeName[0] == "Set" ? new Set(temp) : temp;
        default:
            throw "Invalid typeName"
    }
}

function getRawHash(): string {
    return window.document.location.hash.slice(1); // Because I was typing this way too much
}

function getParams(): URLSearchParams {
    if (!isHashValid()) {
        return new URLSearchParams();
    }
    return new URLSearchParams(getRawHash().slice(genBaseHash.length));
}

function getParam(paramName: string, typeName: Array<String>): Serializable {
    try {
        deserialize(getParams().get(paramName), typeName);
    } catch (e) {
        console.log(e);
        return null;
    }
}

function setParam(paramName: string, value: any) {
    let params = getParams();
    params.delete(paramName);
    params.append(paramName, serialize(value));
    updateHashWithParams(params);
}

function updateHashWithParams(params: URLSearchParams) {
    window.location.hash = genBaseHash + params;
}

/**
 * Determines whether the current hash is valid for the document (i.e. timestamp).
 * Does not perform any kind of formatting validation.
 */
function isHashValid(): boolean {
    return getRawHash().startsWith(genBaseHash);
}

if (typeof module != "undefined") {
    module.exports = {
        serialize,
        deserialize,
        setParam,
        getParam,
    };
}