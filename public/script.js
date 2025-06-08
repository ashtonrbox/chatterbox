// Global Variables
const v = "v1.5.0-w";
const hv = "v1.1.5-e";

let padding = 205;

let username;
let color;

let replyActive = false;
let replyData = null;

const userID = createID("user", new Date().toLocaleTimeString('en', { hour12: true }).replaceAll(/ |:/g, ""));

let server;
let channel;

let attachmentImageHold;
let attachmentImageTypeHold;

let websiteAttachmentHold = {
    loading: false,
    full: null,
    url: null,
    image: null,
    title: null,
    desc: null
}

let recent;

const host = navigator.userAgent.toLowerCase().includes('electron');

let tabActive = true;
let notifications = 0;

// Setup
const socket = io();

document.getElementById('sendButton').addEventListener('click', (e) => {

    e.preventDefault();

    const input = document.getElementById('messageInput');

    let attachment;
    let attachmentStyle = "NOTHING";

    document.querySelectorAll(".attachPanel").forEach(panel => {
        if (panel.style.display === "block" && panel.id !== "baseAttachment") {

            switch (panel.id) {
                case "drawingAttachment":
                    if (isCanvasBlank(canvas) === false) {
                        attachment = document.getElementById("drawingAttachment").querySelector("canvas").toDataURL();
                        attachmentStyle = "drawing";
                    }
                    break;
                case "imageAttachment":
                    if (!document.getElementById("fit").querySelector("img").getAttribute("src").includes("/assets/imageT.png")) {
                        let base64Image = arrayBufferToBase64(attachmentImageHold);
                        attachment = {
                            image: base64Image,
                            type: attachmentImageTypeHold
                        };
                        attachmentStyle = "image";
                    }
                    break;
                case "websiteAttachment":
                    if (document.getElementById("websiteInput").value.trim() !== "") {
                        if (websiteAttachmentHold.loading === false) {
                            if (websiteAttachmentHold.full && websiteAttachmentHold.url) {
                                if (websiteAttachmentHold.full) {
                                    attachment = {
                                        image: websiteAttachmentHold.image,
                                        title: websiteAttachmentHold.title,
                                        desc: websiteAttachmentHold.desc,
                                        link: websiteAttachmentHold.url
                                    };
                                    attachmentStyle = "website";
                                } else {
                                    attachment = websiteAttachmentHold.url.toString();
                                    attachmentStyle = "website";
                                }
                            } else {
                                if (websiteAttachmentHold.url) {
                                    attachment = websiteAttachmentHold.url.toString();
                                    attachmentStyle = "website";
                                }
                            }
                        }
                    }
                    break;
            }

        }
    })

    let replyInfo = null;
    if (replyActive) {
        replyInfo = document.getElementById("replyDisplay").getAttribute("gather");
        document.getElementById("closeReply").click()
    }

    if (input.value.trim() !== '' || attachmentStyle !== "NOTHING") {

        let currentTime = new Date().toLocaleTimeString('en', { hour12: true });

        const messageData = {
            user: username,
            color: color,
            message: input.value,
            attachment: attachment,
            attachmentStyle: attachmentStyle,
            date: currentTime,
            id: createID("message", currentTime.replaceAll(/ |:/g, "")),
            channel: channel,
            limitedUserId: userID.slice(-10),
            reply: replyInfo
        };

        socket.emit('chat message', messageData);
        input.value = '';
        document.getElementById('largeMessageInput').value = '';

    }

});

