function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

let timeUntilStart = rand(1000, 2000)
let delayMin = 200
let delayMax = 2000

let styleText = `
@font-face {
	  font-family: trig;
	  src: url(triglavian-completed.otf);
}

.atn {
	font-family: trig;
	color: #C11313;
}
`

let styleNode = document.createElement("style");
styleNode.textContent = styleText;
document.head.appendChild(styleNode);

//-------------------------------------

let numNodes = 0;
let finalNodes = 0;
for (let root of document.querySelectorAll("h1, h2, h3, .selectParent, .menuButton, body > .mini, .quote .manAtn")) {
	numNodes++;
	itr = document.createNodeIterator(root, NodeFilter.SHOW_TEXT)
	while (node = itr.nextNode()) {
		[...node.textContent].forEach(c => {
			finalNodes++;
			let temp = document.createElement("span");
			temp.classList.add("atnP");
			temp.textContent = c;
			node.before(temp);
		})
		node.remove();
	}
}
for (let node of document.getElementsByClassName("clientName")) {
	node.firstChild.classList.add("atnP_Perma");
}

console.log("Converted " + numNodes + " nodes into " + finalNodes + " nodes.");

//----------------------------------

let trigified = 0;

function updateBG() {
	// document.body.style.backgroundColor = "rgba(101, 101, 101, " + trigified / finalNodes + ")";
}

function trigOn(node) {
	trigified++;
	node.classList.add("atn");
	node.classList.remove("atnP");
	updateBG();
}

function trigOff(node) {
	if (node.classList.contains("atnP_Perma")) {
		return;
	}
	trigified--;
	node.classList.remove("atn");
	node.classList.add("atnP");
	updateBG();
}

function trigify() {
	for (let node of document.getElementsByClassName("atnP")) {
		let timeToChange = rand(delayMin, delayMax);
		setTimeout(function(){
			trigOn(node);
			let timeToRevert = rand(delayMax + delayMin, delayMax * 2);
			setTimeout(function() {
				trigOff(node);
			}, timeToRevert);
		}, timeToChange);
	}
}

setTimeout(trigify, timeUntilStart);

// ---------------------------------------

// t1 = performance.now()
// for (let node of document.getElementsByClassName("*")) {
  // setTimeout(function(){node.style.fontFamily = "trig"}, rand(200, 6000))
// }
// t2 = performance.now() - t1;
// console.log(t2);

// ------------------------------------
