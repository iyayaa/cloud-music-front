import React, { forwardRef,useState,useEffect, useRef, useImperativeHandle,useMemo } from "react"
import PropTypes from "prop-types"
import BScroll from "better-scroll"
import styled from'styled-components';

import Loading from '../loading/index.js';
import LoadingV2 from '../loading-v2/index.js';

import { debounce } from "../../api/utils";

const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`
const PullUpLoading = styled.div`
  position: absolute;
  left:0; right:0;
  bottom: 5px;
  width: 60px;
  height: 60px;
  margin: auto;
  z-index: 100;
`;

export const PullDownLoading = styled.div`
  position: absolute;
  left:0; right:0;
  top: 0px;
  height: 30px;
  margin: auto;
  z-index: 100;
`;

const Scroll = forwardRef((props, ref) => {//forwardRef 接受一个渲染函数(接收 props 和 ref 参数并返回一个 React 节点)


  const [bScroll, setBScroll] = useState();

  const scrollContaninerRef = useRef();

  const { direction, click, refresh, bounceTop, bounceBottom} = props;
  const { pullUp, pullDown, onScroll, pullUpLoading, pullDownLoading } = props;

  useEffect(() => {
    const scroll = new BScroll(scrollContaninerRef.current, {
      scrollX: direction === "horizental",
      scrollY: direction === "vertical",
      probeType: 3,
      click: click,
      bounce:{
        top: bounceTop,
        bottom: bounceBottom
      }
    });
    setBScroll(scroll);

    //清除effect
    return () => {
      setBScroll(null);
    }
    //eslint-disable-next-line
  }, []);

  //给实例绑定 scroll 事件
  useEffect(() => {
    if (!bScroll || !onScroll) return;
    bScroll.on('scroll', (scroll) => {
      onScroll(scroll);
    })
    return () => {
      //移除自定义事件监听器
      bScroll.off('scroll');
    }
  }, [onScroll, bScroll]);

  // useEffect(() => {
  //   if(!bScroll || !onScroll) return;
  //   bScroll.on('scroll', onScroll)
  //   return () => {
  //     bScroll.off('scroll', onScroll);
  //   }
  // }, [onScroll, bScroll]);

  //useMemo() 返回一个 memoized 值。把“创建”函数和依赖项数组作为参数传入 useMemo，它仅会在某个依赖项改变时才重新计算 memoized 值。这种优化有助于避免在每次渲染时都进行高开销的计算。
  //传入 useMemo 的函数会在渲染期间执行。请不要在这个函数内部执行与渲染无关的操作，诸如副作用这类的操作属于 useEffect 的适用范畴，而不是 useMemo。如果没有提供依赖项数组，useMemo 在每次渲染时都会计算新的值。
  let pullUpDebounce = useMemo(() => {
    return debounce(pullUp, 300)
  }, [pullUp]);
  // 千万注意，这里不能省略依赖，
  // 不然拿到的始终是第一次 pullUp 函数的引用，相应的闭包作用域变量都是第一次的，产生闭包陷阱。下同。
  
  let pullDownDebounce = useMemo(() => {
    return debounce(pullDown, 300)
  }, [pullDown]);

  // 之后直接调用 useMemo 返回的函数

  //上拉到底的判断，调用上拉刷新的函数
  useEffect(() => {
    if (!bScroll || !pullUp) return;
    const handlePullUp=()=>{
      // 判断是否滑动到了底部
      if (bScroll.y <= bScroll.maxScrollY + 100){
        pullUpDebounce();
      }
    }
    bScroll.on('scrollEnd', handlePullUp);
    // 解绑
    return () => {
      bScroll.off('scrollEnd',handlePullUp);
    }
  }, [pullUp,pullUpDebounce, bScroll]);

  //下拉的判断，调用下拉刷新的函数
  useEffect(() => {
    if (!bScroll || !pullDown) return;
    const handlePullDown = (pos) => {
      //判断用户的下拉动作
      if(pos.y > 50) {
        pullDownDebounce();
      }
    };
    bScroll.on('touchEnd', handlePullDown);
    return () => {
      bScroll.off('touchEnd', handlePullDown);
    }
  }, [pullDown, pullDownDebounce, bScroll]);

  //每次重新渲染都要刷新实例，防止无法滑动
  useEffect(() => {
    if (refresh && bScroll){
      bScroll.refresh();
    }
  });

  //useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值
  // 通过使用 useImperativeHandle，以便用 scrollRef.current.refresh() 的方式刷新 scroll 组件
  useImperativeHandle(ref, () => ({
    // 给外界暴露 refresh 方法
    refresh() {
      if (bScroll) {
        bScroll.refresh();
        bScroll.scrollTo(0, 0);
      }
    },
    // 给外界暴露 getBScroll 方法，提供 bs 实例
    getBScroll() {
      if (bScroll) {
        return bScroll;
      }
    }
  }));
  
  const PullUpdisplayStyle = pullUpLoading ? {display: ""} : { display:"none" };
  const PullDowndisplayStyle = pullDownLoading ? { display: ""} : { display:"none" };

  return (
    <ScrollContainer ref={scrollContaninerRef}>
      {props.children}
      {/* 滑到底部加载动画 */}
      <PullUpLoading style={ PullUpdisplayStyle }><Loading></Loading></PullUpLoading>
      {/* 顶部下拉刷新动画 */}
      <PullDownLoading style={ PullDowndisplayStyle }><LoadingV2></LoadingV2></PullDownLoading>
    </ScrollContainer>
  );
})

//默认 Prop 值 
Scroll.defaultProps = {
  direction: "vertical",
  click: true,// 是否支持点击
  refresh: true,
  onScroll:null,
  pullUpLoading: false,
  pullDownLoading: false,
  pullUp: null,
  pullDown: null,
  bounceTop: true,
  bounceBottom: true
};

Scroll.propTypes = {
  direction: PropTypes.oneOf (['vertical', 'horizental']),// 滚动的方向
  refresh: PropTypes.bool,// 是否刷新
  onScroll: PropTypes.func,// 滑动触发的回调函数
  pullUp: PropTypes.func,// 上拉加载逻辑
  pullDown: PropTypes.func,// 下拉加载逻辑
  pullUpLoading: PropTypes.bool,// 是否显示上拉 loading 动画
  pullDownLoading: PropTypes.bool,// 是否显示下拉 loading 动画
  bounceTop: PropTypes.bool,// 是否支持向上吸顶
  bounceBottom: PropTypes.bool// 是否支持向上吸顶
};

export default Scroll;