socket.on('chat message', (data) => {
    if (data.channel === channel) {
        recent = data.user;

        const message = document.createElement('div');

        let innerMessage = document.createElement("div")
        innerMessage.classList.add("innerMessage")

        let userDiv = document.createElement("div")
        userDiv.classList.add("user")

        let userInfoHolder = document.createElement("div")
        userInfoHolder.classList.add("userInfoHolder")

        let userColorDiv = document.createElement("div")
        userColorDiv.classList.add("userColor")

        let userInfoDiv = document.createElement("div")
        userInfoDiv.classList.add("userInfo")

        let userH2 = document.createElement("h2")
        userH2.textContent = data.user
        userH2.style.color = data.color
        userH2.setAttribute("id", data.limitedUserId)

        let userH6 = document.createElement("h6")
        userH6.textContent = data.date

        let p = document.createElement("p")
        p.classList.add("messageText")
        p.textContent = data.message

        let messageHolder = document.createElement("div")
        messageHolder.classList.add("messageHolder")
        messageHolder.setAttribute("id", data.id)

        messageHolder.addEventListener("click", (e) => {
            if (e.target.classList.contains("messageText")) {

                if (replyActive) {
                    if (replyData === data.id) {
                        displayReplyInfo("close", null);
                        replyData = null;
                    } else {
                        displayReplyInfo("new", data.id);
                        replyData = data.id;
                    }
                } else {
                    displayReplyInfo("open", data.id);
                    replyActive = true;
                    replyData = data.id;
                }

                alterPadding()
            }
        })

        let replyIndicator = document.createElement("div")
        replyIndicator.classList.add("replyIndicator")

        let replyIndicatorP = document.createElement("p")
        let replyIndicatorSpan = document.createElement("span")

        replyIndicator.appendChild(replyIndicatorP)
        replyIndicator.appendChild(replyIndicatorSpan)

        if (data.reply) {

            let gather = locateMessageOfID(data.reply);

            replyIndicatorP.textContent = gather.user + ": ";
            replyIndicatorP.style.color = gather.color;
            replyIndicatorSpan.textContent = gather.message;

            replyIndicator.addEventListener("click", () => {
                if (document.getElementById(data.reply)) {
                    document.getElementById(data.reply).scrollIntoView({ behavior: "smooth", block: "center" });
                }
            })

            messageHolder.appendChild(replyIndicator);

        }

        messageHolder.appendChild(p)

        userInfoDiv.appendChild(userH2)
        userInfoDiv.appendChild(userH6)

        userInfoHolder.appendChild(userColorDiv)
        userInfoHolder.appendChild(userInfoDiv)

        userDiv.appendChild(userInfoHolder)

        innerMessage.appendChild(userDiv)
        innerMessage.appendChild(messageHolder)

        message.appendChild(innerMessage)

        message.querySelector(".userColor").style.backgroundColor = data.color + "b3";
        message.querySelector(".userColor").style.border = "3px solid " + data.color;

        if (data.attachment && data.attachmentStyle) {
            switch (data.attachmentStyle) {
                case "drawing":

                    let attachedDrawing = document.createElement("img");
                    attachedDrawing.classList.add("attachedDrawing");
                    attachedDrawing.classList.add("attachment");
                    attachedDrawing.src = data.attachment;
                    attachedDrawing.draggable = false;

                    messageHolder.appendChild(attachedDrawing);

                    break;

                case "image":

                    let attachedImage = document.createElement("img");
                    attachedImage.classList.add("attachedImage");
                    attachedImage.classList.add("attachment");
                    attachedImage.draggable = false;

                    let blob = base64ToBlob(data.attachment.image, data.attachment.type);
                    let src = URL.createObjectURL(blob);

                    attachedImage.src = src

                    messageHolder.appendChild(attachedImage);

                    break;

                case "website":

                    if (typeof data.attachment === "string") {
                        let attachedWebsite = document.createElement("div");
                        attachedWebsite.classList.add("attachedWebsite");
                        attachedWebsite.classList.add("attachment");

                        let attachedLink = document.createElement("a");
                        attachedLink.href = data.attachment;
                        attachedLink.target = "_blank";

                        let attachedLinkDiv = document.createElement("div");

                        let attachedLinkP = document.createElement("p");
                        attachedLinkP.textContent = data.attachment;

                        attachedLinkDiv.appendChild(attachedLinkP);
                        attachedLink.appendChild(attachedLinkDiv);
                        attachedWebsite.appendChild(attachedLink);

                        attachedLink.addEventListener("click", function (e) {
                            e.preventDefault();
                            modal("#websiteModal", attachedLink.href)
                        })

                        messageHolder.appendChild(attachedWebsite);

                    } else {

                        let attachedWebsite = document.createElement("div");
                        attachedWebsite.classList.add("attachedWebsite");
                        attachedWebsite.classList.add("attachment");

                        let attachedLink = document.createElement("a");
                        attachedLink.href = data.attachment.link;
                        attachedLink.target = "_blank";

                        let websiteFullDiv = document.createElement("div");
                        websiteFullDiv.classList.add("websiteFull");

                        let websiteFullImg = document.createElement("img");
                        websiteFullImg.src = data.attachment.image;
                        websiteFullImg.draggable = false;

                        let websiteFullDiv2 = document.createElement("div");

                        let websiteFullH4 = document.createElement("h4");
                        websiteFullH4.textContent = data.attachment.title;

                        let websiteFullP = document.createElement("p");
                        websiteFullP.textContent = data.attachment.desc;

                        websiteFullDiv2.appendChild(websiteFullH4);
                        websiteFullDiv2.appendChild(websiteFullP);

                        websiteFullDiv.appendChild(websiteFullImg);
                        websiteFullDiv.appendChild(websiteFullDiv2);

                        attachedLink.appendChild(websiteFullDiv);
                        attachedWebsite.appendChild(attachedLink);

                        attachedLink.addEventListener("click", function (e) {
                            e.preventDefault();
                            modal("#websiteModal", attachedLink.href)
                        })

                        messageHolder.appendChild(attachedWebsite);

                    }
            }
        }

        let shouldConsec;

        if (messages.lastChild.classList.contains("userConnectedP")) {
            shouldConsec = false
        } else {
            if (typeof locateMessageOfID(collateLatestID()) !== 'string') {
                if (locateMessageOfID(collateLatestID()).limitedUserId === data.limitedUserId) {
                    shouldConsec = true
                } else {
                    shouldConsec = false
                }
            } else {
                shouldConsec = false
            }
        }

        if (shouldConsec) {
            let latestMessageDiv = locateMessageOfID(collateLatestID()).messageDiv;
            latestMessageDiv.appendChild(messageHolder);

            if (latestMessageDiv.querySelector("h6").textContent.includes(" - ")) {
                latestMessageDiv.querySelector("h6").textContent = latestMessageDiv.querySelector("h6").textContent.split(" - ")[0] + " - " + data.date;
            } else {
                latestMessageDiv.querySelector("h6").textContent += " - " + data.date;
            }
        } else {
            document.getElementById('messages').appendChild(message);
        }

        if (typeof locateMessageOfID(collateLatestID()) !== 'string') {

            if (locateMessageOfID(collateLatestID()).limitedUserId === userID.slice(-10)) {
                document.querySelectorAll(".clear").forEach(clear => {
                    clear.click()
                })

                document.getElementById("websiteInput").value = "";
                display.querySelector("img").src = "/assets/imageT2.png"
                display.querySelector("img").style.objectFit = "contain"

                websiteAttachmentHold = {
                    loading: false,
                    full: null,
                    url: null,
                    image: null,
                    title: null,
                    desc: null
                }
            }

        }

        if (!tabActive && username !== undefined) {
            notifications++;
            document.head.querySelector("title").textContent = "(" + notifications + ") Chatterbox";
        }

        if (document.querySelector('.lastRead')) {
            document.querySelector('.lastRead').scrollTo({
                top: document.querySelector('.lastRead').scrollHeight,
                behavior: 'smooth'
            });
        } else {
            setTimeout(() => {
                scrollBottom();
            }, 100);
        }

    }
});

