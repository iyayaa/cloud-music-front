import React from 'react';
import { connect } from 'react-redux';//connect()根据配置信息，返回一个注入了 state 和 action creator 的 React 组件
import { getRankList } from './store'

function Rank (props) {
  return (
    <div>Rank</div>
  )
}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = (state) => ({
  rankList: state.getIn(['rank', 'rankList']),
  loading: state.getIn(['rank', 'loading']),
});
// 映射 dispatch 到 props 上
const mapDispatchToProps = (dispatch) => {
  return {
    getRankListDataDispatch() {
      dispatch(getRankList());
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Rank));