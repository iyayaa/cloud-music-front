import React,{useRef,useState} from "react";
import { CSSTransition } from 'react-transition-group';
import animations from "create-keyframe-animation";
import { getName } from "../../../api/utils";
import { NormalPlayerContainer, Top, Middle, Bottom, Operators, CDWrapper,ProgressWrapper } from "./style";
import { prefixStyle,formatPlayTime  } from "../../../api/utils";
import ProgressBar from "../../../baseUI/progress-bar/index.js";

function NormalPlayer(props) {
  const { currentSong:song, fullScreen,playing, percent, duration, currentTime } =  props;
  const { 
    toggleFullScreenDispatch:toggleFullScreen, 
    clickPlaying, onProgressChange
    // changeCurrentIndexDispatch, changeCurrentDispatch 
  } = props;


  const normalPlayerRef = useRef();
  const cdWrapperRef = useRef();

  const enter = () => {
    normalPlayerRef.current.style.display = "block";
    const { x, y, scale } = _getPosAndScale();// 获取 miniPlayer 图片中心相对 normalPlayer 唱片中心的偏移
    let animation = {
      0: {
        transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
      },
      60: {
        transform: `translate3d(0, 0, 0) scale(1.1)`
      },
      100: {
        transform: `translate3d(0, 0, 0) scale(1)`
      }
    };
    animations.registerAnimation({
      name: "move",
      animation,
      presets: {
        duration: 400,
        easing: "linear"
      }
    });
    animations.runAnimation(cdWrapperRef.current, "move");
  };

  const afterEnter = () => {
    // 进入后解绑帧动画
    const cdWrapperDom = cdWrapperRef.current;
    animations.unregisterAnimation("move");
    cdWrapperDom.style.animation = "";
  };

  //离开动画的逻辑:
  const transform = prefixStyle("transform");
  const leave = () => {
    if (!cdWrapperRef.current) return;
    const cdWrapperDom = cdWrapperRef.current;
    cdWrapperDom.style.transition = "all 0.4s";
    const { x, y, scale } = _getPosAndScale();
    cdWrapperDom.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
  };
  
  const afterLeave = () => {
    if (!cdWrapperRef.current) return;
    const cdWrapperDom = cdWrapperRef.current;
    cdWrapperDom.style.transition = "";
    cdWrapperDom.style[transform] = "";
    // 现在要把 normalPlayer 这个 DOM 给隐藏掉，因为 CSSTransition 的工作只是把动画执行一遍 
    // 不置为 none 现在全屏播放器页面还是存在
    normalPlayerRef.current.style.display = "none";
  };
  

  // //当前播放时间
  // const [currentTime, setCurrentTime] = useState(0);
  // //歌曲总时长
  // const [duration, setDuration] = useState(0);
  // //歌曲播放进度
  // let percent = isNaN(currentTime/duration) ? 0 : currentTime/duration;

  return (
    <CSSTransition
    classNames="normal"
    in={fullScreen}
    timeout={400}
    mountOnEnter
    onEnter={enter}
    onEntered={afterEnter}
    onExit={leave}
    onExited={afterLeave}
  >
    <NormalPlayerContainer ref={normalPlayerRef}>
      {/* 整个播放器背景 */}
      <div className="background">
        <img
          src={song.al.picUrl + "?param=300x300"}
          width="100%"
          height="100%"
          alt="歌曲图片"
        />
      </div>
      <div className="background layer"></div>
      {/* 整个播放器背景  END */}
      <Top className="top">
        <div className="back" onClick={() => toggleFullScreen(false)}>
          <i className="iconfont icon-back">&#xe662;</i>
        </div>
        <h1 className="title">{song.name}</h1>
        <h1 className="subtitle">{getName(song.ar)}</h1>
      </Top>
      <Middle ref={cdWrapperRef}>
        <CDWrapper>
          <div className="cd">
            <img
              className={`image play ${playing ? '': 'pause'}`}
              src={song.al.picUrl + "?param=400x400"}
              alt=""
            />
          </div>
          
        </CDWrapper>
      </Middle>
      <Bottom className="bottom">
        <ProgressWrapper>
          <span className="time time-l">{formatPlayTime(currentTime)}</span>
          <div className="progress-bar-wrapper">
            <ProgressBar percent={percent} percentChange={onProgressChange}></ProgressBar>
          </div>
          <div className="time time-r">{formatPlayTime(duration)}</div>
        </ProgressWrapper>
        <Operators>
          <div className="icon i-left" >
            <i className="iconfont">&#xe625;</i>
          </div>
          <div className="icon i-left">
            <i className="iconfont">&#xe6e1;</i>
          </div>
          <div className="icon i-center">
            {/* 中间暂停按钮 */}
            <i
              className="iconfont"
              onClick={e => clickPlaying(e, !playing)}
              dangerouslySetInnerHTML={{
                __html: playing ? "&#xe723;" : "&#xe731;"
              }}
            ></i>
          </div>
          <div className="icon i-right">
            <i className="iconfont">&#xe718;</i>
          </div>
          <div className="icon i-right">
            <i className="iconfont">&#xe640;</i>
          </div>
        </Operators>
      </Bottom>
    </NormalPlayerContainer>
    </CSSTransition>
  );
}

// 计算偏移的辅助函数。 miniPlayer 图片中心相对 normalPlayer 唱片（Middle）中心的偏移
const _getPosAndScale = () => {
  const targetWidth = 40; //mini 圆半径
  const paddingLeft = 40;//mini 圆心X  paddingLeft 20 + 半径20
  const paddingBottom = 30; //mini 圆心Y
  const paddingTop = 80; //Middle距顶部80
  const width = window.innerWidth * 0.8; //cd 的半径
  const scale = targetWidth /width;
  // 两个圆心的横坐标距离和纵坐标距离
  const x = -(window.innerWidth/ 2 - paddingLeft);
  const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
  return {
    x,
    y,
    scale
  };
};
export default React.memo(NormalPlayer);