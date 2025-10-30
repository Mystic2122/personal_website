const profileImg = document.getElementById('profile-img');

profileImg.addEventListener("mouseenter", () => {
  profileImg.src = "images/steve.jpg";
})

profileImg.addEventListener("mouseleave", () => {
  profileImg.src = "images/profile.jpg";
});