const fs = require('fs');   //node의 파일 시스템 모듈

const usersFilePath = 'users.json';   //유저 정보가 저장된 파일을 가져오는 변수 지정

function loadUsers() {
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8'); //파일 경로 및 인코딩 방식을 지정하여 data에 file을 읽어와라~
        return JSON.parse(data); //읽어온 데이터를 json형태로 파싱하여 변환해야 잘 사용할 수 있음
    } catch (error) {
        console.error('Error loading users:', error);  //에러에 대해서 로그 찍기 추가
        return [];
    }
}

function saveUsers(users) {
    const data = JSON.stringify(users, null, 2); //parameter로 users가 들어오면 JSON형식으로 바꿔준다
    fs.writeFileSync(usersFilePath, data); //유저 정보가 저장된 파일에 저장한당
}

function addUser(username, password, nickname) {    //회원가입 기능에서 최종적으로 요청되는 것
    const users = loadUsers();            //users 변수를 통해 현재 가입된 uesr들의 정보를 가져옴
    users.push({ username, password, nickname});   //지금 users(유저가 다 몰려있는 변수)에 새로운 유저를 추가시킴
    saveUsers(users);                     //파일에 완전 저장 -> users에는 반영이 돼 있지만, file에는 저장이 안돼있기 때문에 이를 통해 저장한다.
}

function findUser(username, password) {  
    const users = loadUsers();               //현재 등록된 모든 사용자 목록을 불러옴
    console.log('Loaded users:', users);     // 로드된 사용자 정보 로그로 찍어보기
    return users.find(user => user.username === username && user.password === password);  //배열의 find 메서드를 통해 parameter로 받은 것과 
                                                                                          //일치하는 사용자를 찾아 반환함 -> 있으면 true
}

function isUsernameTaken(username) {
    const users = loadUsers();
    return users.some(user => user.username === username);
}

function isNicknameTaken(nickname) {
    const users = loadUsers();
    return users.some(user => user.nickname === nickname);
}


// 여기서부턴 확실하지 않음
function loadPosts() {
    try {
        const data = fs.readFileSync(postsFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading posts:', error);
        return { users: [] };
    }
}

module.exports = { addUser, loadUsers, saveUsers, findUser, isUsernameTaken, isNicknameTaken }; //함수를 내보낸다.
