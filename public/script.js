// Global Variables
const v = "v1.0.0-w";
const hv = "v1.0.0-e";

let username;
let color;

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
    let attachmentStyle;

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
                        }
                    }
                    break;
            }

        }
    })

    if (input.value.trim() !== '') {

        const messageData = {
            user: username,
            color: color,
            message: input.value,
            attachment: attachment,
            attachmentStyle: attachmentStyle,
            date: new Date().toLocaleTimeString('en', { hour12: true }),
            channel: channel
        };

        socket.emit('chat message', messageData);
        input.value = '';

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

        let userColorDiv = document.createElement("div")
        userColorDiv.classList.add("userColor")

        let userInfoDiv = document.createElement("div")
        userInfoDiv.classList.add("userInfo")

        let userH2 = document.createElement("h2")
        userH2.textContent = data.user
        userH2.style.color = data.color

        let userH6 = document.createElement("h6")
        userH6.textContent = data.date

        let p = document.createElement("p")
        p.textContent = data.message

        userInfoDiv.appendChild(userH2)
        userInfoDiv.appendChild(userH6)

        userDiv.appendChild(userColorDiv)
        userDiv.appendChild(userInfoDiv)

        innerMessage.appendChild(userDiv)
        innerMessage.appendChild(p)

        message.appendChild(innerMessage)

        message.querySelector(".userColor").style.backgroundColor = data.color + "b3";
        message.querySelector(".userColor").style.border = "3px solid " + data.color;
        message.querySelector("p").style.fontSize = "22px";

        if (data.attachment && data.attachmentStyle) {
            switch (data.attachmentStyle) {
                case "drawing":

                    let attachedDrawing = document.createElement("img");
                    attachedDrawing.classList.add("attachedDrawing");
                    attachedDrawing.src = data.attachment;
                    attachedDrawing.draggable = false;

                    message.querySelector(".innerMessage").appendChild(attachedDrawing);

                    break;

                case "image":

                    let attachedImage = document.createElement("img");
                    attachedImage.classList.add("attachedImage");
                    attachedImage.draggable = false;

                    let blob = base64ToBlob(data.attachment.image, data.attachment.type);
                    let src = URL.createObjectURL(blob);

                    attachedImage.src = src

                    message.querySelector(".innerMessage").appendChild(attachedImage);

                    break;

                case "website":

                    if (typeof data.attachment === "string") {
                        let attachedWebsite = document.createElement("div");
                        attachedWebsite.classList.add("attachedWebsite");

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

                        message.querySelector(".innerMessage").appendChild(attachedWebsite);

                    } else {

                        let attachedWebsite = document.createElement("div");
                        attachedWebsite.classList.add("attachedWebsite");

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

                        message.querySelector(".innerMessage").appendChild(attachedWebsite);

                    }
            }
        }

        if (recent === username) {
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

        if (!tabActive) {
            notifications++;
            document.head.querySelector("title").textContent = "(" + notifications + ") Chatterbox";
        }

        document.getElementById('messages').appendChild(message);

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

// Begin

if (host) {
    document.getElementById("welcome").querySelector("p").innerHTML = "Welcome to Chatterbox! Since you're running the Chatterbox app, you're the host of this chat session. If you close the app, the server will shut down - meaning all chats will be lost and no one will be able to join until it's reopened. <br><br> To join the chat, simply enter a username and pick a colour!"
} else {
    if (document.getElementById("hostOnly")) {
        document.getElementById("hostOnly").remove()
    }
}

const url = new URL(document.location.href)
channel = new URLSearchParams(url.search)
channel = channel.get("channel")

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

gate.style.display = "block"

if (host) {
    gate.querySelector("h5").textContent = hv
} else {
    gate.querySelector("h5").textContent = v
}

if (localStorage) {
    if (localStorage.getItem("username")) {
        usernameInput.value = localStorage.getItem("username");
    }

    if (localStorage.getItem("color")) {
        realColorPicker.value = localStorage.getItem("color");
        colorPicker.style.backgroundColor = realColorPicker.value;
    }
}

enterUser.addEventListener("click", function () {

    if (usernameInput.value.length < 16 && usernameInput.value.trim() !== "") {

        username = usernameInput.value;
        color = realColorPicker.value;

        localStorage.setItem("username", username);
        localStorage.setItem("color", color);

        const joinData = {
            user: username,
            color: color,
            host: host,
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

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalDiv.style.display !== 'none') {
        closeModal.click();
    }
});

modalDiv.addEventListener("mousedown", function (e) {
    if (e.target.classList.contains("clickOff")) {
        modalDiv.querySelector('#closeModal').click();
    }
})

link.addEventListener('click', function () {
    link.querySelector('input').select()
})

function modal(modalContent, extra) {
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

function scrollBottom() {
    document.getElementById('messages').scrollTo({
        top: document.getElementById('messages').scrollHeight,
        behavior: 'smooth'
    });
}

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

falseButton.addEventListener("click", function (e) {
    e.preventDefault();

    document.getElementById('messageInput').value = largeInput.value;
    document.getElementById('sendButton').click();

    largeInput.value = "";
})


largeInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") {
        e.preventDefault();

        document.getElementById('messageInput').value = largeInput.value;
        document.getElementById('sendButton').click();

        e.target.value = ""
    }
});

// Website
websiteButton.addEventListener("click", function (e) {
    e.preventDefault();
    fetchLinkPreview(websiteInput.value.trim())

})

function fetchLinkPreview(url) {
    url = url.toLowerCase()
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