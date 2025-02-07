import GobalStorage from "./GobalStorage";


async function login() {
    await GobalStorage.saveItem("user_id", "123");
}

async function logout() {
    await GobalStorage.removeItem("user_id");
}

async function isLoggedIn() {
    return await GobalStorage.getItem("user_id") !== null
}

export default {
    login, isLoggedIn, logout
}