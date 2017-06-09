dontUpdateHash = false

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