socket.on('user connected', (user) => {
    if (user.channel === channel) {
        const p = document.createElement('p');
        p.classList.add("userConnectedP");
        if (user.host) {
            p.textContent = user.user + " (host) joined!";
        } else {
            p.textContent = user.user + " joined!";
        }
        p.style.color = user.color;
        document.getElementById('messages').appendChild(p);

        scrollBottom();

    }
});

fetch('/server-info')
    .then(response => response.json())
    .then(data => {
        const serverInfo = `http://${data.ip}:${data.port}`;
        server = serverInfo;
    })
    .catch(err => {
        server = "ERROR";
    });

let messages = document.getElementById("messages");
document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
        socket.emit("alert inactive", username);
        tabActive = false;
        document.querySelectorAll(".lastRead").forEach(lastRead => {
            lastRead.remove();
        })

        if (document.querySelector(".innerMessage")) {
            let lastRead = document.createElement("p");
            lastRead.classList.add("lastRead");
            lastRead.textContent = "LAST_READ_HERE";
            lastRead.addEventListener("click", () => {
                lastRead.remove();
            })
            messages.appendChild(lastRead);
            scrollBottom();
        }
    } else {
        tabActive = true;
        document.head.querySelector("title").textContent = "Chatterbox";
        notifications = 0;

        if (messages && messages.lastChild) {
            if (messages.lastChild.classList.contains("lastRead")) {
                messages.lastChild.remove();
            } else {
                setTimeout(() => {
                    document.querySelectorAll(".lastRead").forEach(lastRead => {
                        lastRead.remove();
                    })
                }, 5000)
            }
        }
    }
})

