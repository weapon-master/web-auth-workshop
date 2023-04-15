import API from "./API.js";
import Router from "./Router.js";

const Auth = {
    isLoggedIn: false,
    account: null,
    postLogin: (response, password) => {
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
        // PasswordCredential only used to store credentials that including password
        // so we need to check if the password is available
        if (window.PasswordCredential && user.password) {
            const cred = new PasswordCredential({
                id: user.email,
                password,
                name: response.name,
            });
            navigator.credentials.store(cred);
        }
    },
    register: async (event) => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const user = Object.fromEntries(formData.entries());
        const response = await API.register(user);
        console.log(response);
        Auth.postLogin(response, user.password);
        
    },
    login: async (event) => {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const user = Object.fromEntries(formData.entries());
        const response = await API.login(user);
        Auth.postLogin(response, user.password);
    },
    logout: () => {
        Auth.isLoggedIn = false;
        Auth.account = null;
        Auth.updateStatus();
        Router.go("/");
        // if user logout, it usually don't want to auto login next time
        // so we need to prevent auto login next time
        if (window.PasswordCredential) {
            navigator.credentials.preventSilentAccess();
        }
    },
    autoLogin: async () => {
        if (window.PasswordCredential) {
            const cred = await navigator.credentials.get({
                password: true,
                // mediation: "silent",
            });
            if (cred) {
                const response = await API.login({
                    email: cred.id,
                    password: cred.password,
                });
                Auth.postLogin(response);
            }
        }
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
Auth.autoLogin();
export default Auth;

// make it a global object
window.Auth = Auth;
