var dontUpdateHash = false
var attachedPopups = {}
var testNode = null

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
	let contents = document.getElementById(tabName)
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
		return attribute.icon
	}
	return null
}

function getTypeURL(typeID) {
	let type = dynamicData.types[typeID]
	if (type != null) {
		return "/db/type/" + type.url
	}
	return null
}

window.onload = function(){
	var nodes = document.getElementsByClassName("noscripthidden")
	for (var i=0; i < nodes.length; i++) {
		var node = nodes[i]
		node.classList.remove("noscripthidden")
	}
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
		if (nodes.length > 0) {
			dontUpdateHash = true
			nodes[0].click();
			dontUpdateHash = false
		}
	}
}