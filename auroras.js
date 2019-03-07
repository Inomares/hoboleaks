var auroraData;
var sortMethod = 0;
var enabledPlanets = {}
/* 
0 = Uninit
1 = Name
2 = Next
3 = Duration
Negative = reverse
*/

function initData(j, fullRebuild) {
    if (fullRebuild) {
        auroraData = j
        setupTypes(auroraData["types"])
        sortByNext() //THIS ALSO RELOADS!!!!
        //filterPlanets = Object.keys(j.types)
        //buildPosters(j.types)
    } else {
        reloadPlanets()
    }
}

function getEnabledPlanets() {
    return {} //TODO
}

function getSearchTerm() {
    return document.getElementById("mainsearch").value.trim()
}


function getMaxPlanets() {
    return 100 //TODO
}

function getDelta(d) {
    let t = new Date(d) - Date.now()
    return t
}

function formatDelta(t) {
    //Takes some milliseconds and returns a delta time
    /*   if (t <= 60) {
           return t + " seconds"
       }*/

    if (t < 0) {
        return "Now"
    }

    if (t < 1500) {
        return "1 second"
    }

    if (t < 60000) {
        return Math.round(t / 1000) + " seconds"
    }

    let minute = 60000
    let hour = minute * 60
    let day = hour * 24

    let deltaDays = Math.floor(t / day)
    t -= deltaDays * day
    let deltaHours = Math.floor(t / hour)
    t -= deltaHours * hour
    let deltaMinutes = Math.floor(t / minute)
    t -= deltaMinutes * minute

    ret = ""
    if (deltaDays > 0) {
        ret += deltaDays + " days, "
    }
    if (deltaDays > 0 || deltaHours > 0) {
        ret += deltaHours + " hours, "
    }

    if (deltaDays > 0 || deltaHours > 0 || deltaMinutes > 0) {
        ret += deltaMinutes + " minutes"
    }
    if (deltaDays == 0 && deltaHours == 0) {
        ret += ", " + Math.round(t / 1000) + " seconds"
    }
    return ret
}

function getUTCTimeFromDelta(t) {
    let targetDate = new Date(t)
    return targetDate.toGMTString()
}

function getDivForPlanet(planet) {
    let planetDiv = document.createElement("div")
    planetDiv.classList.add("planet", "columns")

    let planetInfo = document.createElement("div")
    planetInfo.classList.add("planetInfo")

    let planetImage = document.createElement("img")
    planetURL = "https://imageserver.eveonline.com/Type/" + planet.typeID + "_64.png"
    planetImage.src = planetURL
    planetInfo.appendChild(planetImage)

    let planetName = document.createElement("p")
    planetName.classList.add("planetName")
    planetName.innerText = planet.name
    planetInfo.appendChild(planetName)

    planetDiv.appendChild(planetInfo)

    let nextAuroraDiv = document.createElement("div")
    let nextAurora = planet.next
    let delta = getDelta(nextAurora)
    nextAuroraDiv.innerHTML = formatDelta(delta) + "<br><span class=\"smaller\">" + getUTCTimeFromDelta(nextAurora) + "</span>"
    planetDiv.appendChild(nextAuroraDiv)

    let durationDiv = document.createElement("div")
    if (planet.duration > delta) {
        durationDiv.innerText = formatDelta(getDelta(nextAurora + planet.duration))
    } else {
        durationDiv.innerText = formatDelta(planet.duration)
    }
    planetDiv.appendChild(durationDiv)
    planetDiv.appendChild(durationDiv)

    return planetDiv
}

function loadPlanets(data) {
    let searchTerm = getSearchTerm().toLowerCase()
    let maxPlanets = getMaxPlanets()
    let oldPlanetsDiv = document.getElementById("planets")
    let planetsDiv = oldPlanetsDiv.cloneNode(false)
    let displayCount = 0
    for (let planet of data) {
        if (displayCount >= maxPlanets) {
            break
        }
        if (!enabledPlanets[planet.typeID]) {
            continue
        }
        if (!planet.name.toLowerCase().includes(searchTerm)) {
            continue
        }
        if (planet.next + planet.duration <= Date.now()) {
            continue
        }
        planetsDiv.appendChild(getDivForPlanet(planet))
        displayCount++;
    }
    oldPlanetsDiv.parentNode.appendChild(planetsDiv)
    oldPlanetsDiv.parentNode.removeChild(oldPlanetsDiv)
    console.log("Loaded " + data.length + " planet entries, showing " + displayCount)
}

