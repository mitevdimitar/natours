import axios from "axios";
import { showAlert } from "./alerts";

export const signup = async (email, password, confirmPassword, name) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                email,
                password,
                confirmPassword,
                name
            }
        });
        if (response.data.status === 'success') {
            showAlert('success', 'Signed up successfully!');
            window.setTimeout(()=>{
                location.assign('/')
            }, 1500);
        }
    } catch(err) {
        showAlert('error', "wrong user name or password")
    }
}