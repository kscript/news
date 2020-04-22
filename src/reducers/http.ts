import { NewsList } from '../constants/http'
const INITIAL_STATE = {
  newsList: {}
}

export default function counter (state = INITIAL_STATE, action) {
  switch (action.type) {
    case NewsList: 
      state.newsList = action.payload
      break;
    default: break;
  }
  return state
}
