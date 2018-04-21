var attributeMultipliers = {
    54: 1000,
}

function selectModule(target) {
    var typeID = target.getAttribute("typeID")
    var clone = target.cloneNode(true)
    clone.id = "itemClone"
    clone.classList.remove("moduleEntry")
    clone.onclick = function () {
        document.getElementById("modulesContainer").removeChild(clone)

        document.getElementById("step1Cont").classList.remove("filtered")
        document.getElementById("step2Cont").classList.add("filtered")
        document.getElementById("step3Cont").classList.add("filtered")
        document.getElementById("invalidInput").classList.add("filtered")

    }
    document.getElementById("modulesContainer").appendChild(clone)

    document.getElementById("step1Cont").classList.add("filtered")
    document.getElementById("step2Cont").classList.remove("filtered")
    if (document.getElementById("attributeInput").value.trim() != "") {
        document.getElementById("attributeInput").oninput() //Call our oninput function as defined in setupWatchers()
    }
}

function populateModuleList() {
    var modScroller = document.getElementById("modScroller")
    for (var m of mutaData.types) {
        var typeID = m[0]
        var typeData = m[1]


        let moduleEntry = document.createElement("div")
        moduleEntry.classList.add("moduleEntry")
        moduleEntry.setAttribute("itemName", typeData.itemName)
        moduleEntry.setAttribute("typeID", typeID)
        moduleEntry.onclick = function () {
            selectModule(moduleEntry)
        }

        var simpleFlex = document.createElement("div")
        simpleFlex.classList.add("simpleFlex")

        var iconElement = document.createElement("img")
        iconElement.setAttribute("src", typeData.iconURL)
        simpleFlex.appendChild(iconElement)

        var nameElement = document.createElement("p")
        nameElement.classList.add("itemName")
        nameElement.textContent = typeData.itemName
        simpleFlex.appendChild(nameElement)

        moduleEntry.appendChild(simpleFlex) //Done with our simpleFlex div

        var groupElement = document.createElement("p")
        groupElement.classList.add("itemGroup")
        groupElement.textContent = ("(" + typeData.group + ")")

        moduleEntry.appendChild(groupElement)
        modScroller.appendChild(moduleEntry)

    }
}

function filterModules(searchString) {
    searchString = searchString.trim().toLowerCase()
    var modules = document.getElementsByClassName("moduleEntry")
    for (var module of modules) {
        var itemName = module.getAttribute("itemName").toLowerCase()
        if (itemName.indexOf(searchString) != -1) {
            module.classList.remove("filtered")
        } else {
            module.classList.add("filtered")
        }

    }
}

function getAttributeIDFromName(desiredName, attributeIDs) {
    for (var attributeID in attributeIDs) {
        var tempAttr = mutaData.attributes[attributeID]
        if (tempAttr.name == desiredName) {
            return attributeID
        }
    }
}

