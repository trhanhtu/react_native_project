import GobalStorage from "./GlobalStorage";




async function logout() {
    await GobalStorage.removeItem("id");
}

async function isLoggedIn() {
    return await GobalStorage.getItem("id") !== null
}

export default {
    isLoggedIn, logout
}