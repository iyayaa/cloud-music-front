
// 解析 [00:01.997] 这一类时间戳的正则表达式
const timeExp = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g

const STATE_PAUSE = 0
const STATE_PLAYING = 1
export default class Lyric{
  /**
   * @params {string} lrc  待解析的字符串
   * @params {function} handler   歌曲播放抵达某个时间戳的时候，执行相应的回调
  */ 
  constructor(lrc, hanlder = () => {}) {
    this.lrc = lrc;
    this.lines = [];// 这是解析后的数组，每一项包含对应的歌词和时间
    this.handler = hanlder;// 回调函数
    this.state = STATE_PAUSE;// 播放状态
    this.curLineIndex = 0;// 当前播放歌词所在的行数
    this.startStamp = 0;// 歌曲开始的时间戳

    this._initLines();
  }

  // 解析歌词字符串，生成 lines 数组
  _initLines() {
    const lines = this.lrc.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];// 如 "[00:01.997] 作词：薛之谦"
      let result = timeExp.exec(line);  // result : ["[00:01.997]", "00", "01", "997"]
      if (!result) continue;
      const txt = line.replace(timeExp, '').trim();// 现在把时间戳去掉，只剩下歌词文本
      if (txt) {
        // if (result[3].length === 3) {
        //   result[3] = result[3]/10;//[00:01.997] 中匹配到的 997 就会被切成 99
        // }
        this.lines.push({
          time: result[1] * 60 * 1000 + result[2] * 1000 + (result[3] || 0),
          // time: result[1] * 60 * 1000 + result[2] * 1000 + (result[3] || 0) * 10,
          // 转化具体到毫秒的时间，result [3] * 10 可理解为 (result / 100) * 1000
          txt
        });
      }
    }
    this.lines.sort((a, b) => {
      return a.time - b.time;
    });// 根据时间排序
  }

  //开始播放
  play(offset = 0, isSeek = false){//offset 时间进度，isSeek 用户是否手动调整进度
    if (!this.lines.length) {
      return;
    }
    this.state = STATE_PLAYING;

    // offset歌词所在行
    this.curLineIndex = this._findcurLineIndex(offset);

    // 现在正处于第 this.curLineIndex-1 行
    //获取this.curLineIndex-1所在歌词行的文字和索引给传入的handle回调函数
    this._callHandler(this.curLineIndex-1);

    // 根据进度判断歌曲开始播放时的时间戳
    this.startStamp = +new Date() - offset;

    if (this.curLineIndex < this.lines.length) {
      clearTimeout(this.timer);
      // 继续播放
      this._playRest(isSeek);
    }
  }

  _findcurLineIndex(time) {
    for(let i = 0; i < this.lines.length; i++) {
      if(time <= this.lines[i].time) {
        return i
      }
    }
    return this.lines.length - 1
  }
  _callHandler(i) {
    if (i < 0) {
      return
    }
    this.handler({
      txt: this.lines[i].txt,
      lineNum: i
    })
  }

  //往下继续播放
  _playRest(isSeek=false) {
    let line = this.lines[this.curLineIndex];
    let delay;
    if(isSeek) {//用户是否手动调整进度，切换播放状态
      delay = line.time - (+new Date() - this.startStamp);
    } else {
      // 拿到上一行的歌词的时间，算间隔
      let preTime = this.lines[this.curLineIndex - 1] ? this.lines[this.curLineIndex - 1].time : 0;
      delay = line.time - preTime;
    }
    this.timer = setTimeout(() => {
      this._callHandler(this.curLineIndex++);
      if(this.curLineIndex < this.lines.length && this.state === STATE_PLAYING) {
        this._playRest();
      }
    }, delay)
  }
  //暂停和播放 offset 当前所在的播放毫秒数
  togglePlay(offset) {
    if (this.state === STATE_PLAYING) {
      this.stop()
    } else {
      this.state = STATE_PLAYING
      this.play(offset, true)
    }
  }
  stop() {
    this.state = STATE_PAUSE
    clearTimeout(this.timer)
  }
  //切到某个时间点播放
  seek(offset) {
    this.play(offset, true)
  }
}
