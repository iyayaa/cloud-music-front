import React,{useState, useEffect, useRef, useCallback} from 'react';
import { CSSTransition } from "react-transition-group";
import { Container,ImgWrapper,CollectButton,SongListWrapper,BgLayer } from "./style";
import  Header  from './../../baseUI/header/index';
import Scroll from "../../baseUI/scroll/index";
import SongsList from "../SongsList";
import { HEADER_HEIGHT } from "./../../api/config";

import { connect } from 'react-redux';
import { getSingerInfo, changeEnterLoading } from "./store/actionCreators";
import Loading from "./../../baseUI/loading/index.js";
import MusicNote from "../../baseUI/music-note/index";



function Singer(props) {

  const { 
    artist: immutableArtist, 
    songs: immutableSongs, 
    loading,
  } = props;
  
  const { getSingerDataDispatch } = props;
  
  const artist = immutableArtist.toJS();
  const songs = immutableSongs.toJS();

  const [showStatus, setShowStatus] = useState(true);

  const collectButton = useRef();
  const imageWrapper = useRef();
  const songScrollWrapper = useRef();
  const songScroll = useRef();
  const header = useRef();
  const layer = useRef();
  // 图片初始高度
  const initialHeight = useRef(0);

  // 往上偏移的尺寸，露出圆角
  const OFFSET = 5;

  //初始化时，将整个歌曲列表ScrollWrapper的 top 设置为正好处在图片下方
  useEffect(() => {

    const id = props.match.params.id;
    getSingerDataDispatch(id);

    let h = imageWrapper.current.offsetHeight;//获取歌手图片高度
    initialHeight.current = h;

    songScrollWrapper.current.style.top = `${h - OFFSET}px`;
    // 把遮罩放在歌曲列表下面
    layer.current.style.top = `${h - OFFSET}px`;
    
    songScroll.current.refresh();
    // eslint-disable-next-line
  }, []);

  const handleScroll = useCallback( pos => {
      // console.log(pos.y)
      let height = initialHeight.current;//歌手图片高度
      const newY = pos.y;
      const imageDOM = imageWrapper.current;
      const buttonDOM = collectButton.current;
      const headerDOM = header.current;
      const layerDOM = layer.current;

      const minScrollY = -(height - OFFSET) + HEADER_HEIGHT;

      // 指的是滑动距离占图片高度的百分比
      const percent = Math.abs(newY/height);

      //处理往下拉的情况，效果：图片背景放大，按钮跟着偏移
      if (newY > 0) {
        imageDOM.style["transform"] = `scale(${1 + percent})`;
        buttonDOM.style["transform"] = `translate3d(0, ${newY}px, 0)`;
        //底部白色
        layerDOM.style.top = `${height - OFFSET + newY}px`;
      } 

      //往上滑动，但是还没超过 Header 部分
      else if (newY >= minScrollY) {
        // console.log('minScrollY:',minScrollY)
        layerDOM.style.top = `${height - OFFSET - Math.abs(newY)}px`;
        
        // 按钮跟着移动且渐渐变透明
        buttonDOM.style["transform"] = `translate3d(0, ${newY}px, 0)`;
        buttonDOM.style["opacity"] = `${1 - percent * 2}`;

        // 下拉回去的时候ScrollList层叠比图片高
        // layerDOM.style.zIndex = 1;
        imageDOM.style.paddingTop = "75%";
        imageDOM.style.height = 0;
        // imageDOM.style.zIndex = -1;
        imageDOM.style.zIndex = 50;
      } 

      //往上滑动，但是遮罩超过 Header 部分
      else if (newY < minScrollY) {
        // 往上滑动，但是超过 Header 部分
        layerDOM.style.top = `${HEADER_HEIGHT - OFFSET}px`;
        // layerDOM.style.zIndex = 1;
        // 防止歌单内容遮住 Header
        headerDOM.style.zIndex = 100;
        // 图片高度与 Header 一致,提升zIndex遮住歌单内容
        imageDOM.style.height = `${HEADER_HEIGHT}px`;
        imageDOM.style.paddingTop = 0;
        imageDOM.style.zIndex = 99;
      }

  },[])

  const setShowStatusFalse = useCallback(() => {
    setShowStatus(false);
  }, []);

  const musicNoteRef = useRef();
  const musicAnimation = (x, y) => {
    musicNoteRef.current.startAnimation({ x, y });
  };

  return (
    <CSSTransition
      in={showStatus}
      timeout={300}
      classNames="fly"
      appear={true}
      unmountOnExit
      onExited={() => props.history.goBack()}
    >
      <Container>
        <Header title={artist.name} handleClick={setShowStatusFalse} ref={header}></Header>
        <ImgWrapper ref={imageWrapper} bgUrl={artist.picUrl}>
          <div className="filter"></div>
        </ImgWrapper>
        <CollectButton ref={collectButton}>
          <i className="iconfont">&#xe62d;</i>
          <span className="text"> 收藏 </span>
        </CollectButton>
        <BgLayer ref={layer}></BgLayer>
        <SongListWrapper ref={songScrollWrapper}>
          {/* 歌曲列表部分 */}
          <Scroll ref={songScroll}  onScroll={handleScroll}>
            <SongsList songs={songs} showCollect={false} musicAnimation={musicAnimation}>

            </SongsList>
          </Scroll>
        </SongListWrapper>
        { loading ? (<Loading></Loading>) : null}
        <MusicNote ref={musicNoteRef}></MusicNote>
      </Container>
    </CSSTransition>
  )
}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = state => ({
  artist: state.getIn(["singerInfo", "artist"]),
  songs: state.getIn(["singerInfo", "songsOfArtist"]),
  loading: state.getIn(["singerInfo", "loading"]),
});
// 映射 dispatch 到 props 上
const mapDispatchToProps = dispatch => {
  return {
    getSingerDataDispatch(id) {
      dispatch(changeEnterLoading(true));
      dispatch(getSingerInfo(id));
    }
  };
};

export default connect(mapStateToProps,mapDispatchToProps)(React.memo(Singer));
