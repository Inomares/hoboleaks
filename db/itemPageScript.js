var dontUpdateHash = false
var attachedPopups = {}
var testNode = null

var fileHost = "http://res.eveprobe.ccpgames.com/"

function getParameterByName(name) {

	var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);

	return match && decodeURIComponent(match[1].replace(/\+/g, ' '));

}

function selectTab(evt, tabName) {
	if (!dontUpdateHash) {
		window.location.hash = tabName
	}
	var nodes = document.getElementsByClassName("content")
	for (var i=0; i < nodes.length; i++) {
		let node = nodes[i]
		node.classList.add("inactive")
	}
	nodes = document.getElementsByClassName("tablink")
	for (var i=0; i < nodes.length; i++) {
		let node = nodes[i]
		node.classList.remove("selected")
	}
	let contents = document.getElementById("content_" + tabName)
	contents.classList.remove("inactive")
	evt.currentTarget.classList.add("selected")
}

function createPopup(x, y, contents, className) {
	contents = contents || "<p>This is a very very very very very very very very long description of the attribute. It does things.</p>"
	if (!contents.startsWith("<p>")) {
		contents = "<p>" + contents + "</p>"
	}
	className = className || "popup1"
	var newElement = document.createElement("div")
	newElement.classList.add(className)
	newElement.innerHTML = contents
	newElement.style.visibility = "hidden"
	newElement.style.opacity = 0
	document.body.appendChild(newElement)
	var nodeRect = newElement.getBoundingClientRect()
	var xPos = Math.max((x - nodeRect.width / 2), 0)	
	var yPos = (y - (nodeRect.height + 9))
	newElement.style.top = yPos + "px"
	newElement.style.left = xPos + "px"
	newElement.style.visibility = ""
	newElement.style.opacity = 1
	return newElement
}

function displayAttachedPopup(node, event, txt) {
	var nodePosition = node.getBoundingClientRect()
	var newElement = createPopup(event.clientX, nodePosition.y, txt)
	attachedPopups[node] = attachedPopups[node] || []
	attachedPopups[node].push(newElement)
}

function removeAttachedPopups(node) {
	var popups = attachedPopups[node] || []
	for (var i=0; i < popups.length; i++) {
		var popup = popups[i]
		document.body.removeChild(popup)
	}
	attachedPopups[node] = []
}

function getAttributeName(attrID) {
	let attribute = dynamicData.attributes[attrID]
	if (attribute != null) {
		return attribute.name
	}
	return "Unnamed Attribute " + attrID
}

function getAttributeDescription(attrID) {
	let attribute = dynamicData.attributes[attrID]
	if (attribute != null) {
		return attribute.desc
	}
	return null
}

function getAttributeIcon(attrID) {
	let attribute = dynamicData.attributes[attrID]
	if (attribute != null) {
		return fileHost + attribute.icon
	}
	return null
}

function getTypeName(typeID, safe) {
	safe = safe || true
	let type = dynamicData.types[typeID]
	if (type != null) {
		return type.name
	}
	if (safe) {
		return "Invalid Item (" + typeID + ")"
	}
	return null
}

function getTypeURL(typeID) {
	let itemName = getTypeName(typeID, false)
	if (itemName != null) {
		return "/db/type/" + typeID + "-" + itemName.replace(/[^A-Za-z0-9 ]/g, "").replace(/ +/g, "-")
	}
	return null
}

function getTypeIcon(typeID) {
	let type = dynamicData.types[typeID]
	if (type != null) {
		return fileHost + type.icon
	}
	return "https://image.testeveonline.com/type/1_64.png"
}

function getTypeGroup(typeID) {
	let type = dynamicData.types[typeID]
	if (type != null) {
		return type.group
	}
	return null
}

function isTypePublished(typeID) {
	let type = dynamicData.types[typeID]
	if (type != null) {
		return type.pub
	}
	return false
}

// Attributes: Regular - Unpublished - full (non-numerical)
// Skins: Show only tq skins, include unpublished
// Requirements: Auto expand skill prereqs
function toggleSettings() {
	alert('Settings coming soon! Probably.')
}

