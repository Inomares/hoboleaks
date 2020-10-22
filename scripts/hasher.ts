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
    if (typeName.length == 0) {
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
        return null;
    }
    return new URLSearchParams(getRawHash().slice(genBaseHash.length));
}

function updateHashData() {
    //TODO: Set _hashData from actual hash here
}


/**
 * Determines whether the current hash is valid for the document (i.e. timestamp).
 * Does not perform any kind of formatting validation.
 */
function isHashValid(): boolean {
    return getRawHash().startsWith(genBaseHash);
}

window.addEventListener("hashchange", updateHashData);

if (typeof module != "undefined") {
    module.exports = {
        serialize,
        deserialize,
        isHashValid,
        updateHashData
    };
}