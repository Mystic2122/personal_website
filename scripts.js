// Change pfp to steve on hover
const profileImg = document.getElementById('profile-img');

profileImg.addEventListener("mouseenter", () => {
  profileImg.src = "images/steve.jpg";
})

profileImg.addEventListener("mouseleave", () => {
  profileImg.src = "images/profile.jpg";
});


window.addEventListener("scroll", function() {
    const nav = document.querySelector("nav");
    if (window.scrollY > 0) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }
});