if (document.querySelector('.lastRead')) {
    document.querySelector('.lastRead').scrollTo({
        top: document.querySelector('.lastRead').scrollHeight,
        behavior: 'smooth'
    });
} else {
    window.scroll({
        bottom: 0,
        left: 0,
        behavior: "smooth",
    });
}

if (!host) {
    window.onbeforeunload = function () {
        return "Refreshing or exiting Chatterbox will clear chats on your end.";
    }
}


function createID(type, stamp) {

    if (type && stamp) {

        let identifyString = "";
        let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 20; i++) {
            identifyString += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        if (type === "user") {

            return (`CHATTERBOX_USER_${stamp}_${identifyString}`);

        } else if (type === "message") {

            return (`CHATTERBOX_MESSAGE_${stamp}_${identifyString}`);

        } else {
            return "ERROR | FALSE ID";
        }
    }

}

function locateMessageOfID(id) {
    let loudMessage = document.getElementById(id).parentNode;
    let message = document.getElementById(id);

    if (message) {

        let returnObject = {
            user: loudMessage.querySelector(".userInfo").querySelector("h2").textContent,
            color: loudMessage.querySelector(".userInfo").querySelector("h2").style.color,
            message: message.querySelector(".messageText").textContent,
            limitedUserId: loudMessage.querySelector(".userInfo").querySelector("h2").id,
            messageDiv: loudMessage
        }

        return returnObject;
    } else {
        return "ERROR | MESSAGE NOT FOUND";
    }
}

function collateLatestID() {
    let messagesFound = messages.querySelectorAll(".messageHolder");

    if (messagesFound.length > 0) {
        return messagesFound[messagesFound.length - 1].id
    } else {
        return "ERROR | NO MESSAGES FOUND";
    }
}

// Begin

if (host) {
    document.getElementById("welcome").querySelector("p").innerHTML = "Welcome to Chatterbox! Since you're running the Chatterbox app, you're the host of this chat session. If you close the app, the server will shut down - meaning all chats will be lost and no one will be able to join until it's reopened. <br><br> To join the chat, simply enter a username and pick a color!"
} else {
    if (document.getElementById("hostOnly")) {
        document.getElementById("hostOnly").remove()
    }
}

const globalResizer = new ResizeObserver(() => {
    alterPadding()
});
globalResizer.observe(document.body);

function alterPadding() {
    if (window.innerWidth < 500) {
        padding = 300;
    } else {
        padding = 205;
    }

    if (replyActive) {
        padding += 80;
    }

    document.documentElement.style.setProperty("--MESSAGESPADDING", `${padding}px`);
}

const url = new URL(document.location.href)
channel = new URLSearchParams(url.search)
channel = channel.get("channel")

const hostWelcome = document.getElementById("hostWelcome")
const onBoarding = document.getElementById("onBoarding")
const gate = document.getElementById("gate")
const messageArea = document.getElementById("messageArea")
const enterUser = document.getElementById("enter")
const usernameInput = document.getElementById("usernameInput")

const colorPicker = document.getElementById("colorPicker")
const realColorPicker = document.getElementById("realColorPicker")

const shareLink = document.getElementById("share")
const mobileShare = document.getElementById("mobileShare")
const closeModal = document.getElementById("closeModal")
const modalDiv = document.getElementById("modal")

const linkModal = modalDiv.querySelector("#linkModal")
const websiteModal = modalDiv.querySelector("#websiteModal")

const welcomeContinue = document.getElementById("welcomeContinue")

const link = document.getElementById("link")
const share = document.getElementById("share")
const openLink = websiteModal.querySelector("button")
const websiteIndicator = document.getElementById("websiteIndicator")

const addAttachment = document.getElementById("addAttachment")
const attraction = document.getElementById("attraction")
const attachment = document.getElementById("attachment")

const websiteButton = document.getElementById("websiteButton")
const websiteInput = document.getElementById("websiteInput")
const display = document.getElementById("display")

