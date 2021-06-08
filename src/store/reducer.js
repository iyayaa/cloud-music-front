import { combineReducers } from 'redux-immutable'   //项目中需要用到 immutable.js 中的数据结构，所以合并不同模块 reducer 的时候需要用到 redux-immutable 中的方法
import { reducer as recommendReducer } from '../application/Recommend/store/index';
import { reducer as singersReducer } from '../application/Singers/store/index';
import { reducer as rankReducer } from '../application/Rank/store/index';
import { reducer as albumReducer } from '../application/Album/store/index';

export default combineReducers({
  recommend: recommendReducer,
  singers: singersReducer,
  rank: rankReducer,
  album: albumReducer
})
