// 存放 initialState 和 reducer 函数

import * as actionTypes from './constants';
import { fromJS } from 'immutable';// fromJS 把 JS 数据结构转化成 immutable 数据结构，将 JS 对象转换为 immutable 对象。

//声明初始化 state
const defaultState = fromJS({
  bannerList: [],
  recommendList: [],
});

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.CHANGE_BANNER:
      return state.set('bannerList', action.data);
    case actionTypes.CHANGE_RECOMMEND_LIST:
      return state.set('recommendList', action.data);
    default:
      return state;
  }
}

export default reducer;
