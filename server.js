const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// uploads 폴더를 정적 파일로 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 데이터 파일 경로
const dataFilePath = path.join(__dirname, "posts.json");
const usersFilePath = path.join(__dirname, "users.json");
const uploadDir = path.join(__dirname, "uploads");

// 업로드 폴더가 없으면 생성
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// 멀터 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 데이터 읽기 함수
function readData() {
  const data = fs.readFileSync(dataFilePath, "utf-8");
  return JSON.parse(data);
}

// 데이터 쓰기 함수
function writeData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
}

function loadUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

function saveUsers(users) {
  const data = JSON.stringify(users, null, 2);
  fs.writeFileSync(usersFilePath, data);
}

function addUser(username, password, nickname) {
  const users = loadUsers();
  users.push({ username, password, nickname });
  saveUsers(users);
}

function findUser(username, password) {
  const users = loadUsers();
  return users.find(
    (user) => user.username === username && user.password === password
  );
}

function isUsernameTaken(username) {
  const users = loadUsers();
  return users.some((user) => user.username === username);
}

function isNicknameTaken(nickname) {
  const users = loadUsers();
  return users.some((user) => user.nickname === nickname);
}

// 모든 게시물 조회 (현재 로그인한 사용자에 따라 필터링)
app.get("/api/posts", (req, res) => {
  const username = req.query.username;
  const posts = readData();
  const userPosts = posts.filter(post => post.author === username);
  res.json(userPosts);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "start.html"));
});

app.get("/signup.html", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/main.html", (req, res) => {
  res.sendFile(path.join(__dirname, "main.html"));
});

app.get("/post.html", (req, res) => {
  res.sendFile(path.join(__dirname, "post.html"));
});

app.get("/view.html", (req, res) => {
  res.sendFile(path.join(__dirname, "view.html"));
});

// 특정 게시물 조회
app.get("/api/posts/:id", (req, res) => {
  const posts = readData();
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (post) {
    res.json(post);
  } else {
    res.status(404).json({ error: "Post not found" });
  }
});

// 게시물 추가
app.post("/api/posts", upload.single('image'), (req, res) => {
  const posts = readData();
  const newPost = { 
    id: Date.now(), 
    ...req.body, 
    image: req.file ? req.file.filename : null 
  };
  posts.push(newPost);
  writeData(posts);
  res.json(newPost);
});

// 게시물 수정
app.put("/api/posts/:id", upload.single('image'), (req, res) => {
  const posts = readData();
  const postIndex = posts.findIndex((p) => p.id === parseInt(req.params.id));
  if (postIndex !== -1) {
      const updatedPost = { ...posts[postIndex], ...req.body };
      if (req.file) {
          updatedPost.image = req.file.filename;
      }
      posts[postIndex] = updatedPost;
      writeData(posts);
      res.json(posts[postIndex]);
  } else {
      res.status(404).json({ error: "Post not found" });
  }
});





// 게시물 삭제
app.delete("/api/posts/:id", (req, res) => {
  let posts = readData();
  const postIndex = posts.findIndex((p) => p.id === parseInt(req.params.id));
  if (postIndex !== -1) {
    posts = posts.filter((p) => p.id !== parseInt(req.params.id));
    writeData(posts);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Post not found" });
  }
});

app.post("/signup", (req, res) => {
  const { username, password, nickname } = req.body;

  if (isUsernameTaken(username)) {
    return res.json({
      success: false,
      field: "username",
      message: "아이디가 중복됐습니다. 다시 입력해 주세요.",
    });
  }

  if (isNicknameTaken(nickname)) {
    return res.json({
      success: false,
      field: "nickname",
      message: "닉네임이 중복됐습니다. 다시 입력해 주세요.",
    });
  }

  try {
    addUser(username, password, nickname);
    res.json({ success: true });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  try {
    const user = findUser(username, password);
    if (user) {
      res.json({ success: true, nickname: user.nickname });
    } else {
      res.json({ success: false, message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 로그인한 사용자의 게시물 삭제
app.delete("/api/posts/user/:username", (req, res) => {
  let posts = readData();
  const username = req.params.username;
  posts = posts.filter((p) => p.author !== username);
  writeData(posts);
  res.json({ success: true });
});

// 검색 기능을 위한 API 엔드포인트 추가
app.get("/api/search", (req, res) => {
  const { query, username } = req.query; // URL에서 query 및 username 파라미터를 추출
  const posts = readData();
  const filteredPosts = posts.filter(post => post.title.includes(query) && post.author === username); // 제목에 검색어가 포함되고 작성자가 일치하는 게시물만 필터링
  res.json(filteredPosts); // 필터된 결과를 JSON 형식으로 반환
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
