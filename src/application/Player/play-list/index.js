import React,{useState,useCallback,useRef} from 'react';
import {connect} from "react-redux";
import { PlayListWrapper, ScrollWrapper } from './style.js';
import { changeShowPlayList, changeCurrentIndex, changePlayMode, changePlayList, deleteSong,changeSequecePlayList, changeCurrentSong, changePlayingState } from "../store/actionCreators";
import { prefixStyle, getName } from './../../../api/utils';
import { CSSTransition } from 'react-transition-group';


function PlayList(props) {

  const transform = prefixStyle("transform");

  const {showPlayList,togglePlayListDispatch}= props;
  const [isShow, setIsShow] = useState(false);

  
  const listWrapperRef = useRef();
  // const playListRef = useRef();

  const onEnterCB = useCallback(() => {
    // 让列表显示
    setIsShow(true);
    // 从底下冒出来
    listWrapperRef.current.style[transform] = `translate3d(0, 100%, 0)`;
  }, [transform]);
  
  const onEnteringCB = useCallback (() => {
    // 让列表展现
    listWrapperRef.current.style["transition"] = "all 0.3s";
    listWrapperRef.current.style[transform] = `translate3d(0, 0, 0)`;
  }, [transform]);
  
  const onExitingCB = useCallback (() => {
    listWrapperRef.current.style["transition"] = "all 0.3s";
    listWrapperRef.current.style[transform] = `translate3d(0px, 100%, 0px)`;
  }, [transform]);
  
  const onExitedCB = useCallback (() => {
    setIsShow(false);
    listWrapperRef.current.style[transform] = `translate3d(0px, 100%, 0px)`;
  }, [transform]);

  return (
    <CSSTransition 
      in={showPlayList}
      timeout={300} 
      classNames="list-fade"
      onEnter={onEnterCB}
      onEntering={onEnteringCB}
      onExiting={onExitingCB}
      onExited={onExitedCB}
    >
      <PlayListWrapper style={isShow === true ? { display: "block" } : { display: "none" }}
      // ref={playListRef} 
      onClick={() => togglePlayListDispatch(false)} >
        <div className="list_wrapper" ref={listWrapperRef}>
          <ScrollWrapper>
            gfhgfdh
          </ScrollWrapper>
        </div>
      </PlayListWrapper>
    </CSSTransition>
  )
}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = (state) => ({
  showPlayList: state.getIn(['player', 'showPlayList']),
});
// 映射 dispatch 到 props 上
const mapDispatchToProps = (dispatch) => {
  return {
    togglePlayListDispatch(data) {
      dispatch(changeShowPlayList(data));
    }
  }
};

export default connect (mapStateToProps, mapDispatchToProps)(React.memo(PlayList));