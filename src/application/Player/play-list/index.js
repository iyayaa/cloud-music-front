import React,{useState,useCallback,useRef} from 'react';
import {connect} from "react-redux";
import { PlayListWrapper, ScrollWrapper,ListHeader,ListContent } from './style.js';
import { changeShowPlayList, changeCurrentIndex, changePlayMode, changePlayList, deleteSong,changeSequecePlayList, changeCurrentSong, changePlayingState } from "../store/actionCreators";
import { prefixStyle, getName } from './../../../api/utils';
import { playMode } from "../../../api/config";
import { CSSTransition } from 'react-transition-group';
import Scroll from '../../../baseUI/scroll';



function PlayList(props) {

  const transform = prefixStyle("transform");

  const {showPlayList,
    playList:immutablePlayList,
    currentIndex,
    currentSong:immutableCurrentSong,
    mode,
    sequencePlayList:immutableSequencePlayList
  }= props;

  const {
    togglePlayListDispatch,
    changeCurrentIndexDispatch,
    deleteSongDispatch,
    changePlayListDispatch,
    changeModeDispatch,
  } = props;

  const [isShow, setIsShow] = useState(false);

  const currentSong = immutableCurrentSong.toJS();
  const playList = immutablePlayList.toJS();
  const sequencePlayList = immutableSequencePlayList.toJS();

  
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

  const getCurrentIcon = (item) => {
    // 是不是当前正在播放的歌曲
    const current = currentSong.id === item.id;
    const className = current ? 'icon-play' : '';
    const content = current ? '&#xe6e3;': '';
    return (
      <i className={`current iconfont ${className}`} dangerouslySetInnerHTML={{__html:content}}></i>
    )
  };
  const getPlayMode = () => {
    let content, text;
    if (mode === playMode.sequence) {
      content = "&#xe625;";
      text = "顺序播放";
    } else if (mode === playMode.loop) {
      content = "&#xe653;";
      text = "单曲循环";
    } else {
      content = "&#xe61b;";
      text = "随机播放";
    }
    return (
      <div>
        <i className="iconfont" onClick={(e) => changeMode(e)} dangerouslySetInnerHTML={{__html: content}}></i>
        <span className="text" onClick={(e) => changeMode(e)}>{text}</span>
      </div>
    )
  };

  //点击歌曲，切歌
  const handleChangeCurrentIndex = (index) => {
    if (currentIndex === index) return;
    changeCurrentIndexDispatch(index);
  }
  //删除歌曲
  const handleDeleteSong = (e, song) => {
    e.stopPropagation();
    deleteSongDispatch(song);
  };

  const changeMode = (e) => {
    // let newMode = (mode + 1) % 3;
    // 具体逻辑TODO
  };

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
        <div className="list_wrapper" ref={listWrapperRef} onClick={e => e.stopPropagation()}>
          <ListHeader>
            <h1 className="title">
              { getPlayMode() }
              <span className="iconfont clear" 
              // onClick={handleShowClear}
              >&#xe63d;</span>
            </h1>
          </ListHeader>
          <ScrollWrapper>
            <Scroll>
              <ListContent>
                {
                  playList.map((item, index) => {
                    return (
                      <li className="item" key={item.id} onClick={() => handleChangeCurrentIndex(index)}>
                        {getCurrentIcon(item)}
                        <span className="text">{item.name} - {getName(item.ar)}</span>
                        <span className="like">
                          <i className="iconfont">&#xe601;</i>
                        </span>
                        <span className="delete" onClick={(e) => handleDeleteSong(e, item)}>
                          <i className="iconfont">&#xe63d;</i>
                        </span>
                      </li>
                    )
                  })
                }
              </ListContent>
            </Scroll>
          </ScrollWrapper>
        </div>
      </PlayListWrapper>
    </CSSTransition>
  )
}




// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = (state) => ({
  showPlayList: state.getIn(['player', 'showPlayList']),
  mode: state.getIn(['player', 'mode']),
  currentIndex: state.getIn(['player', 'currentIndex']),
  currentSong: state.getIn(['player', 'currentSong']),
  playList: state.getIn(['player', 'playList']),// 播放列表
  sequencePlayList: state.getIn(['player', 'sequencePlayList']),// 顺序排列时的播放列表
});
// 映射 dispatch 到 props 上
const mapDispatchToProps = (dispatch) => {
  return {
    togglePlayListDispatch(data) {
      dispatch(changeShowPlayList(data));
    },
    // 修改index，也就是切歌
    changeCurrentIndexDispatch(data) {
      dispatch(changeCurrentIndex(data));
    },
    //删除歌曲
    deleteSongDispatch(data){
      dispatch(deleteSong(data));
    },
    // 修改播放模式
    changeModeDispatch(data) {
      dispatch(changePlayMode(data));
    },
    // 修改歌曲列表
    changePlayListDispatch(data) {
      dispatch(changePlayList(data));
    },
  }
};

export default connect (mapStateToProps, mapDispatchToProps)(React.memo(PlayList));