import {
    REGISTER_SUCCESS,
    REGISTER_FAIL
} from '../actions/types';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticted: null,
    loading: true,
    user: null,

}


function authReducer (state = initialState, action) {
    const {type, payload} = action;

    switch (type) {
        case REGISTER_SUCCESS:
            localStorage.setItem('token', payload.token);
            return{
                ...state,
                ...payload,
                isAuthenticted: true,
                loading: false

            }
        case REGISTER_FAIL:
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticted: false,
                loading: false
            }

        default:
            return state;
    }
}

export default authReducer;