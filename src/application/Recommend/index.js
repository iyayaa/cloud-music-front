import React, { useEffect } from 'react';
import Slider from '../../components/slider';
import RecommendList from '../../components/list';

import { Content } from './style';
import Scroll from '../../baseUI/scroll';

import { connect } from "react-redux";//connect()根据配置信息，返回一个注入了 state 和 action creator 的 React 组件
import * as actionTypes from './store/actionCreators';

import { forceCheck } from 'react-lazyload';

import Loading from '../../baseUI/loading/index';

function Recommend(props) {

  const { bannerList, recommendList,enterLoading } = props;
  const { getBannerDataDispatch, getRecommendListDataDispatch } = props;

  useEffect(() => {
    // 如果页面有数据，则不发请求
    //immutable 数据结构中长度属性 size
    if (!bannerList.size){
      getBannerDataDispatch();
    }
    if (!recommendList.size){
      getRecommendListDataDispatch();
    }
  },);

  const bannerListJS = bannerList ? bannerList.toJS() : [];
  const recommendListJS = recommendList ? recommendList.toJS() : [];


  return (
    <Content>
      <Scroll onScroll={forceCheck}>
        <div>
          <Slider bannerList={bannerListJS}></Slider>
          <RecommendList recommendList={recommendListJS}></RecommendList>
        </div>
      </Scroll>
      { enterLoading ? <Loading></Loading>:null}
      
    </Content> 
  )
}

//[mapStateToProps(state, [ownProps]): stateProps] (Function): 如果定义该参数，组件将会监听 Redux store 的变化。
//任何时候，只要 Redux store 发生改变，mapStateToProps 函数就会被调用。

//该回调函数必须返回一个纯对象，这个对象会与组件的 props 合并。

//如果你省略了这个参数，你的组件将不会监听 Redux store。
//如果指定了该回调函数中的第二个参数 ownProps，则该参数的值为传递到组件的 props，而且只要组件接收到新的 props，mapStateToProps 也会被调用（例如，当 props 接收到来自父组件一个小小的改动，那么你所使用的 ownProps 参数，mapStateToProps 都会被重新计算

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = (state) => ({
  // 不要在这里将数据 toJS
  // 不然每次 diff 比对 props 的时候都是不一样的引用，还是导致不必要的重渲染，属于滥用 immutable
  bannerList: state.getIn(['recommend', 'bannerList']),
  recommendList: state.getIn(['recommend', 'recommendList']),
  enterLoading: state.getIn(['recommend', 'enterLoading'])
});


// 映射 dispatch 到 props 上
//[mapDispatchToProps(dispatch, [ownProps]): dispatchProps] (Object or Function): 如果传递的是一个对象，那么每个定义在该对象的函数都将被当作 Redux action creator，对象所定义的方法名将作为属性名；每个方法将返回一个新的函数，函数中dispatch方法会将action creator的返回值作为参数执行。这些属性会被合并到组件的 props 中。

//如果传递的是一个函数，该函数将接收一个 dispatch 函数，然后由你来决定如何返回一个对象，这个对象通过 dispatch 函数与 action creator 以某种方式绑定在一起（提示：你也许会用到 Redux 的辅助函数 bindActionCreators()）。如果你省略这个 mapDispatchToProps 参数，默认情况下，dispatch 会注入到你的组件 props 中。
//如果指定了该回调函数中第二个参数 ownProps，该参数的值为传递到组件的 props，而且只要组件接收到新 props，mapDispatchToProps 也会被调用
const mapDispatchToProps = (dispatch) => {
  return {
    getBannerDataDispatch() {
      dispatch(actionTypes.getBannerList());
    },
    getRecommendListDataDispatch() {
      dispatch(actionTypes.getRecommendList());
    },
  }
};

// 将 ui 组件包装成容器组件
export default connect(
  mapStateToProps,//指定如何把当前 Redux store state 映射到展示组件的 props 中
  mapDispatchToProps//2 容器组件分发 action, 接收 dispatch() 方法并返回期望注入到展示组件的 props 
  )(React.memo(Recommend));//connect()根据配置信息，返回一个注入了 state 和 action creator 的 React 组件。函数将被调用两次。第一次是设置参数，第二次是组件与 Redux store 连接