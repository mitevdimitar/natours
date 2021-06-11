import axios from "axios";
import { showAlert } from "./alerts";

export const updateSettings = async (data, type) => {
    try {
        const response = await axios({
            method: 'PATCH',
            url: `/api/v1/users/update-${type==='password' ? 'password' : 'data'}`,
            data
        });
        if (response.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} changed successfully!`);
            /* window.setTimeout(()=>{
                location.assign('/')
            }, 1500); */
        }
    } catch(err) {
        showAlert('error', err.response.data.message);
    }
}