const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');
const hero = document.querySelector('.hero');
const adminlink = document.querySelector('.admin-link');
const userlink = document.querySelector('.user-link');
let text = document.getElementById('text');
let cart = document.getElementById('cart');

function showLoader() {
    document.getElementById("loader-overlay").style.display = "flex";
}

function hideLoader() {
    document.getElementById("loader-overlay").style.display = "none";
}


window.addEventListener('scroll', () => {
    let value = window.scrollY;
    let maxScroll = 90;
    let maxScrollCart = 2;


    let textoffset = Math.min(value * 2.5, maxScroll);
    let cartoffset = Math.max(value * 1.5, maxScrollCart);

    text.style.marginTop = textoffset + 'px';
    cart.style.marginRight = cartoffset + 'px';
});

window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});


btnPopup.addEventListener('click', () => {
    wrapper.classList.add('active-popup');
    document.body.classList.add('show-login');
});

iconClose.addEventListener('click', () => {
    wrapper.classList.remove('active-popup');
    document.body.classList.remove('show-login');
});

registerLink.addEventListener('click', () => {
    wrapper.classList.add('active');
});

loginLink.addEventListener('click', () => {
    wrapper.classList.remove('active');
});

adminlink.addEventListener('click', () => {
    wrapper.classList.add('active-admin');
});

userlink.addEventListener('click', () => {
    wrapper.classList.remove('active-admin');
});