function updateAttributesTable(mutatedAttributes, typeData) {

    //Check if our number of parsed attributes matches the expected count.
    if (mutatedAttributes.size != Object.keys(typeData.attributeIDs).length) {
        document.getElementById("invalidInput").classList.remove("filtered")
        //console.log(mutatedAttributes.size + ":" + typeData.attributeIDs)
    } else {
        document.getElementById("invalidInput").classList.add("filtered")
    }

    var resultsDiv = document.getElementById("step3Cont")
    resultsDiv.classList.remove("filtered")
    var table = document.getElementById("resultTable")

    //Remove old table entries
    let volatiles = table.getElementsByClassName("volatile")
    while (volatiles.length > 0) {
        table.removeChild(volatiles[0])
    }
    for (attributeID in typeData.attributeIDs) { //We iterate over the expected attributes
        let oldValue = typeData.attributeIDs[attributeID]
        let newValue = mutatedAttributes.get(attributeID)
        let attributeName = mutaData.attributes[attributeID].name
        let attributeUnitID = mutaData.attributes[attributeID].unit
        let attributeUnitName = mutaData.units[attributeUnitID]
        let highIsGood = mutaData.attributes[attributeID].highIsGood
        let attributeIconURL = mutaData.attributes[attributeID].icon


        let diff, diffString = "?"
        let isNumber = true

        let oldValueStr = oldValue + " " + attributeUnitName

        let diffClass = "attributeUnparsed"
        let goodClass = "attributeImproved"
        let badClass = "attributeWorsened"
        let unchangedClass = "attributeUnchanged"

        if (newValue === undefined) {
            newValue,
            newValueStr = "?"
        }
        else {
            newValue = newValue * (attributeMultipliers[attributeID] || 1)
            var newValueStr = newValue + " " + attributeUnitName
            diff = newValue / oldValue
            diffString = Math.abs(parseFloat(((diff - 1) * 100).toFixed(2))) + "%"
            if (oldValue > newValue) {
                diffString = "- " + diffString
                if (highIsGood) {
                    diffClass = badClass
                } else {
                    diffClass = goodClass
                }
            } else if (oldValue < newValue) {
                diffString = "+ " + diffString
                if (highIsGood) {
                    diffClass = goodClass
                } else {
                    diffClass = badClass
                }

            } else {
                diffSting = "± " + diffString
                diffClass = unchangedClass
            }
        }

        let row = document.createElement("tr")
        row.classList.add("volatile")


        let attributeIconElement = document.createElement("img")
        attributeIconElement.src = attributeIconURL
        attributeIconElement.classList.add("attributeIcon")

        let attributeNameElement = document.createElement("p")
        attributeNameElement.textContent = attributeName

        let attributeComboElement = document.createElement("td")
        attributeComboElement.classList.add("nameIconFlex")
        attributeComboElement.appendChild(attributeIconElement)
        attributeComboElement.appendChild(attributeNameElement)

        row.appendChild(attributeComboElement)

        let attributeOldValueElement = document.createElement("td")
        attributeOldValueElement.textContent = oldValueStr
        row.appendChild(attributeOldValueElement)

        let attributeNewValueElement = document.createElement("td")
        attributeNewValueElement.textContent = newValueStr
        row.appendChild(attributeNewValueElement)

        let attributeDiffElement = document.createElement("td")
        attributeDiffElement.textContent = diffString
        attributeDiffElement.classList.add(diffClass)
        row.appendChild(attributeDiffElement)

        table.appendChild(row)

    }

}

function parseAttributes(attributesString) {
    var mutatedAttributes = new Map()
    var attributeLines = (attributesString.split("\n"))
    var typeID = document.getElementById("itemClone").getAttribute("typeID")
    var typeData = mutaData.types.get(Number(typeID))
    if (typeData === undefined) {
        console.log("FATAL ERROR: typeData is undefined!")
        return
    }
    for (var attributeLine of attributeLines) {
        attributeLine = attributeLine.trim()
        if (attributeLine == "") {
            continue
        }
        try {
            attributeLine = attributeLine.replace(/( {2,})/g, "\t")
            var attributeName = attributeLine.split("\t")[0].trim()
            var attributeValue = attributeLine.split("\t")[1].trim()
            //For now, we can probably safely just strip out the last word in the value and assume it is a unit.
            //This doesn't really work for certain attributes but those are very rare and should not be modified.
            var spaceIndex = attributeValue.lastIndexOf(" ")
            if (spaceIndex != -1) {
                var attributeValueNew = attributeValue.substring(0, spaceIndex)
            } else {
                var attributeValueNew = attributeValue
            }
            //Dude idk how to deal with unicode in this shit language ok, don't judge me.
            attributeValueNew = attributeValueNew.replace(RegExp(String.fromCharCode(160) + " ?", "g"), "") //Remove spaces for things like mass addition (50 000 000 kg)
            console.log(attributeValueNew)
            let attributeID = getAttributeIDFromName(attributeName, typeData.attributeIDs)

            if (attributeID) {
                /*var oldValue = typeData.attributeIDs[attributeID]
                var diff = attributeValueNew / oldValue
                var attrInfo = {
                    "attributeName": attributeName,
                    "newValue": attributeValueNew,
                    "oldValue": oldValue,
                    "diff": diff,*/
                attrInfo = attributeValueNew
                mutatedAttributes.set(attributeID, attrInfo)
            }
        } catch (err) {
            //console.log("Unable to parse line: " + attributeLine)
            //console.log(err)
        }
    }

    updateAttributesTable(mutatedAttributes, typeData)
    return mutatedAttributes
}

function setupWatchers() {
    document.getElementById("moduleSearch").oninput = function (e) {
        filterModules(document.getElementById("moduleSearch").value)
    }

    document.getElementById("attributeInput").oninput = function (e) {
        parseAttributes(document.getElementById("attributeInput").value)
    }
}

window.onload = function (e) {
    populateModuleList()
    setupWatchers()
}
