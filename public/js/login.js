import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if (response.data.status === 'success') {
            showAlert('success', 'Logged in successfully!');
            window.setTimeout(()=>{
                location.assign('/')
            }, 1500);
        }
    } catch(err) {
        showAlert('error', "wrong password")
    }
}

export const logout = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
        });
        if (response.data.status === 'success') {
            location.reload(true);
        }
    } catch(err) {
        showAlert('error', "You could not log out")
    }
}