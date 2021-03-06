const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const PORT = process.env.PORT || 3000;
const app = express();
const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
};
const server = https.createServer(options, app);
const io = require('socket.io')(server, {
	cors: {
		origin: "*"
	}
});
const rooms = [];

const peerServer = ExpressPeerServer(server, {
	debug: true,
	ssl: {}
});

// thiết lập view engine cho ứng dụng
app.set('view engine', 'ejs');

// sử dụng peerjs cho express
app.use("/peerjs", peerServer);

// thiết lập đường dẫn cho public static folder
app.use(express.static("public"));

app.get('/', (_, res) => {
	res.render('home');
})

/**
 * GET: /
 * Thực hiện redirect về trang /{00000000-0000-0000-0000-000000000000}
 */
app.get("/create", (_, res) => {
	const roomId = uuidv4();
	rooms.push(roomId);
	res.redirect(`/${roomId}`);
});

/**
 * GET: /:room
 * Render giao diện video chat
 */
app.get('/:room', (req, res) => {
	let roomId = req.params.room;
	if (rooms.includes(roomId)) {
		res.render('room', { roomId });
	} else {
		res.render('404')
	}
});

// thiết lập kết nối connection
io.on('connection', socket => {

	// sự kiện tham gia phòng trong socket
	socket.on("join-room", (roomId, userId, userName) => {
		socket.join(roomId);
		socket.to(roomId).emit("user-connected", userId);

		// sự kiện chat message
		socket.on("message", (message) => {
			io.to(roomId).emit("createMessage", message, userName);
		});

		socket.on('disconnect', () => {
			socket.to(roomId).emit("user-disconnected", userId);
		})
	})
});

// lắng nghe tại địa chỉ có port {PORT}
server.listen(PORT);