import React from 'react';

import { Provider } from 'react-redux'  //使组件层级中的 connect() 方法都能够获得 Redux store。正常情况下，根组件应该嵌套在 <Provider> 中才能使用 connect()方法(连接 React 组件与 Redux store) 。
import store from './store/index'


import { renderRoutes } from 'react-router-config';//renderRoutes 读取路由配置转化为 Route 标签
import { HashRouter } from 'react-router-dom';
import routes from './routes/index.js';

import {GlobalStyle} from './style';
import { IconStyle } from './assets/iconfont/iconfont';

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <GlobalStyle></GlobalStyle>
        <IconStyle></IconStyle>
        {renderRoutes(routes)}
      </HashRouter>
    </Provider>
  );
}

export default App;
