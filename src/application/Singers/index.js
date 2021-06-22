import React,{ useEffect,useContext} from 'react';
import Horizen from '../../baseUI/horizen-item';
import Scroll from '../../baseUI/scroll';
import { categoryTypes,alphaTypes } from '../../api/config';
import { NavContainer,ListContainer,List,ListItem } from "./style";

import { 
  getSingerList, 
  getHotSingerList, 
  changeEnterLoading, 
  changePageCount, 
  refreshMoreSingerList,
  changePullUpLoading, 
  changePullDownLoading, 
  refreshMoreHotSingerList 
} from './store/actionCreators';
import {connect} from 'react-redux';

import Loading from '../../baseUI/loading';
import  LazyLoad, {forceCheck} from 'react-lazyload';

import {CategoryDataContext,CHANGE_ALPHA , CHANGE_CATEGORY } from './data.js'

import { renderRoutes } from 'react-router-config';

function Singers(props) {
  // let [category, setCategory] = useState('');
  // let [alpha, setAlpha] = useState('');
  const {data, dispatch} = useContext(CategoryDataContext);
  const {category, alpha} = data.toJS();

  let handleUpdateAlpha = (val) => {
    // setAlpha(val);
    dispatch({type: CHANGE_ALPHA, data: val});
    updateDispatch(category, val);
  }

  let handleUpdateCatetory = (val) => {
    // setCategory(val);
    dispatch({type: CHANGE_CATEGORY, data: val});
    updateDispatch(val,category);
    
  }

  const { singerList,pullUpLoading, pullDownLoading, pageCount, enterLoading,songsCount } = props;
  const { getHotSingerDispatch, updateDispatch, pullDownRefreshDispatch, pullUpRefreshDispatch } = props;

  useEffect (() => {
    if (!singerList.size) {
      getHotSingerDispatch();
    }
    // eslint-disable-next-line
  }, []);

  // 渲染函数，返回歌手列表
  const renderSingerList = () => {

    const list = singerList ? singerList.toJS(): [];

    const enterDetail = (id)  => {
      props.history.push(`/singers/${id}`);
    };

    return (
      <List>
        {
          list.map((item, index) => {
            return (
              <ListItem key={item.accountId+""+index} onClick={() => enterDetail(item.id)}>
                <div className="img_wrapper">
                <LazyLoad placeholder={<img width="100%" height="100%" src={require('./singer.png').default} alt="music"/>}>
                  <img src={`${item.picUrl}?param=300x300`} width="100%" height="100%" alt="music"/>
                </LazyLoad>
                </div>
                <span className="name">{item.name}</span>
              </ListItem>
            )
          })
        }
      </List>
    )
  };

  const handlePullUp = () => {
    pullUpRefreshDispatch(category, alpha, category === '', pageCount);
  };
  
  const handlePullDown = () => {
    pullDownRefreshDispatch(category, alpha);
  };


  return (
    <div>
      <NavContainer>
        <Horizen list={categoryTypes} title={"分类 (默认热门):" } handleClick={handleUpdateCatetory} oldVal={category}></Horizen>
        <Horizen list={alphaTypes} title={"首字母:"} handleClick={val => handleUpdateAlpha(val)} oldVal={alpha}></Horizen>
      </NavContainer>
      <ListContainer play = {songsCount}>
        <Scroll pullUp={ handlePullUp } pullDown = { handlePullDown } pullUpLoading = { pullUpLoading } pullDownLoading = { pullDownLoading } onScroll={forceCheck}>
          { renderSingerList() }
        </Scroll>
        <Loading show={enterLoading}></Loading>
      </ListContainer>
      { renderRoutes(props.route.routes) }
    </div>
  )
}

const mapStateToProps = (state) => ({
  singerList: state.getIn(['singers', 'singerList']),
  enterLoading: state.getIn(['singers', 'enterLoading']),
  pullUpLoading: state.getIn(['singers', 'pullUpLoading']),
  pullDownLoading: state.getIn(['singers', 'pullDownLoading']),
  pageCount: state.getIn(['singers', 'pageCount']),
  songsCount: state.getIn(['player', 'playList']).size,//判断当前 playList 的长度，如果大于 0 则正在播放，等于 0 则没有
});
const mapDispatchToProps = (dispatch) => {
  return {
    getHotSingerDispatch() {
      dispatch(getHotSingerList());
    },
    updateDispatch(category, alpha) {
      dispatch(changePageCount(0));//由于改变了分类，所以pageCount清零
      dispatch(changeEnterLoading(true));
      dispatch(getSingerList(category, alpha));
    },
    // 滑到最底部刷新部分的处理
    pullUpRefreshDispatch(category, alpha, hot, count) {
      dispatch(changePullUpLoading(true));
      dispatch(changePageCount(count+1));
      if(hot){
        dispatch(refreshMoreHotSingerList());
      } else {
        dispatch(refreshMoreSingerList(category, alpha));
      }
    },
    //顶部下拉刷新
    pullDownRefreshDispatch(category, alpha) {
      dispatch(changePullDownLoading(true));
      dispatch(changePageCount(0));//属于重新获取数据
      if(category === '' && alpha === ''){
        dispatch(getHotSingerList());
      } else {
        dispatch(getSingerList(category, alpha));
      }
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Singers));