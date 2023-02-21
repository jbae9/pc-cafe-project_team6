const express = require("express");
const cookieParser = require("cookie-parser");
const { createServer } = require("http");
const path = require("path");
const dotenv = require('dotenv')
dotenv.config()

const app = express();
const port = process.env.PORT

// socket
const http = createServer(app);
const io = require('socket.io')(http)

/* define router */
const router = require("./routes");
const ejsRouter = require("./routes/ejs.routes");

/* router */
app.use(cookieParser(process.env.JWT_SECRET_KEY));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", router);

/* ejs setting*/
app.use(ejsRouter);
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname + "/views")));



io.on('connection', client => {
    console.log('소켓이 연결되었습니다.')

    // 클라이언트에서 소켓을 연결할 시 관리자와 고객 방으로 나누기
    client.on('newRoom', (userRole) => {
        console.log(`${userRole}방을 입장했습니다.`)
        client.join(userRole)
    })

    client.on('newOrder', (message) => {
        console.log(message)
        io.to('admin').emit('newOrder',message)
    })
})

http.listen(port, () => {
    console.log(`${port} 포트가 열렸습니다!`);
})

module.exports = http