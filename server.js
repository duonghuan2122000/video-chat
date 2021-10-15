/**
 * server.js
 * @author CreatedBy: dbhuan (04/10/2021)
 */

/**
 * import fw expressjs  
 * https://expressjs.com/
 * @author CreatedBy: dbhuan (04/10/2021)
 */
const express = require('express');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

// định nghĩa port của ứng dụng
const PORT = process.env.PORT || 3000;

// khởi tạo app
const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});
const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, {
    debug: true
});

// thiết lập view engine cho ứng dụng
app.set('view engine', 'ejs');

// sử dụng peerjs cho express
app.use("/peerjs", peerServer);

// thiết lập đường dẫn cho public static folder
app.use(express.static("public"));

/**
 * GET: /
 * Thực hiện redirect về trang /{00000000-0000-0000-0000-000000000000}
 */
app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

/**
 * GET: /:room
 * Render giao diện video chat
 */
app.get('/:room', (req, res) => {
    let roomId = req.params.room;
    res.render('room', { roomId });
});

// thiết lập kết nối connection
io.on('connection', socket => {

    // sự kiện tham gia phòng trong socket
    socket.on("join-room", (roomId, userId) => {
        // thực hiện join room
        socket.join(roomId);

        // broadcast tất cả các thành viên trong phòng có user mới
        socket.to(roomId).emit("user-connected", userId);
    })
});

// lắng nghe tại địa chỉ có port {PORT}
server.listen(PORT);