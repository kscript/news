import { NewsList, NewsDetail } from '../constants/http'
const INITIAL_STATE = {
  newsList: {},
  detail: {}
}

export default function counter (state = INITIAL_STATE, action) {
  switch (action.type) {
    case NewsList: 
      state.newsList = action.payload
      break;
    case NewsDetail: 
      const {id} = action.payload
      state.detail[id] = action.payload
      break;
    default: break;
  }
  return state
}
