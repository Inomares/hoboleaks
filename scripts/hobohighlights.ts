declare function setParam(paramName: string, value: any);
declare function getParam(paramName: string);

const PARAM_NAME_HIGHLIGHT = "highlight";

function getHighlightedIDs(): Set<Number> {
    return new Set(getParam(PARAM_NAME_HIGHLIGHT));
}

function getNodeID(node: Element): Number {
    return Number(node.id.slice(4));
}

function selectNode(node) {
    if (node) {
        node.classList.add("selected")
    }
}

function deselectNode(node) {
    node.classList.remove("selected");
}

function deselectAll(except: Set<Number> = new Set()) {
    let selected = document.getElementsByClassName("selected");
    for (const node of selected) {
        if (!except.has(getNodeID(node))) {
            deselectNode(node);
        }
    }
}

function updateSelectables(selectedIDs: Set<Number>) {
    deselectAll(selectedIDs);
    for (const nodeID of selectedIDs) {
        const node = document.getElementById("cid-" + nodeID);
        selectNode(node);
        updateInheritance(node);
    }
}

function updateSelectablesFromHash() {
    updateSelectables((getHighlightedIDs()));
}

function updateInheritance(node, isDetail=false) {
    if (node == null || node.tagName == "BODY") {
        return;
    }

    if (node.classList.contains("selectParent")) {
        node.classList.add("selected");
    }

    if (node.tagName == "DETAILS") {
        updateInheritance(node.firstElementChild, true); // I honestly cannot remember what this is even for anymore
    }

    if (!isDetail) {
        return updateInheritance(node.parentNode);
    }
}

/* We recursively iterate our way up the tree to see if any part of it is selectable. */
function getSelectableNode(node) {
    if (node == null) {
        return null;
    }
    if (node.classList.contains("selectable")) {
        return node;
    }
    return getSelectableNode(node.parentNode);
}

function toggleNodeHash(node) {
    const nodeID = getNodeID(node);
    let highlighted = getHighlightedIDs();
    highlighted.add(nodeID);
    setParam(PARAM_NAME_HIGHLIGHT, highlighted);
}

window.onhashchange = updateSelectablesFromHash;
window.onload = function() {
    document.body.onclick = function(e){
        if (!e.altKey) {
            return;
        }
        let clickedNode;
        if (window.event) {
            clickedNode = event.srcElement;
        }
        else {
            clickedNode = e.target;
        }
        const selectableNode = getSelectableNode(clickedNode);
        if (selectableNode != null) {
            toggleNodeHash(selectableNode);
            return false;
        }
    }
    updateSelectablesFromHash()
}