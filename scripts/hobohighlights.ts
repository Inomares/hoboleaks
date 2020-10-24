declare function setParam(paramName: string, value: any);
declare function getParam(paramName: string);
declare function deleteParam(paramName: string);
declare function subscribeToHashChange(paramName: string, callback: CallableFunction);

const PARAM_NAME_HIGHLIGHT = "highlight";

let _highlightedIDs; // Cannot rely on URL bar for "storage" because of timing issues

function getHighlightedIDs(force = false): Set<Number> {
    if (!force && _highlightedIDs) {
        return _highlightedIDs;
    } else {
        _highlightedIDs = new Set(getParam(PARAM_NAME_HIGHLIGHT));
        return _highlightedIDs;
    }
}

function getNodeID(node: Element): Number {
    return Number(node.id.slice(4));
}

function selectNode(node: Element) {
    node.classList.add("selected");
    updateInheritance(node);
}

function selectNodeByID(nodeID: Number) {
    const node = document.getElementById("cid-" + nodeID);
    selectNode(node);
}

function deselectNode(node) {
    node.classList.remove("selected");
}

function deselectAll(except: Set<Number> = new Set()) {
    let selected = Array.from(document.getElementsByClassName("selected"));
    for (const node of selected) {
        if (!except.has(getNodeID(node))) {
            deselectNode(node);
        }
    }
}

function updateSelectables(selectedIDs: Set<Number>) {
    deselectAll(selectedIDs);
    for (const nodeID of selectedIDs) {
        selectNodeByID(nodeID);
    }
}

function updateSelectablesFromHash() {
    updateSelectables((getHighlightedIDs(true)));
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
    if (node.classList && node.classList.contains("selectable")) {
        return node;
    }
    return getSelectableNode(node.parentNode);
}

function toggleNode(node) {
    const nodeID = getNodeID(node);
    let highlighted = getHighlightedIDs();
    if (highlighted.has(nodeID)) {
        highlighted.delete(nodeID);
    } else {
        highlighted.add(nodeID);
    }
    if (highlighted.size > 0) {
        setParam(PARAM_NAME_HIGHLIGHT, Array.from(highlighted));
    } else {
        deleteParam(PARAM_NAME_HIGHLIGHT);
    }
}

subscribeToHashChange(PARAM_NAME_HIGHLIGHT, updateSelectablesFromHash);
window.addEventListener("load", function() {
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
            toggleNode(selectableNode);
            return false;
        }
    }
    // updateSelectablesFromHash()
});