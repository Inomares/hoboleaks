var jPosts;
var filterPosters = []

function togglePost(postGroup) {
    $(postGroup).find(".far")
        .toggleClass("fa-plus-square fa-minus-square")
    $(postGroup).find(".postcontent, .postavatar")
        .toggleClass("collapsed")
    $(postGroup).find(".answer")
        .toggleClass("collapsed-answer")
    postGroup.classList.toggle("postgroup-collapsed")
}

function togglePostFromEvent(e) {
    let postGroup = e.currentTarget.closest(".postgroup")
    return togglePost(postGroup)
}

function getAvatarURL(username, userData) {
    return "https://forums.eveonline.com/" + userData[username].avatar
}

function createPost(postData, userData, canCollapse, hasAvatar, prefix) {
    let valid;
    if (postData) {
        valid = true
    } else {
        valid = false
        postData = {}
    }
    let post = document.createElement("div")
    post.classList.add("post")

    let postHeader = document.createElement("div")
    postHeader.classList.add("postheader")

    if (valid && hasAvatar) {
        let avatarURL = getAvatarURL(postData.username, userData)
        let avatarContainer = document.createElement("div")
        avatarContainer.classList.add("postavatar")
        let avatar = document.createElement("img")
        avatar.src = avatarURL
        avatarContainer.appendChild(avatar)
        post.appendChild(avatarContainer)
    }

    if (canCollapse) {
        let expando = document.createElement("button")
        expando.classList.add("expando")
        let fakeLink = document.createElement("a")
        let collapseSpan = document.createElement("span")
        collapseSpan.classList.add("far", "fa-minus-square")
        fakeLink.appendChild(collapseSpan)
        expando.appendChild(fakeLink)
        postHeader.appendChild(expando)
        let delim = document.createElement("span")
        delim.classList.add("vertdelim")
        delim.innerText = "|"
        postHeader.appendChild(delim)
    }
    let linkToOriginal;
    let likes;
    if (valid) {
        let d = new Date(postData.postedDate).toUTCString()
        d = d.slice(0, d.length - 7)
        linkToOriginal = document.createElement("a")
        linkToOriginal.setAttribute("href", "https://forums.eveonline.com/p/" + postData.id)
        linkToOriginal.innerText = prefix + " by " + postData.name + " at " + d
        likes = document.createElement("span")
        likes.innerText = "(" + postData.likes + " likes)"
        likes.classList.add("likesText")
    } else {
        linkToOriginal = document.createElement("span")
        likes = document.createElement("span")
        linkToOriginal.innerText = "Original post by Unknown"
    }

    postHeader.appendChild(linkToOriginal)
    postHeader.appendChild(likes)

    let postMain = document.createElement("div")

    postMain.appendChild(postHeader)


    let postContent = document.createElement("div")
    if (valid) {
        postContent.innerHTML = postData.body
        for (let img of postContent.getElementsByTagName("img")) {
            if (img.hasAttribute("alt") && img.getAttribute("alt").startsWith(":")) {
                img.classList.add("smilie")
            } else {
                img.classList.add("userimg")
            }
        }
    }
    postContent.classList.add("postcontent")
    postMain.appendChild(postContent)

    post.appendChild(postMain)

    return post
}

function createPostGroup() {
    let postGroup = document.createElement("div")
    postGroup.classList.add("postgroup")
    return postGroup
}

function sortOldest(p1, p2) {
    return p1 - p2
}

function sortNewest(p1, p2, posts) {
    return p2 - p1
}

function sortLikedQuestion(p1, p2, posts) {
    if (posts[p1].reply && posts[p2].reply) {
        return posts[p2].reply.likes - posts[p1].reply.likes
    } else {
        //console.log(p1, p2)
        if (posts[p1].reply) {
            return -1
        }
        if (posts[p2].reply) {
            return 1
        }
    }
    return 0
}

function sortLikedAnswer(p1, p2, posts) {
    return posts[p2].likes - posts[p1].likes
}

function getOrder(posts) {
    let keys = Object.keys(posts)
    let orderFunc = window[document.getElementById("sorting").value]
    keys.sort(function (a, b) {
        return orderFunc(a, b, posts)
    })
    return keys
}

function shouldIncludePoster(post) {
    return filterPosters.includes(post.username)
}

function getSearchTerm() {
    return document.getElementById("mainsearch").value.trim().toLowerCase()
}

function isSearchActive() {
    return Boolean(getSearchTerm())
}

function shouldSearchCheckAnswer() {
    return document.getElementById("searchACheck").checked
}

function shouldSearchCheckQuestion() {
    return document.getElementById("searchQCheck").checked
}

function removeQuotes(body) {

}

function postHasTerm(post, term) {
    if (!post) {
        return false
    }
    let fragments = post.body.toLowerCase().split("blockquote")
    for (let fragID = 0; fragID <= fragments.length; fragID += 2) {

        fragment = fragments[fragID]
        if (fragment.includes(term)) {
            return true
        }
    }
    return false
}