const replyDisplay = document.getElementById("replyDisplay")
const closeReply = document.getElementById("closeReply")

gate.querySelector("h5").textContent = host ? hv : v

let localStorageData;

if (localStorage) {

    if (localStorage.getItem("CHATTERBOX_DATA")) {
        localStorageData = JSON.parse(localStorage.getItem("CHATTERBOX_DATA"));
    } else {
        localStorageData = {};
    }

    if (host) {
        if (localStorageData["opened"] === "true") {
            gate.style.display = "block";
        } else {
            hostWelcome.style.display = "block";

            document.addEventListener("DOMContentLoaded", function () {
                setTimeout(() => {
                    onBoarding.innerHTML = `<img class="gifLogo" src="/assets/logo.gif">`
                }, 500)

                setTimeout(() => {
                    modal("#welcomeModal")
                }, 3000)
            })

        }
    } else {
        gate.style.display = "block";
    }

    if (localStorageData["username"]) {
        usernameInput.value = localStorageData["username"];
    }

    if (localStorageData["color"]) {
        realColorPicker.value = localStorageData["color"];
        colorPicker.style.backgroundColor = realColorPicker.value;
    }

}

welcomeContinue.addEventListener("click", function () {
    modalDiv.querySelector("#closeModal").click()
    hostWelcome.style.display = "none";
    gate.style.display = "block";

    localStorageData["opened"] = "true";
    localStorage.setItem("CHATTERBOX_DATA", JSON.stringify(localStorageData));
})

enterUser.addEventListener("click", function () {

    if (usernameInput.value.length < 16 && usernameInput.value.trim() !== "") {

        username = usernameInput.value;
        color = realColorPicker.value;

        localStorageData["username"] = username;
        localStorageData["color"] = color;
        localStorage.setItem("CHATTERBOX_DATA", JSON.stringify(localStorageData));

        const joinData = {
            user: username,
            color: color,
            host: host,
            id: userID,
            channel: channel,
        };

        socket.emit('user connected', joinData);

        gate.style.display = "none";
        messageArea.style.display = "block";

        if (host) {
            share.click()
        }

    }

})

colorPicker.addEventListener("click", function () {
    realColorPicker.click();
});

realColorPicker.addEventListener('input', function () {
    colorPicker.style.backgroundColor = realColorPicker.value;
})

shareLink.addEventListener("click", function () { modal("#linkModal") })
mobileShare.addEventListener("click", function () { modal("#linkModal") })

closeModal.addEventListener("click", function () {
    modalDiv.style.animation = "close 0.5s ease";
    setTimeout(() => {
        modalDiv.style.display = "none";
        modalDiv.style.animation = "";
    }, 500)
})

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalDiv.style.display !== 'none' && modalDiv.querySelector("#welcomeModal").style.display !== "block") {
        closeModal.click();
    }
});

modalDiv.addEventListener("mousedown", function (e) {
    if (e.target.classList.contains("clickOff") && modalDiv.querySelector("#welcomeModal").style.display !== "block") {
        closeModal.click();
    }
})

function displayReplyInfo(style, id) {

    if (style === "open") {
        let gather = locateMessageOfID(id);

        replyDisplay.setAttribute("gather", id)

        replyDisplay.style.display = "flex";
        replyDisplay.querySelector("#replyUser").textContent = gather.user;
        replyDisplay.querySelector("#replyUser").style.color = gather.color;
        replyDisplay.querySelector("#quote").textContent = gather.message;

        replyDisplay.style.animation = "reply 0.3s ease";
        setTimeout(() => {
            replyDisplay.style.animation = "";
        }, 290)
    } else if (style === "new") {
        let gather = locateMessageOfID(id);

        replyDisplay.setAttribute("gather", id)

        replyDisplay.style.display = "flex";
        replyDisplay.querySelector("#replyUser").textContent = gather.user;
        replyDisplay.querySelector("#replyUser").style.color = gather.color;
        replyDisplay.querySelector("#quote").textContent = gather.message;
    } else {
        replyActive = false;
        replyDisplay.style.animation = "close 0.3s ease";
        setTimeout(() => {
            replyDisplay.style.display = "none";
            replyDisplay.style.animation = "";
        }, 290)
    }

    alterPadding()

}

