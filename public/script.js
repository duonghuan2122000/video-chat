/**
 * Script xử lý luồng video call dưới client
 * @author CreatedBy: dbhuan (07/10/2021)
 */

// khởi tạo socket client
const socket = io("/");

// lấy ele khu vực hiển thị video
const videoGrid = document.getElementById('video-grid');

// Tạo ele video
const myVideo = document.createElement("video");

// tắt tiếng video
myVideo.muted = true;

const user = prompt("Enter your name");

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

// lấy ele điều kiển video (tắt, mở cam)
let controlVideo = document.getElementById("controlVideo");

// sự kiện click ele controlVideo
controlVideo.addEventListener('click', () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        // nếu cam đang mở thì sẽ thực hiện tắt cam
        myVideoStream.getVideoTracks()[0].enabled = false;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
});