import React from 'react';
import { renderRoutes } from 'react-router-config';//renderRoutes 读取路由配置转化为 Route 标签
import { HashRouter } from 'react-router-dom';
import routes from './routes/index.js';

import {GlobalStyle} from './style';
import { IconStyle } from './assets/iconfont/iconfont';

function App() {
  return (
    <HashRouter>
      <GlobalStyle></GlobalStyle>
      <IconStyle></IconStyle>
      {renderRoutes(routes)}
    </HashRouter>
  );
}

export default App;
