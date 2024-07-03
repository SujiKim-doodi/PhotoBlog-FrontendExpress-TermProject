document.addEventListener("DOMContentLoaded", () => {
  const postsContainer = document.getElementById("posts-container");
  const author = sessionStorage.getItem("username");

  // main.html에서 게시물 로드
  function loadPosts(filter = null) {
    fetch(`/api/posts?username=${author}`)
      .then((res) => res.json())
      .then((posts) => {
        postsContainer.innerHTML = "";
        let hasPosts = false;

        posts.forEach((post) => {
          if (post.author === author && (!filter || filter(post))) {
            hasPosts = true;
            const postDiv = document.createElement("div");
            postDiv.classList.add("box");
            postDiv.innerHTML = `
                      <h2>${post.title}</h2>
                      ${
                        post.image
                          ? `<img src="/uploads/${post.image}" alt="Post Image">`
                          : ""
                      }
                    `;
            postDiv.addEventListener("click", () => {
              openViewModal(post.id);
            });
            postsContainer.appendChild(postDiv);
          }
        });

        // 게시물이 없을 경우 메시지 표시
        if (!hasPosts) {
          const noDataMessage = document.createElement("div");
          noDataMessage.id = "no-data-message";
          noDataMessage.innerHTML = "오른쪽 글쓰기 버튼으로 myPhotoBlog를 경험해보세요!";
          postsContainer.appendChild(noDataMessage);
        }
      });
  }

  // 초기 모든 게시물 로드
  loadPosts();

  // 사이드바 카테고리별로 게시물 로드
  const domesticList = document.getElementById("domesticList");
  const internationalList = document.getElementById("internationalList");

  if (domesticList && internationalList) {
    fetch(`/api/posts?username=${author}`)
      .then((response) => response.json())
      .then((data) => {
        const regionsMap = new Map(); // 국내 도시 중복 방지를 위한 Map
        const countriesSet = new Set(); // 해외 국가 중복 방지를 위한 Set

        data.forEach((post) => {
          if (post.country === "대한민국") {
            if (!regionsMap.has(post.region)) {
              const regionItem = document.createElement("li");
              regionItem.textContent = post.region;
              regionItem.onclick = () =>
                loadPosts((p) => p.region === post.region);
              domesticList.appendChild(regionItem);
              regionsMap.set(post.region, regionItem);
            }
          } else {
            if (!countriesSet.has(post.country)) {
              const countryItem = document.createElement("li");
              countryItem.textContent = post.country;
              countryItem.onclick = () =>
                loadPosts((p) => p.country === post.country);
              internationalList.appendChild(countryItem);
              countriesSet.add(post.country);
            }
          }
        });
      })
      .catch((error) => console.error("Error:", error));
  }

  // 검색어 입력 시 실시간 검색
  document.getElementById("searchInput").addEventListener("input", function () {
    const searchQuery = document.getElementById("searchInput").value; // 검색어를 가져옴
    if (searchQuery.length > 0) {
      searchPosts(searchQuery, author);
    } else {
      loadPosts(); // 검색어가 없으면 전체 게시물 로드
    }
  });
  function searchPosts(query, author) {
    fetch(`/api/search?query=${encodeURIComponent(query)}&username=${author}`)
      .then((response) => response.json())
      .then((data) => {
        postsContainer.innerHTML = ""; // 기존 내용을 비움
        data.forEach((post) => {
          if (post.author === author) {
            const postDiv = document.createElement("div");
            postDiv.classList.add("box");
            postDiv.innerHTML = `
              <h2 onclick="openViewModal('${post.id}'); return false;">${
              post.title
            }</h2>
              ${
                post.image
                  ? `<img src="/uploads/${post.image}" alt="Post Image">`
                  : ""
              }
            `;
            postsContainer.appendChild(postDiv);
          }
        });
      })
      .catch((error) => console.error("Error:", error));
  }
});

// 보기 모달을 여는 함수
function openViewModal(postId) {
  const modal = document.getElementById("myModal");
  const modalFrame = document.getElementById("modalFrame");
  modalFrame.src = `view.html?id=${postId}`;
  modal.style.display = "block";
}

