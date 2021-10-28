/**
 * Script xử lý luồng video call dưới client
 * @author CreatedBy: dbhuan (07/10/2021)
 */

// khởi tạo socket client
const socket = io();

// lấy ele khu vực hiển thị video
const videoGrid = document.getElementById('video-grid');

// Tạo ele video
const myVideo = document.createElement("video");

// tắt tiếng video
myVideo.muted = true;

const user = prompt("Nhập tên của bạn");

// khởi tạo peer (WebRTC)
var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: 443
});

/**
 * Luồng video
 * @type {MediaStream}
 */
let myVideoStream;

// xử lý luồng video nhận được từ server
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
})
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        // bắt sự kiện của peer
        peer.on("call", call => {
            call.answer(stream);

            const video = document.createElement("video");

            call.on("stream", userVideoStream => {
                addVideoStream(video, userVideoStream);
            })
        });

        // bắt sự kiện user kết nối
        socket.on("user-connected", userId => {
            connectToNewUser(userId, stream);
        });
    });

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);

    const video = document.createElement("video");

    call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
}

// sự kiện peer mở kết nối
peer.on("open", id => {
    socket.emit("join-room", ROOM_ID, id, user);
});

/**
 * Thêm luồng video
 * @author CreatedBy: dbhuan (07/10/2021)
 */
const addVideoStream = (video, stream) => {
    // thiết lập luồng cho video
    video.srcObject = stream;

    video.addEventListener("loadedmetadata", () => {
        // hiển thị video
        video.play();

        // thêm video vào khu vực hiển thị video
        videoGrid.append(video);
    });
}

const inviteButton = document.querySelector("#inviteButton");
const muteButton = document.querySelector("#muteButton");
const stopVideo = document.querySelector("#stopVideo");
muteButton.addEventListener("click", () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        html = `<i class="fas fa-microphone-slash"></i>`;
        muteButton.classList.toggle("background__red");
        muteButton.innerHTML = html;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        html = `<i class="fas fa-microphone"></i>`;
        muteButton.classList.toggle("background__red");
        muteButton.innerHTML = html;
    }
});

stopVideo.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `<i class="fas fa-video-slash"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        html = `<i class="fas fa-video"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    }
});

inviteButton.addEventListener("click", (e) => {
    prompt(
        "Sao chép link này và gửi cho người khác",
        window.location.href
    );
});

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

socket.on("createMessage", (message, userName) => {
    messages.innerHTML =
        messages.innerHTML +
        `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});