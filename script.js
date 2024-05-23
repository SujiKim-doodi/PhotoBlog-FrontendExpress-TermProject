document.addEventListener("DOMContentLoaded", () => {
  const postsContainer = document.getElementById("posts-container");
  var author = sessionStorage.getItem("username");


  // Load posts on main.html
  if (postsContainer) {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((posts) => {
        posts.forEach((post) => {
          if (post.author === author) { //user.json에서 가져온 변수값으로 설정해야함
            const postDiv = document.createElement("div");
            postDiv.classList.add("box");
            postDiv.innerHTML = `
                            <h2><a href="#" onclick="openViewModal('${
                              post.id
                            }'); return false;">${post.title}</a></h2>
                            <p>${post.content.substring(0, 100)}...</p>
                            <button onclick="deletePost('${
                              post.id
                            }')">Delete</button>
                        `;
            postsContainer.appendChild(postDiv);
          }
        });
      });
  }

  // 수정 및 삭제 모달 기능을 포함하여 로드 post details on view.html
  const postTitle = document.getElementById("post-title");
  const postContent = document.getElementById("post-content");
  const postLocation = document.getElementById("post-location");
  const postRating = document.getElementById("post-rating");
  const postInfo = document.getElementById("post-info");
  const postId = new URLSearchParams(window.location.search).get("id");

  if (postId) {
    fetch(`/api/posts/${postId}`)
      .then((res) => res.json())
      .then((post) => {
        postTitle.textContent = `제목: ${post.title}`;
        postContent.textContent = `내용: ${post.content}`;
        postLocation.textContent = `위치: ${post.location}`;
        postRating.textContent = `평점: ${post.rating}`;
        postInfo.textContent = `정보: ${post.info}`;
      });
  }
});

// Function to open view modal
function openViewModal(postId) {
  const modal = document.getElementById("myModal");
  const modalFrame = document.getElementById("modalFrame");
  modalFrame.src = `view.html?id=${postId}`;
  modal.style.display = "block";
}

// Function to delete a post
function deletePost(id) {
  fetch(`/api/posts/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then(() => {
      window.location.reload();
    });
}

// Function to open post creation modal
function openModal2() {
  const modal2 = document.getElementById("myModal2");
  modal2.style.display = "block";
}

// Function to close modals when clicking outside of them
window.onclick = function (event) {
  const myModal = document.getElementById("myModal");
  const postModal = document.getElementById("myModal2"); // 수정: 'postModal'에서 'myModal2'로 수정

  if (event.target == myModal) {
    myModal.style.display = "none";
  }
  if (event.target == postModal) {
    postModal.style.display = "none";
  }
};

// Function to close specific modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
}

// 수정: submitForm function to close modal and refresh parent
function submitForm() {
  var title = document.getElementById("title").value;
  var content = document.getElementById("content").value;
  var rating = document
    .querySelector(".star-rating")
    .getAttribute("data-rating");
  var location = document.getElementById("locationInput").value;

  var postData = {
    title: title,
    content: content,
    rating: rating,
    location: location,
  };

  fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("저장되었습니다.");
      closeModal("myModal2"); // 수정: 모달 닫기
      location.reload(); // 수정: 페이지 새로고침
    })
    .catch((error) => console.error("Error:", error));
}

function deleteAllPosts() {
  const username = sessionStorage.getItem("username");

  fetch(`/api/posts/user/${username}`, {
      method: 'DELETE'
  })
  .then(res => res.json())
  .then(() => {
      alert('All your posts have been deleted.');
      window.location.reload();
  })
  .catch(error => console.error('Error:', error));
}


