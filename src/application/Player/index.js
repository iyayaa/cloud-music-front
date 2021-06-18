import React, { useRef, useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen
} from "./store/actionCreators";

import MiniPlayer from './miniPlayer';
import NormalPlayer from './normalPlayer';

import { getSongUrl,isEmptyObject, shuffle, findIndex } from "../../api/utils";

function Player(props) {
  

  const { fullScreen,playing,currentSong:immutableCurrentSong,currentIndex,
    mode,sequencePlayList:immutableSequencePlayList,playList:immutablePlayList,} = props;

  const { toggleFullScreenDispatch,togglePlayingDispatch,changeCurrentIndexDispatch,changeCurrentDispatch,
    changeModeDispatch,changePlayListDispatch
   } = props;
  
  const audioRef = useRef();

  const currentSong = immutableCurrentSong.toJS();
  const playList = immutablePlayList.toJS();
  const sequencePlayList = immutableSequencePlayList.toJS();

  //当前播放时间
  const [currentTime, setCurrentTime] = useState(0);
  //歌曲总时长
  const [duration, setDuration] = useState(0);
  //记录当前的歌曲，以便于下次重渲染时比对是否是一首歌
  const [preSong, setPreSong] = useState({});
  //歌曲播放进度
  let percent = isNaN(currentTime/duration) ? 0 : currentTime/duration;

  useEffect(() => {
    changeCurrentIndexDispatch(0);
  }, [])
  
  useEffect(() => {
    
    if(
      !playList.length ||
      currentIndex === -1 ||
      !playList[currentIndex] ||
      playList[currentIndex].id === preSong.id
      ) return;
    
    let current = playList[currentIndex];
    changeCurrentDispatch(current);//赋值currentSong
    setPreSong(current);
    audioRef.current.src = getSongUrl(current.id);
    setTimeout(() => {
      audioRef.current.play();
    });
    togglePlayingDispatch(true);//播放状态
    setCurrentTime(0);//从头开始播放
    // setDuration((current.dt/1000) | 0);//时长 |0 向下取整
    setDuration(Math.floor(current.dt/1000));//时长 
  },[playList, currentIndex]);

  useEffect(() => {
    playing ? audioRef.current.play() : audioRef.current.pause();
  }, [playing]);

  //切换播放状态
  const clickPlaying = (e, state) => {
    e.stopPropagation();//阻止目标元素的事件冒泡到父级元素
    togglePlayingDispatch(state);
  };
  //audio播放中
  const updateTime = e => {
    setCurrentTime(e.target.currentTime);
  };
  //进度条被滑动或点击时用来改变percent的回调
  const onProgressChange = curPercent => {
    const newTime = curPercent * duration;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
    if (!playing) {
      togglePlayingDispatch(true);
    }
  };

  //一首歌循环
  const handleLoop = () => {
    audioRef.current.currentTime = 0;
    // changePlayingState(true);
    togglePlayingDispatch(true);
    audioRef.current.play();
  };
  //上一首
  const handlePrev = () => {
    //播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex - 1;
    if (index < 0) index = playList.length - 1;
    if (!playing) togglePlayingDispatch(true);
    changeCurrentIndexDispatch(index);
  };
  //下一首
  const handleNext = () => {
    //播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex + 1;
    if (index === playList.length) index = 0;
    if (!playing) togglePlayingDispatch(true);
    changeCurrentIndexDispatch(index);
  };

  //切换播放模式
  const changeMode = () => {
    let newMode = (mode + 1) % 3;
    if (newMode === 0) {
      //顺序模式
      changePlayListDispatch(sequencePlayList);
      let index = findIndex(currentSong, sequencePlayList);
      changeCurrentIndexDispatch(index);
    } else if (newMode === 1) {
      //单曲循环
      changePlayListDispatch(sequencePlayList);
    } else if (newMode === 2) {
      //随机播放
      let newList = shuffle(sequencePlayList);
      let index = findIndex(currentSong, newList);
      changePlayListDispatch(newList);
      changeCurrentIndexDispatch(index);
    }
    changeModeDispatch(newMode);
  };
    
  return (
    <div>
      { isEmptyObject(currentSong) ? null : 
        <MiniPlayer song={currentSong} fullScreen={fullScreen} toggleFullScreen={toggleFullScreenDispatch}
          playing={playing} clickPlaying={clickPlaying} percent={percent}
        />
      }
      { isEmptyObject(currentSong) ? null :
        <NormalPlayer currentSong={currentSong} fullScreen={fullScreen} toggleFullScreenDispatch={toggleFullScreenDispatch}
          playing={playing} clickPlaying={clickPlaying}
          duration={duration} currentTime={currentTime} percent={percent} onProgressChange={onProgressChange}
          handlePrev={handlePrev}  handleNext={handleNext} mode={mode} changeMode={changeMode}
        ></NormalPlayer>
      }
      <audio ref={audioRef} onTimeUpdate={updateTime}></audio>
    </div>
  )
}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = state => ({
  fullScreen: state.getIn(["player", "fullScreen"]),
  playing: state.getIn(["player", "playing"]),
  currentSong: state.getIn(["player", "currentSong"]),
  showPlayList: state.getIn(["player", "showPlayList"]),
  mode: state.getIn(["player", "mode"]),
  currentIndex: state.getIn(["player", "currentIndex"]),
  playList: state.getIn(["player", "playList"]),
  sequencePlayList: state.getIn(["player", "sequencePlayList"])
});

// 映射 dispatch 到 props 上
const mapDispatchToProps = dispatch => {
  return {
    togglePlayingDispatch(data) {
      dispatch(changePlayingState(data));
    },
    toggleFullScreenDispatch(data) {
      dispatch(changeFullScreen(data));
    },
    togglePlayListdispatch(data) {
      dispatch(changeShowPlayList(data));
    },
    changeCurrentIndexDispatch(index) {
      dispatch(changeCurrentIndex(index));
    },
    changeCurrentDispatch(data) {
      dispatch(changeCurrentSong(data));
    },
    changeModeDispatch(data) {
      dispatch(changePlayMode(data));
    },
    changePlayListDispatch(data) {
      dispatch(changePlayList(data));
    }
  };
};

// 将 ui 组件包装成容器组件
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(Player));

