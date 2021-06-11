import axios from "axios";
import {loadStripe} from '@stripe/stripe-js';
import { showAlert } from "./alerts";

export const bookTour = async tourId => {
    const stripe = await loadStripe('pk_test_51IutDVKOmYDhGqHeUf4vDtmelujGC8G5owq7nIkmCjZ4OsLSZgj24VW0wB5lsUAbFxe4UZmZUvzsp4fxmOizeGfu00P03F12Jt');
    
    try {
        //1. Get session from the server
        const session = await axios(`/api/v1/booking/checkout/${tourId}`);
        //2. Create checkout and charge card
        stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch(err) {
        console.log(err)
        showAlert('error', err)
    }
}