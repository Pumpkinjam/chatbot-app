const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");
const app = express();

const config = require("./server/config/keys");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());


// 미들웨어: userId 생성 및 쿠키 설정
app.use((req, res, next) => {
  if (!req.cookies.userId) {
      const userId = uuidv4(); // 고유한 userId 생성
      res.cookie("userId", userId, { httpOnly: true }); // 쿠키에 userId 저장
      req.userId = userId; // 요청 객체에 userId 추가
  } else {
      req.userId = req.cookies.userId; // 기존 쿠키에서 userId 가져오기
  }
  next();
});


app.use('/api/gpt', require('./server/routes/gpt'));

if (/*process.env.NODE_ENV === "production"*/1) {

  // Set static folder
  app.use(express.static("client/build"));

  // index.html for all page routes
  app.get('/{*any}', (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});