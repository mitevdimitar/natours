import "@babel/polyfill";
import "regenerator-runtime/runtime.js";
import { login, logout } from "./login";
import { signup } from "./signup";
import { updateSettings } from "./updateSettings";
import { displayMap } from "./mapBox";
import { bookTour } from "./stripe";

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const dataForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-settings');
const bookButton = document.getElementById('book-tour');

if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if(loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if(signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        console.log(name, confirmPassword)
        signup(email, password, confirmPassword, name);
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', logout);
}

if (dataForm) {
    dataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        updateSettings(form, 'data');
    })
}

if (passwordForm) {
    passwordForm.addEventListener('submit', async e => {
        e.preventDefault();
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;
        await updateSettings({passwordCurrent, password, confirmPassword}, 'password');

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })
}

if (bookButton) {
    bookButton.addEventListener('click', async (e) => {
        e.target.textContent = 'Processing...';
        //js automatically converts tour-id from data to tourId
        const id = e.target.dataset.tourId;
        await bookTour(id);
    })
}