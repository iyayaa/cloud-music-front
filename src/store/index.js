import { createStore, compose, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import reducer from './reducer'

// compose 从右到左来组合多个函数。当需要把多个 store 增强器依次执行的时候，需要用到它。
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// createStore 创建一个 Redux store 来以存放应用中所有的 state。
//createStore(reducer, [preloadedState], enhancer) 
//      reducer (Function): 接收两个参数，分别是当前的 state 树和要处理的 action，返回新的 state 树。
//      [preloadedState] (any): 初始时的 state
//      enhancer (Function): Store enhancer 是一个组合 store creator 的高阶函数，返回一个新的强化过的 store creator。
//   返回值 :(Store): 保存了应用所有 state 的对象。改变 state 的惟一方法是 dispatch action。你也可以 subscribe 监听 state 的变化，然后更新 UI。

// 使用 compose 增强 store

const store = createStore (reducer, composeEnhancers (
  applyMiddleware (thunk)
));

export default store;