function reloadPlanets() {
    updateStatusText(true)
    if (auroraData == null) {
        $.getJSON("/auroras.json", function (j) {
            initData(j, true)
        })
    } else {
        loadPlanets(auroraData["entries"])
        updateStatusText()
    }
}

function cmpName(a, b) {
    return a.name.localeCompare(b.name);
}

function sortByName(reload) {
    let sortKey = 1
    let cmp = cmpName
    doSort(sortKey, cmp, reload)
}

function cmpNext(a, b) {
    return a.next - b.next
}

function sortByNext(reload) {
    let sortKey = 2
    let cmp = cmpNext
    doSort(sortKey, cmp, reload)
}

function cmpDuration(a, b) {
    return a.duration - b.duration
}

function sortByDuration(reload) {
    let sortKey = 3
    let cmp = cmpDuration
    doSort(sortKey, cmp, reload)
}

function updateColumns(sortKey) {
    for (node of document.querySelectorAll(".column")) {
        node.classList.remove("active-asc", "active-desc")
    }
    for (node of document.querySelectorAll(".column .fas")) {
        node.classList.remove("fa-sort-up", "fa-sort-down")
        node.classList.add("fa-sort")
    }
    let className = "active-asc"
    let iconClass = "fa-sort-up"
    if (sortKey < 0) {
        className = "active-desc"
        iconClass = "fa-sort-down"
    }
    let keysToIDs = {
        1: "sortName",
        2: "sortNext",
        3: "sortDuration"
    }
    let nodeID = keysToIDs[Math.abs(sortKey)]
    let tempNode = document.getElementById(nodeID)
    let tempIcon = tempNode.querySelector(".fas")

    tempNode.classList.add(className)

    tempIcon.classList.remove("fa-sort")

    tempIcon.classList.add(iconClass)
}

function doSort(sortKey, cmp, reload) {
    /*console.log(sortKey)
console.log(cmp)
console.log(reload)*/
    updateStatusText(true)
    setTimeout(function () {
        if (sortMethod != sortKey) {
            auroraData["entries"].sort(cmp)
            sortMethod = sortKey
        } else {
            auroraData["entries"].sort(function (a, b) {
                return cmp(b, a)
            })
            sortMethod = -sortKey
        }
        if (reload || reload === undefined) {
            reloadPlanets()
        }
        updateColumns(sortMethod)
    }, 0)
}

function setupTypes(types) {
    let typeFiltersDiv = document.getElementById("typeFilters")
    typeFilters.innerHTML = ""
    for (let typeID in types) {
        let name = types[typeID]
        enabledPlanets[typeID] = true

        let typeDiv = document.createElement("div")
        typeDiv.classList.add("typeFilter")
        typeDiv.setAttribute("typeID", typeID)

        let iconDiv = document.createElement("img")
        iconDiv.src = "https://imageserver.eveonline.com/Type/" + typeID + "_64.png"
        typeDiv.appendChild(iconDiv)

        let nameDiv = document.createElement("span")
        nameDiv.innerText = name
        typeDiv.appendChild(nameDiv)

        typeFiltersDiv.appendChild(typeDiv)
    }
    $(".typeFilter").click(onToggleType)
}

function onToggleType(e) {
    let typeID = e.delegateTarget.getAttribute("typeID")
    e.delegateTarget.classList.toggle("disabled")
    enabledPlanets[typeID] = !enabledPlanets[typeID]
    reloadPlanets()
}

function updateStatusText(loading) {
    let statusText = document.getElementById("statusText")
    if (loading) {
        document.getElementById("refresh").classList.add("disabled")
        statusText.innerText = "Loading..."
    } else {
        document.getElementById("refresh").classList.remove("disabled")
        let numPlanets = document.getElementsByClassName("planet").length
        statusText.innerText = "Showing " + numPlanets + " entries."
        if (numPlanets == getMaxPlanets()) {
            statusText.innerText += " Try applying more specific filters!"
        }
    }
}

reloadPlanets()
$("#mainsearch").change(reloadPlanets)
$("#sortName").click(sortByName)
$("#sortNext").click(sortByNext)
$("#sortDuration").click(sortByDuration)
$("#refresh").click(reloadPlanets)
