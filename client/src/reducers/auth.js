import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR
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
        case USER_LOADED:
            return {
                ...state,
                isAuthenticted: true,
                loading: false,
                user: payload
            }
        case REGISTER_SUCCESS:
            localStorage.setItem('token', payload.token);
            return{
                ...state,
                ...payload,
                isAuthenticted: true,
                loading: false

            }
        case REGISTER_FAIL:
        case AUTH_ERROR:
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