function shouldIncludeSearch(post) {
    if (!isSearchActive()) {
        return true
    }
    let searchTerm = getSearchTerm()
    let checkQuestion = shouldSearchCheckQuestion()
    let checkAnswer = shouldSearchCheckAnswer()
    let checkBoth = (!checkAnswer && !checkQuestion) || (checkAnswer && checkQuestion)

    if (checkBoth) {
        return (postHasTerm(post, searchTerm) || postHasTerm(post.reply, searchTerm))
    }
    if (checkQuestion) {
        return postHasTerm(post.reply, searchTerm)
    }
    if (checkAnswer) {
        return postHasTerm(post, searchTerm)
    }
}

function shouldIncludePost(post) {
    return (shouldIncludePoster(post) && shouldIncludeSearch(post))
}

function setFetchTime(time) {
    let d = new Date(time).toUTCString()
    d = d.slice(0, d.length - 7)
    let s = "Thread fetched at " + d + ". New or updated posts are not fetched automatically, this page is static."
    document.getElementById("fetchtime").innerText = s;
}

function loadPosts(j, fullRebuild) {
    if (fullRebuild) {
        jPosts = j
        filterPosters = Object.keys(j.users)
        buildPosters(j.users)
        setFetchTime(j.time)
    }
    let allPosts = document.createElement("div")
    let oldAllPosts = document.getElementById("allposts")
    let sortedPostNumbers = getOrder(j.posts)
    let numPosts = 0
    let filteredPosts = 0
    for (let postNum of sortedPostNumbers) {
        numPosts++
        let tempPost = j.posts[postNum]
        if (!shouldIncludePost(tempPost)) {
            filteredPosts++
            continue
        }
        let postGroup = createPostGroup()
        let question;
        if (tempPost["reply"]) {
            question = createPost(tempPost["reply"], j.users, true, false, "Asked")
        } else {
            question = createPost(null, j.users, true, false)
        }
        let answer = createPost(tempPost, j.users, false, true, "Answered")
        question.classList.add("question")
        answer.classList.add("answer")
        postGroup.appendChild(question)
        postGroup.appendChild(answer)
        allPosts.appendChild(postGroup)
    }

    document.getElementById("filteredstats").innerText = "Showing " + (numPosts - filteredPosts) + " / " + numPosts + " entries."
    oldAllPosts.parentElement.removeChild(oldAllPosts)
    allPosts.id = "allposts"
    document.getElementById("allpostscont").appendChild(allPosts)
    setTimeout(function () {
        $(".expando").click(togglePostFromEvent)
    }, 100)
}

function reloadPosts() {
    if (jPosts == null) {
        $.getJSON("ama1.json", function (j) {
            loadPosts(j, true)
        })
    } else {
        loadPosts(jPosts)
    }
    console.log("loaded")
    //need to delay this until shit finished setting up
}

function toggleQ(e) {
    if (e && e.target.nodeName != "INPUT") {
        document.getElementById("searchQCheck").checked = !document.getElementById("searchQCheck").checked
    }
    reloadPosts()
}

function toggleA(e) {
    if (e && e.target.nodeName != "INPUT") {
        document.getElementById("searchACheck").checked = !document.getElementById("searchACheck").checked
    }
    reloadPosts()
}

function collapseAll() {
    for (let postGroup of document.getElementsByClassName("postgroup")) {
        if (!postGroup.classList.contains("postgroup-collapsed")) {
            togglePost(postGroup)
        }
    }
}

function uncollapseAll() {
    for (let postGroup of document.getElementsByClassName("postgroup")) {
        if (postGroup.classList.contains("postgroup-collapsed")) {
            togglePost(postGroup)
        }
    }
}

function togglePoster(poster) {
    poster.classList.toggle("poster-inactive")
    let username = poster.getAttribute("username")
    let index = $.inArray(username, filterPosters)
    if (index != -1) {
        filterPosters.splice(index, 1)
    } else {
        filterPosters.push(username)
    }
    reloadPosts()
}

function togglePosterEvent(e) {
    return togglePoster(e.currentTarget)
}

function buildPosters(userData) {
    let mainDiv = document.getElementById("posters")
    mainDiv.innerText = ""
    for (let username in userData) {
        let user = userData[username]

        let posterDiv = document.createElement("div")
        posterDiv.classList.add("poster", "cdiv")
        posterDiv.setAttribute("username", username)

        let avatar = document.createElement("img")
        avatar.classList.add("posterimage", "col1", "fullrow")
        avatar.src = getAvatarURL(username, userData)

        let nameSpan = document.createElement("span")
        nameSpan.classList.add("postername", "col2", "row1")
        nameSpan.innerText = user.name

        let groupSpan = document.createElement("span")
        groupSpan.classList.add("postergroup", "col2", "row2")
        groupSpan.innerText = user.group

        let titleSpan = document.createElement("span")
        titleSpan.classList.add("postertitle", "smaller", "col2", "row3")
        titleSpan.innerText = user.title

        posterDiv.appendChild(avatar)
        posterDiv.appendChild(nameSpan)
        posterDiv.appendChild(groupSpan)
        posterDiv.appendChild(titleSpan)

        mainDiv.appendChild(posterDiv)
    }
    $(".poster").click(togglePosterEvent)
}

reloadPosts()
$("#sorting, #mainsearch").change(reloadPosts)
$("#searchbutton").click(reloadPosts)
