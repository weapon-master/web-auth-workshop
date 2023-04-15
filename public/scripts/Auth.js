import API from "./API.js";
import Router from "./Router.js";

const Auth = {
    isLoggedIn: false,
    account: null,
    postLogin: (response) => {
        // TODO: store token
        if (response.ok) {
            Auth.isLoggedIn = true;
            Auth.account = {
                name: response.name,
                email: response.email,
            };
            Auth.updateStatus();
            Router.go("/");
        } else {
            alert(response.error);
        }
    },
    register: async (event) => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const user = Object.fromEntries(formData.entries());
        const response = await API.register(user);
        console.log(response);
        Auth.postLogin(response);
        
    },
    login: async (event) => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const user = Object.fromEntries(formData.entries());
        const response = await API.login(user);
        Auth.postLogin(response);
    },
    logout: () => {
        Auth.isLoggedIn = false;
        Auth.account = null;
        Auth.updateStatus();
        Router.go("/");
    },
    updateStatus() {
        if (Auth.isLoggedIn && Auth.account) {
            document.querySelectorAll(".logged_out").forEach(
                e => e.style.display = "none"
            );
            document.querySelectorAll(".logged_in").forEach(
                e => e.style.display = "block"
            );
            document.querySelectorAll(".account_name").forEach(
                e => e.innerHTML = Auth.account.name
            );
            document.querySelectorAll(".account_username").forEach(
                e => e.innerHTML = Auth.account.email
            );

        } else {
            document.querySelectorAll(".logged_out").forEach(
                e => e.style.display = "block"
            );
            document.querySelectorAll(".logged_in").forEach(
                e => e.style.display = "none"
            );

        }
    },    
    init: () => {
        
    },
}
Auth.updateStatus();

export default Auth;

// make it a global object
window.Auth = Auth;