closeReply.addEventListener("click", function () {
    displayReplyInfo("close", null);
})

link.addEventListener('click', function () {
    link.querySelector('input').select()
})

function modal(modalContent, extra) {

    if (modalContent === "#welcomeModal") {
        modalDiv.querySelector("#closeModal").style.display = "none";
    } else {
        modalDiv.querySelector("#closeModal").style.display = "block";
    }

    modalDiv.querySelectorAll(".content").forEach(content => {
        content.style.display = "none";
    })
    modalDiv.querySelector(modalContent).style.display = "block";

    link.querySelector("input").value = server;
    websiteIndicator.querySelector("input").value = extra;
    openLink.parentElement.setAttribute("href", extra);

    modalDiv.style.display = "flex";
    modalDiv.classList.add("animate");
    modalDiv.querySelector("#modalContent").classList.add("animateContent");

    setTimeout(() => {
        modalDiv.classList.remove("animate");
    }, 600)
}

function isNearBottom(threshold = 450) {
    const { scrollTop, scrollHeight, clientHeight } = messages;
    return scrollHeight - scrollTop - clientHeight <= threshold;
}

function isAtBottom(threshold = 50) {
    const { scrollTop, scrollHeight, clientHeight } = messages;
    return scrollHeight - scrollTop - clientHeight <= threshold;
}

function scrollBottom() {

    if (isNearBottom()) {
        document.getElementById('messages').scrollTo({
            top: document.getElementById('messages').scrollHeight,
            behavior: 'smooth'
        });
    } else {
        notify("newMessage");
    }

}

let notificationPopup = document.getElementById("notification");
function notify(style) {

    if (style === "newMessage") {
        notificationPopup.style.display = "block";
        notificationPopup.style.animation = "reply 0.3s ease";
        setTimeout(() => {
            notificationPopup.style.animation = "";
        }, 290)
    }

}

messages.onscroll = function () {
    if (isAtBottom()) {
        notificationPopup.style.animation = "replyClose 0.3s ease";
        setTimeout(() => {
            notificationPopup.style.animation = "";
            notificationPopup.style.display = "none";
        }, 290)
    }
}

notificationPopup.addEventListener("click", function () {
    notificationPopup.style.animation = "replyClose 0.3s ease";
    setTimeout(() => {
        notificationPopup.style.animation = "";
        notificationPopup.style.display = "none";
    }, 290)
    document.getElementById('messages').scrollTo({
        top: document.getElementById('messages').scrollHeight,
        behavior: 'smooth'
    });
})

let attachmentButtons = addAttachment.querySelectorAll("div")
attachmentButtons.forEach(attachmentLabel => {
    attachmentLabel.addEventListener("click", function () {

        attraction.style.display = "flex";
        attachment.style.height = "calc(100% - 45px)";

        attachmentButtons.forEach(button => {
            button.classList.remove("selectedAddAttachmentDiv");
        })

        attachmentLabel.classList.add("selectedAddAttachmentDiv");

        let reason = attachmentLabel.getAttribute("id");

        let panels = ["base", "drawing", "image", "website"]

        if (document.getElementById(reason + "Attachment") && panels.includes(reason)) {
            let attachmentPanel = document.getElementById(reason + "Attachment");

            panels.forEach(panel => {
                document.getElementById(panel + "Attachment").style.display = "none";
            })

            attachmentPanel.style.display = "block";

            if (reason === "drawing") {
                resizeCanvas();
            } else if (reason === "base") {
                attraction.style.display = "none";
                attachment.style.height = "calc(100%)";
            }

        }
    })
})

attachmentButtons[0].click()

// Drawing Pad
const canvas = document.getElementById('drawingAttachment').querySelector('canvas');
const ctx = canvas.getContext('2d');

function isCanvasBlank(canvas) {
    const ctx = canvas.getContext('2d');
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 0; i < pixelData.length; i += 4) {
        const alpha = pixelData[i + 3];
        if (alpha !== 0) {
            return false;
        }
    }

    return true;
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;

    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(scale, scale);
}

window.onresize = resizeCanvas;
resizeCanvas()

let isDrawing = false;

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const { x, y } = getMousePos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const { x, y } = getMousePos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getTouchPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getTouchPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isDrawing = false;
});

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

document.getElementById("clear").addEventListener("click", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
})

