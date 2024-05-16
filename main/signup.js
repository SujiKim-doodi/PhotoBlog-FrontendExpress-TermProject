const express = require('express');
const bodyParser = require('body-parser');
const { addUser, findUser } = require('./fileUtils');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {  //시작하면 로그인 or 회원가입 페이지 띄워주기
    res.sendFile(__dirname + '/start.html');
});


app.post('/signup', (req, res) => {    //회원가입 요청
    const { username, password } = req.body;

    try {
        // 사용자 정보 파일에 추가, addUser는 fileUtils에서 확인 가능
        addUser(username, password);
        res.json({ success: true });
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/login', (req, res) => {        //로그인 요청
    const { username, password } = req.body;
    console.log('Attempting login with:', username, password); //로그 찍어봐서 입력된 값 확인할 수 있음

    try {
        const user = findUser(username, password);  // finduser함수가 user가 있으면 ture return, 없으면 false return 해줄것임
        if (user) {
            res.json({ success: true });  //success 상태의 respond 설정
        } else {
            res.json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
