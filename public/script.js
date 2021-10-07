/**
 * Script xử lý luồng video call dưới client
 * @author CreatedBy: dbhuan (07/10/2021)
 */

/**
 * Luồng video
 * @type {MediaStream}
 */
let myVideoStream;

// lấy ele khu vực hiển thị video
const videoGrid = document.getElementById('video-grid');

// Tạo ele video
const myVideo = document.createElement("video");

// tắt tiếng video
myVideo.muted = true;

// xử lý luồng video nhận được từ server
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true 
})
.then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
});

/**
 * Thêm luồng video
 * @author CreatedBy: dbhuan (07/10/2021)
 */
const addVideoStream = (video, stream) => {
    // thiết lập luồng cho video
    video.srcObject = stream;

    // 
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
    if(enabled){
        // nếu cam đang mở thì sẽ thực hiện tắt cam
        myVideoStream.getVideoTracks()[0].enabled = false;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
});