const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
    canvas.style.width = "";
});
resizeObserver.observe(canvas.parentElement);

// Image Upload
const nativeUpload = document.getElementById('imageAttachment').querySelector('input');
const visualUpload = document.getElementById('fit');
const imagePreview = document.getElementById('imageAttachment').querySelector('img');
const clearImage = document.getElementById('clearImage')

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToBlob(base64, contentType) {
    const byteCharacters = window.atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
}

nativeUpload.addEventListener('change', () => {
    const file = nativeUpload.files[0];
    if (file) {

        const fileSizeMB = file.size / (1024 * 1024);

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            let arrayBuffer = reader.result;
            let type = file.type;

            let blob = new Blob([new Uint8Array(arrayBuffer)], { type });
            let url = URL.createObjectURL(blob);

            imagePreview.src = url;

            if (fileSizeMB > 0.5) {
                compressImage(file, 0.7, 1200, (compressedFile) => {
                    const compressedReader = new FileReader();
                    compressedReader.addEventListener('load', () => {
                        let compressedArrayBuffer = compressedReader.result;

                        attachmentImageHold = compressedArrayBuffer;
                        attachmentImageTypeHold = 'image/jpeg';
                    });
                    compressedReader.readAsArrayBuffer(compressedFile);
                });
            } else {
                attachmentImageHold = arrayBuffer;
                attachmentImageTypeHold = type;
            }
        });
        reader.readAsArrayBuffer(file);
    }
});

function compressImage(file, quality, maxDimension, callback) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
            let width = img.width;
            let height = img.height;

            if (width > height && width > maxDimension) {
                height = Math.round(height * maxDimension / width);
                width = maxDimension;
            } else if (height > maxDimension) {
                width = Math.round(width * maxDimension / height);
                height = maxDimension;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(function (blob) {
                callback(blob);
            }, 'image/jpeg', quality);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

visualUpload.addEventListener("click", function (e) {
    if (e.target.classList.contains("clear") || e.target.classList.contains("no")) {
    } else {
        nativeUpload.click()
    }
})

clearImage.addEventListener("click", function () {
    imagePreview.src = "/assets/imageT.png";
    attachmentImageHold = null;
    attachmentImageTypeHold = null;
})

// Large Message 
const falseButton = document.getElementById('falseButton');
const largeInput = document.getElementById('largeMessageInput')
const rInput = document.getElementById('messageInput')

falseButton.addEventListener("click", function (e) {
    e.preventDefault();

    document.getElementById('messageInput').value = largeInput.value;
    document.getElementById('sendButton').click();

    largeInput.value = "";
    rInput.value = "";
})

largeInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        e.preventDefault();

        document.getElementById('messageInput').value = largeInput.value;
        document.getElementById('sendButton').click();

        largeInput.value = ""
        rInput.value = ""
    }
});

largeInput.addEventListener("input", function () {
    rInput.value = largeInput.value
})

rInput.addEventListener("input", function () {
    largeInput.value = rInput.value
})

// Website
websiteButton.addEventListener("click", function (e) {
    e.preventDefault();
    fetchLinkPreview(websiteInput.value.trim())

})

function fetchLinkPreview(url) {
    
    if (url.charAt(0) !== "h" && !url.includes("http")) {
        url = "https://" + url
    }

    websiteInput.value = url

    websiteAttachmentHold.loading = true
    websiteAttachmentHold.url = url

    fetch(`/preview?url=${encodeURIComponent(url)}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {

                if (data.ogImage && data.ogTitle && data.ogDescription) {
                    websiteAttachmentHold.loading = false
                    websiteAttachmentHold.image = data.ogImage[0].url
                    websiteAttachmentHold.title = data.ogTitle
                    websiteAttachmentHold.desc = data.ogDescription
                } else {
                    websiteAttachmentHold.loading = false
                }

                showDisplay(data)
            } else {
                showDisplay(null)
            }
        })
}

function showDisplay(data) {

    if (data && data.ogImage && data.ogTitle) {
        websiteAttachmentHold.full = true;
        display.querySelector("img").src = websiteAttachmentHold.image
        display.querySelector("img").style.objectFit = "cover"
    } else {
        websiteAttachmentHold.full = false;
        display.querySelector("img").src = "/assets/noPreview.png"
        display.querySelector("img").style.objectFit = "contain"
    }

}