// Most of this is really old code that I haven't touched in forever, copy pasted from the old main file. It's bad and it's better if you just don't look at it.
// New code at the bottom.
function filterSelectables(searchTerm, exclusions) {
    let ret = {};
    let selectables = document.getElementsByClassName("selectable");
    for (const node of selectables) {
        const contents = node.textContent.toLowerCase();
        ret[node.id] = (contents.indexOf(searchTerm) == -1 || exclusions.some((excl) => contents.indexOf(excl) != -1));
    }
    return goodFilter(ret);
}
function getNumVisibleNodes(node) {
    let count = 0;
    let children = node.children;
    for (let i = 0; i < children.length; i++) { //Iterate through child nodes
        let childNode = children[i];
        if (childNode.classList.contains("selectable") && childNode.getAttribute('filtered') != 1) {
            count += 1;
        }
        count += getNumVisibleNodes(childNode); //Let child node iterate through its own child node
    }
    return count;
}
function updateParentsFilter(clear) {
    let parents = document.getElementsByClassName("selectParent");
    for (let node of parents) {
        let childNode = node.getElementsByClassName("displayFilter")[0];
        if (clear) {
            if (childNode) {
                node.removeChild(childNode);
            }
        }
        else {
            let numVisible = getNumVisibleNodes(node.parentNode); //We check its parent because the summary tags have the "selectParent" but they are on the same level as the "sub" details.
            if (childNode === undefined) {
                childNode = document.createElement("span");
                childNode.classList.add("displayFilter");
                node.appendChild(childNode);
            }
            if (numVisible > 0) {
                childNode.classList.add("displayFilterHit");
            }
            else {
                childNode.classList.remove("displayFilterHit");
            }
            childNode.innerText = " - " + numVisible + " Results";
        }
    }
}
function doSearch(searchTerm) {
    //let r = new RegExp(/(without|regex):"(.+?)"/, "gi");
    let r = new RegExp(/(without|regex):(?:"(.+?)"|(.+?)(?: |$))/, "gi");
    let exclusions = [];
    let useRegex = null;
    for (const group of searchTerm.matchAll(r)) {
        let prefix = group[1].toLowerCase();
        let value = (group[2] || group[3]).toLowerCase();
        switch (prefix) {
            case "without":
                exclusions.push(value);
                break;
            case "regex":
                if (useRegex) {
                    return badFilter("Only one regex can be used at a time."); //One regex at a time!
                }
                try {
                    useRegex = new RegExp(value, "i");
                }
                catch (e) {
                    console.log("Error when constructing regex:\n", e);
                    return badFilter("Error when constructing regex. See browser console (F12) for details.");
                }
                break;
        }
    }
    let strippedTerm = searchTerm.replace(r, "").trim().toLowerCase();
    if (useRegex != null) {
        if (strippedTerm.length != 0) { // regex OR normal search... not both!
            return badFilter("Use regex OR normal search, not both.");
        }
        return filterSelectablesRegex2(useRegex, exclusions);
    }
    return filterSelectables(strippedTerm, exclusions);
}
function filter(searchTerm) {
    loadingFilter();
    setTimeout(function () { doSearch(searchTerm || ""); }, 10);
}
function filterDefaults() {
    const src = getMainSearchInput();
    const errTxt = document.getElementById("mainSearchInputError");
    src.classList.remove("filterInvalid");
    src.classList.remove("filterLoading");
    errTxt.classList.add("hidden");
    src.readOnly = false;
}
function loadingFilter() {
    filterDefaults();
    let src = getMainSearchInput();
    src.classList.add("filterLoading");
    src.readOnly = true;
}
function goodFilter(results) {
    filterDefaults();
    for (const [nodeID, filtered] of Object.entries(results)) {
        let node = document.getElementById(nodeID);
        if (filtered) {
            node.setAttribute("filtered", String(1));
            node.style.display = "none";
        }
        else {
            node.setAttribute("filtered", String(0));
            node.style.display = "";
        }
    }
    let allVisible = Object.values(results).every(filtered => !filtered);
    updateParentsFilter(allVisible);
}
function badFilter(reason) {
    let src = document.getElementById("mainSearchInput");
    filterDefaults();
    src.classList.add("filterInvalid");
    if (reason) {
        let errTxt = document.getElementById("mainSearchInputError");
        errTxt.textContent = reason;
        errTxt.classList.remove("hidden");
    }
}
// Evil regex for testing: regex:"(.*)*a"
function filterSelectablesRegex2(regex, exclusions) {
    let timeStart = performance.now();
    let w = new Worker(window.URL.createObjectURL(new Blob([`
		
			onmessage = function(e) {
				let ret = {}
				<!-- let regex = new RegExp(e.data[0], "i") -->
				let regex = e.data[0]
				let exclusions = e.data[1]
				let selectables = e.data[2]
				for (const [key, contents] of (selectables)) {
					if (!regex.test(contents) || exclusions.some((excl) => contents.indexOf(excl) !== -1)) {
						ret[key] = true
					} else {
						ret[key] = false
					}
				}
				postMessage(ret)
			}
		`], { type: 'application/javascript' })));
    let tk = setTimeout(function () {
        console.log("Killing after timeout.");
        w.terminate();
        badFilter("Search timed out.");
    }, 5000);
    w.onmessage = function (e) {
        clearTimeout(tk);
        let delta = performance.now() - timeStart;
        console.log("Reply from worker after " + delta + "ms.");
        goodFilter(e.data);
    };
    let selectableContents = Array.from(document.getElementsByClassName("selectable")).map((node => [node.id, node.textContent.toLowerCase()]));
    w.postMessage([regex, exclusions, selectableContents]);
    loadingFilter();
}
// New code starts here.
function getMainSearchInput() {
    return document.getElementById("mainSearchInput");
}
function filterFromHash(searchTerm) {
    if (getMainSearchInput().value != searchTerm) {
        getMainSearchInput().value = searchTerm;
    }
    filter(searchTerm);
}
function userSearch(searchTerm) {
    if (searchTerm) {
        setParam("search", searchTerm);
    }
    else {
        deleteParam("search");
    }
}
subscribeToHashChange("search", filterFromHash);