// 게시물 삭제 함수
function deletePost(id) {
  fetch(`/api/posts/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then(() => {
      window.location.reload();
    });
}

// 게시물 작성 모달을 여는 함수
function openModal2() {
  const modal2 = document.getElementById("myModal2");
  modal2.style.display = "block";
}

// 모달 외부 클릭 시 모달을 닫는 함수
window.onclick = function (event) {
  const myModal = document.getElementById("myModal");
  const postModal = document.getElementById("myModal2");

  if (event.target == myModal) {
    myModal.style.display = "none";
  }
  if (event.target == postModal) {
    postModal.style.display = "none";
  }
};

// 특정 모달을 닫는 함수
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
}

// submitForm 함수: 모달 닫기 및 부모 새로고침
function submitForm() {
  const formData = new FormData();
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const rating = document
    .querySelector(".star-rating")
    .getAttribute("data-rating");
  const location = document.getElementById("locationInput").value;
  const author = sessionStorage.getItem("username");

  if (title.length < 1 || title.length > 10) {
    alert("제목은 1자에서 10자 사이여야 합니다.");
    return;
  }

  const locationDetails = document.getElementById("result").innerText;
  const [country, region] = locationDetails.split(" , ").map((s) => s.trim());

  formData.append("title", title);
  formData.append("content", content);
  formData.append("rating", rating);
  formData.append("location", location);
  formData.append("country", country);
  formData.append("region", region);
  formData.append("author", author);

  const fileInput = document.querySelector("input[type='file']");
  if (fileInput && fileInput.files.length > 0) {
    formData.append("image", fileInput.files[0]);
  }

  fetch("/api/posts", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      alert("저장되었습니다.");
      closeModal("myModal2"); // 모달 닫기
      location.reload(); // 페이지 새로고침
    })
    .catch((error) => console.error("Error:", error));
}

// 모든 게시물을 삭제하는 함수
function deleteAllPosts() {
  const username = sessionStorage.getItem("username");

  if (!username) {
    alert("로그인된 사용자가 없습니다.");
    return;
  }

  if (!confirm("모든 게시물을 삭제하시겠습니까?")) {
    return;
  }

  fetch(`/api/posts/user/${username}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("모든 게시물이 삭제되었습니다.");
        window.location.reload();
      } else {
        alert("게시물을 삭제하는 데 실패했습니다: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("게시물을 삭제하는 중 오류가 발생했습니다.");
    });
}

//user가 로그인 하면 닉네임을 메인 페이지 우상단에 띄워줌
//로그아웃 버튼 클릭 시 start.html으로 리다이렉트
// myPhotoBlog 클릭 시 페이지 새로고침으로 초기화
document.addEventListener("DOMContentLoaded", function () {
  const nickname = sessionStorage.getItem("nickname");
  if (nickname) {
    document.getElementById("userNickname").textContent = `${nickname}님 🖐`;
  }
  const logoutButton = document.getElementById("logoutButton");
  logoutButton.addEventListener("click", function () {
    sessionStorage.clear();
    window.location.href = "start.html";
  });
  const blogTitle = document.getElementById("blogTitle");
  blogTitle.addEventListener("click", function () {
    window.location.reload();
  });
});

//esc눌러서 모달창 닫기
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal("myModal");
    closeModal("myModal2");
  }
});
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal && modal.style.display === "block") {
    modal.style.display = "none";
  }
}
function openModal2() {
  document.getElementById("myModal2").style.display = "block";
}
window.addEventListener("message", function (event) {
  //esc로 view창 닫기
  if (event.data === "closeModal") {
    document.getElementById("myModal").style.display = "none";
  }
});

//myphotoblog hover시 화면 변화
document.getElementById("blogTitle").addEventListener("mouseover", function () {
  this.innerHTML = "myPhotoBlog<br>📸";
});

document.getElementById("blogTitle").addEventListener("mouseout", function () {
  this.innerHTML = "myPhotoBlog<br>📷";
});