function setupSkillLinks() {
	let t1 = performance.now()
	var nodes = document.getElementsByClassName("skillLink")
	for (var i=0; i < nodes.length; i++) {
		var node = nodes[i]
		let typeID = node.getAttribute("typeid")
		let itemURL = getTypeURL(typeID)
		let itemName = getTypeName(typeID, true)
		if (itemURL != null) {
			node.href = itemURL
		}
		node.innerHTML = itemName + " " + node.innerHTML
	}
	let t2 = (performance.now() - timeLoadStart).toFixed(3)
	console.log("Set up skill links in " + timeLoadEnd + " ms.")
}

function shouldShowSkin(skin) {
	return true
}

function setupSkins() {
	var skinNodes = []
	var skinParent = document.getElementById("content_skins")
	skinParent.classList.add("dynamicDisabled")
	skinParent.innerHTML = "" //Clear existing content
	for (var skinIdx in typeData.skins) {
		var skin = typeData.skins[skinIdx]
		if (shouldShowSkin(skin)) {
			var aParent = document.createElement("a")
			aParent.href = getTypeURL(skin.typeID)
			
			var divParent = document.createElement("div")
			divParent.classList.add("skinbox")
			aParent.appendChild(divParent)
			
			var aImage = document.createElement("img")
			aImage.src = getTypeIcon(skin.typeID)
			aImage.classList.add("skinIcon")
			divParent.appendChild(aImage)
			
			var aDiv = document.createElement("div")
			aDiv.classList.add("skinDescriptor")
			divParent.appendChild(aDiv)
			
			var spanName = document.createElement("span")
			spanName.classList.add("skinName")
			spanName.innerHTML = getTypeName(skin.typeID, true)
			aDiv.appendChild(spanName)
			
			var spanNotes = document.createElement("span")
			spanNotes.classList.add("skinNotes")
			spanNotes.innerHTML = "<b>Source:</b> Unknown"
			aDiv.appendChild(spanNotes)
			
			skinNodes.push(aParent)
		}
	}
	if (skinNodes.length > 0) {
		for (var i=0; i < skinNodes.length; i++) {
			var parentNode = skinNodes[i]
			skinParent.appendChild(parentNode)
		}
		skinParent.classList.remove("dynamicDisabled")
		document.getElementById("button_skins").classList.remove("dynamicDisabled")
	}	
}

function shouldShowAttribute(attributeID) {
	return true
}

function getAttributeOrder(categoryID) {
	if (dynamicData.attributeOrders[categoryID] != null) {
		return dynamicData.attributeOrders[categoryID]
	}
	return dynamicData.attributeOrders["default"]
}

function setupAttributes() {
	var attrNodes = []
	var attrParent = document.getElementById("content_attributes")
	attrParent.classList.add("dynamicDisabled")
	attrParent.innerHTML = "" //Clear existing content
	var attrOrder = getAttributeOrder(typeData.category)
	for (var attrHeaderName in attrOrder) {
		var attributeGroups = attrOrder[attrHeaderName]
		console.log(attrHeaderName)
		console.log(attributeGroups)
	}
	attrParent.classList.remove("dynamicDisabled")
}

window.onload = function(){
	var nodes = document.getElementsByClassName("noscripthidden")
	for (var i=0; i < nodes.length; i++) {
		var node = nodes[i]
		node.classList.remove("noscripthidden")
	}
	
	/* fixTraitsLinks() */
	setupAttributes()
	setupSkillLinks()
	setupSkins()
	
	
	var useDefaultTab = true
	if (window.location.hash.length > 1) {
		let desiredTabName = window.location.hash.slice(1)
		let desiredButton = document.getElementById("button_" + desiredTabName)
		if (desiredButton != null) {
			desiredButton.click()
			useDefaultTab = false
		}
	}
	if (useDefaultTab) {
		nodes = document.getElementsByClassName("tablink")
		for (var i=0; i < nodes.length; i++) {
			var node = nodes[i]
			if (!node.classList.contains("dynamicDisabled")) {
				dontUpdateHash = true
				node.click();
				dontUpdateHash = false
				break
			}
		}
	}
}