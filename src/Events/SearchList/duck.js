import API from '../../core/Api';
import Event from '../Event';

const initialState = {
    isFetching: null,
    lastFetched: null,
    data: [],
    error: null,
};

// Actions
const REQUEST = 'searchList/REQUEST';
const RECEIVE = 'searchList/RECEIVE';
const FAIL = 'searchList/FAIL';

// Reducer
export default function reducer(state = initialState, action = {}) {
    switch (action.type) {
    case REQUEST:
        return {
            ...state,
            isFetching: true,
        };
    case RECEIVE: {
        const events = action.data.map(ev => new Event(ev));
        return {
            ...state,
            isFetching: false,
            lastFetched: new Date().valueOf(),
            data: events,
            error: null,
        };
    }
    case FAIL:
        return {
            ...state,
            isFetching: false,
            error: action.error,
        };
    default: return state;
    }
}

// Action Creators
export function requestEventsList() {
    return {
        type: REQUEST,
    };
}

export function receiveEventsList(conferences) {
    return {
        type: RECEIVE,
        data: conferences,
    };
}

export function failEventsList(error) {
    return {
        type: FAIL,
        error,
    };
}

export function getEventsByTag(tag) {
    return (dispatch) => {
        dispatch(requestEventsList());
        API.getEventsByTag(tag)
            .then((response) => {
                dispatch(receiveEventsList(response.data));
            })
            .catch((error) => {
                dispatch(failEventsList(error.response.status));
            });
    };
}
