import React, {useEffect, useRef, useState, useMemo} from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
// import {StructureNode, StructureQuestion} from '@/components';
import {StructureQuestion} from '@/components';
import StructureNode from './structure-node';
// import LoadingPanel from '@/components/loading-panel';
import {connectInfoStore, InfoActions} from '@/store/info';
import {setAuth} from '@/api/axios';
import {connector} from '@/views/tutor-board/@instruction';
import {useLocation} from 'react-router';
import {tutor as tutorApi, questions} from '@/api';
import store from '@/store';
// import ProgressBar from './progress-bar';
// import {TextContent} from '@/views/tutor-board/@instruction/content';
// import ContentKp from './content-kp';
import BottomMessage from './bottom-message';

import {color, RGBColor} from 'd3-color';
import Fade from '@material-ui/core/Fade';
import SVGA from 'svgaplayerweb';
import {effectSound, gotoOld} from '@/utils';

import lampAudio from './lamp-audio';
import {messageEvent} from './message.event';

import LampError from './lamp-error';
import LoadingPanel from '@/components/loading-panel';
import {PGNode} from '@/types/instruction';

const useStyles = makeStyles((theme: Theme) => {
    // const backgroundUrl = theme.palette.type === 'dark' ? '/images/background.jpg' : '/images/background_white.jpg';
    const backgroundUrl = theme.palette.type === 'dark' ? '/images/background-2.jpg' : '/images/background_white.jpg';

    const gradient = color(theme.palette.type === 'dark' ? 'rgba(62, 62, 62, 1)' : 'rgba(255, 255, 255, 1)') as RGBColor;
    gradient.opacity = 0.65;
    const gradient1 = gradient.toString();
    gradient.opacity = 0;
    const gradient2 = gradient.toString();
    gradient.opacity = 1;

    const lampColor = color(theme.palette.text.primary) as RGBColor;
    lampColor.opacity = 0.85;

    return createStyles({
        root: {
            background: `url('${backgroundUrl}') repeat`,
            height: `100vh`,
            // height: 'calc(100vh - 100px)',
            overflow: 'auto',
            // color: theme.palette.text.primary,
            color: lampColor.toString(),
            fontSize: '1.8rem',
            padding: '0 10px'
        },
        content: {
            paddingTop: 125,
            marginBottom: 30
        },
        kps: {
            overflow: 'hidden',
            fontSize: '2rem'
        },
        bottomBlock: {
            background: `url('${backgroundUrl}') repeat`,
            width: '100%',
            height: 100,
            position: 'fixed',
            bottom: 0,
            left: 0,
            '& .bottomMask': {}
        },
        endAnimate: {
            position: 'relative',
            margin: 'auto',
            height: 140,
            width: 168
        },
        topMask: {
            position: 'fixed',
            zIndex: 9,
            top: 0,
            left: 0,
            right: 0,
            height: 135,
            background: `linear-gradient(180deg, ${gradient} 0%, ${gradient1} 53%, ${gradient2} 100%);`,
            pointerEvents: 'none'
        },
        contentBlock: {
            width: '100%',
            // height: 90
            height: 190
        },
        endPage: {
            width: '100%',
            height: '100%',
            position: 'relative',
            // paddingTop: 100
            paddingTop: '5rem'
        },
        endBtnContainer: {
            width: '100%',
            // height: 93,
            position: 'absolute',
            bottom: 130,
            left: 0,
            padding: '0 1.4rem',
            '& .end-btn': {
                // width: 178,
                // height: 93,
                // borderRadius: 47,
                width: '8.8rem',
                height: '4.8rem',
                borderRadius: '32.4rem',
                background: '#0188FB',
                color: '#fff',
                // fontSize: '2rem'
                fontSize: '1.5rem'
            }
        },
        likeContainer: {
            position: 'relative',
            margin: 'auto',
            width: 250,
            height: 250,
            transformOrigin: 'center center',
            transform: 'scale(0.8)'
        },
        likeAnimate: {
            // position: 'relative',
            // margin: 'auto',
            width: 250,
            height: 250
        },
        likeWaveAnimate: {
            width: 250,
            height: 250,
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'none'
        },
        endText: {
            // marginTop: 20,
            textAlign: 'center',
            // fontSize: '2rem'
            fontSize: '1.5rem',
            marginTop: -25
        },
        bottomMask: {
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 128,
            background: 'linear-gradient(0deg,rgba(62,62,62,1) 0%,rgba(62,62,62,0.65) 71%,rgba(62,62,62,0) 100%)',
            zIndex: 9,
            pointerEvents: 'none'
        }
    });
});

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

declare var window: any;

window.isPause = false;

let isPause: boolean = false;
let done: any = null;
let timeLimit: number = 10;
let myInterval: any = null;
let ended: boolean = false;
// let contentHeight: number = 0;
let qId: any = null;
let fontSize: number = 60;
let timeout: any = null;

const Lamp = (props: any) => {
    const classes = useStyles();
    const contentRef = useRef(null);

    const query = useQuery();

    const endAnimateRef = useRef(null);
    const likeAnimateRef = useRef(null);
    const waveAnimateRef = useRef(null);

    const [endAnimate, setEndAnimate] = useState(false);
    const [endAnimatePlayer, setEndAnimatePlayer] = useState(null as any);
    const [endVisible, setEndVisible] = useState(false);
    const [LikeAnimatePlayer, setLikeAnimatePlayer] = useState(null as any);
    // const [WaveAnimatePlayer, setWaveAnimatePlayer] = useState(null as any);
    const [likeVisible, setLikeVisible] = useState(false);
    const [isLike, setIsLike] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const [qsFinished, setQsFinished] = useState(false);

    //倒计时
    const [countdown, setCountDown] = useState(10);

    //是否显示报错页
    const [errorVisible, setErrorVisible] = useState(false);

    //是否本地开发环境
    const isDev = useMemo(() => {
        return !window.AIT;
    }, []);

    /**
     * 获取查询参数
     */
    useEffect(() => {
        console.log('in page js: ', new Date());
        const questionId = query.get('id') || '';
        const type = query.get('type') || 'explain';
        const appId = query.get('appId') || undefined;
        const token = query.get('token') || '';
        const room = query.get('roomId') || '';
        qId = questionId || null;

        setAuth(token, appId);

        store.dispatch({type: InfoActions.setGlobalScroll, payload: true});
        store.dispatch({type: InfoActions.setIsLamp, payload: true});

        //注册事件
        messageEvent.on('math-end', data => {
            done = data;
            if (isPause) {
                // done = data;
                console.log('math end in pause');
                return;
            }
            data.run();
        });

        messageEvent.on('lamp-start', () => {
            if (!qId) return;
            connector(qId as any, type as any, room, false).then(result => {
                if (result === 'aaa111') return;
                start();
                //@ts-ignore
                import('../../styles/lamp.css').then(() => {});
            });
        });

        messageEvent.on('refreshToken', () => {
            window.AIT && window.AIT.refreshToken('refreshToken');
        });

        messageEvent.on('NetworkError', () => {
            store.dispatch({type: InfoActions.setNetError, payload: 'netError'});
        });

        if (window.AIT) {
            registerCommandListener();
        } else {
            messageEvent.emit('lamp-start');

            //开发测试用
            // window.audioFeedback = (result: any) => {
            //     const {code, data} = result;
            //     if (code !== 0) return;
            //     const cmd = data.cmd;
            //     switch (cmd) {
            //         case 'next':
            //             next();
            //             break;
            //         case 'repeat':
            //             restart();
            //             break;
            //         case 'pause':
            //             pause();
            //             break;
            //         case 'play':
            //             replay();
            //             break;
            //         case 'start':
            //             qId = data.id
            //             messageEvent.emit('lamp-start');
            //             break
            //     }
            // };
        }

        // getDetail(questionId)

        //防止高度缩小变化导致滚动塌陷
        // const tutorBoardContent = document.querySelector('#tutorBoardContent') as HTMLElement;
        // const callback = (mutations: any) => {
        //     // console.log(mutations)
        //     const height = tutorBoardContent.clientHeight;
        //     if (contentHeight < height) {
        //         contentHeight = height;
        //         tutorBoardContent.style.minHeight = `${height}px`;
        //     }
        // };
        // const config = {
        //     // attributes: true,
        //     childList: true,
        //     characterData: true,
        //     subtree: true
        // };
        // const observer = new MutationObserver(callback);
        // observer.observe(tutorBoardContent, config);

        //缩小讲解字体大小与获取字体大小
        window.resetFontSize = () => {
            const setFontSize = (size: number) => {
                fontSize = size;
                const el = document.querySelector('#tutorBoardContent') as HTMLDivElement;
                el.style.fontSize = `${fontSize * 0.75}px`;
                return true;
            };
            switch (fontSize) {
                case 36:
                    return false;
                case 48:
                    return setFontSize(36);
                case 60:
                    return setFontSize(48);
            }
        };

        const fontMap = new Map();
        fontMap.set(60, '大');
        fontMap.set(48, '中');
        fontMap.set(36, '小');
        window.getFontSize = () => fontMap.get(fontSize);

        window.onloadTag = false;
    }, []);

    // async function getDetail(id: string) {
    //   const response = await questions.getQuestionDetail({id})
    //   console.log(response)
    // }

    useEffect(() => {
        const tag = window.AIT && window.AIT.showErrorView && window.AIT.hideErrorView;
        if (props.info.netError) {
            if (tag) {
                window.AIT.showErrorView(props.info.netError === 'default' ? -2 : -1);
            } else {
                setErrorVisible(true);
            }
        } else {
            tag ? window.AIT.hideErrorView() : setErrorVisible(false);
        }
    }, [props.info.netError]);

    /**
     * 设置加载状态
     */
    useEffect(() => {
        if (!props.info.questionNode) return;

        !loaded && setTimeout(() => setLoaded(true), 200);
    }, [loaded, props.info.questionNode]);

    /**
     * 设置进入详情讲解
     */
    useEffect(() => {
        const currentPoint = props.info.navPoints.filter((point: PGNode) => point.currentStep);
        if (!currentPoint.length) return;
        const point = currentPoint[0];
        const {name} = point;
        if (name !== '题目' && name !== '元信息') setQsFinished(true);
    }, [props.info.navPoints]);

    /**
     * 加载结束动画
     */
    useEffect(() => {
        initEndSvga();
    }, []);

    async function initEndSvga() {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const player = new SVGA.Player((endAnimateRef.current as unknown) as HTMLDivElement);
        const parser = new SVGA.Parser();
        player.loops = 1;

        player.onFinished(async () => {
            player.stepToPercentage(100);
            endCallback();
        });

        parser.load('/svga/ending.svga', (videoItem: any) => {
            player.setVideoItem(videoItem);
        });

        setEndAnimatePlayer(player);
    }

    async function endCallback() {
        setEndAnimate(false);
        setEndVisible(true);

        await new Promise(resolve => setTimeout(resolve, 500));
        loadLikeAnimate();
        loadLikeWaveAnimate();

        await new Promise(resolve => setTimeout(resolve, 1000));
        const target = document.querySelector('#endPage') as HTMLElement;
        gotoOld(target, {container: '#container', duration: 800, offset: 0}).then(() => {
            bindScrollElement();
            startCountdown();
        });
    }

    /**
     * 显示结束动画svga
     */
    async function showEndAnimate() {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setEndAnimate(true);

            endAnimatePlayer.startAnimation();
            effectSound.ending.play();
        } catch (err) {
            console.log(err);
            endCallback();
        }
    }

    /**
     * 监听结束状态
     */
    useEffect(() => {
        ended = props.info.ended;
        if (props.info.ended) {
            showEndAnimate();
            messageEvent.emit('end-lamp-hb');
        }
    }, [props.info.ended]);

    /**
     * 注册方法用
     */

    function registerCommandListener() {
        window.audioFeedback = (result: any) => {
            //result:{"code":0成功-1,失败,"msg":"","data":{"cmd",""}}
            console.log('audioFeedback', result);
            const {code, data} = result;
            if (code !== 0) return;
            const cmd = data.cmd;
            switch (cmd) {
                case 'next':
                    next();
                    break;
                case 'repeat':
                    restart();
                    // window.location.reload();
                    break;
                case 'pause':
                    pause();
                    break;
                case 'play':
                    replay();
                    break;
                case 'start':
                    qId = data.id;
                    messageEvent.emit('lamp-start');
                    break;
            }
        };

        //注册给安卓调用的语音控制方法
        window.AIT.registerCommandListener('audioFeedback');

        //注册刷新token的方法
        window.refreshToken = (result: any) => {
            // {"code":0成功-1,失败,"msg":"","data":{"token",""}}
            console.log('refreshToken', result);
            const {code, data} = result;
            if (code === 0) {
                const appId = query.get('appId') || undefined;
                const token = data.token;
                setAuth(token, appId);
            }

            messageEvent.emit('lamp-start');
        };

        messageEvent.emit('lamp-start');
    }

    /**
     * 开始播放
     */
    function start() {
        const info = store.getState().info;

        console.log('begin start api');
        tutorApi
            .startExplain({
                questionId: info.questionId,
                roomId: info.roomId,
                type: info.pgType,
                initOnly: false
                // skipToPath: info.currentPath || undefined,
                // skipInitProcess: true
                // hilMode: info.hilMode
            })
            .then(() => {
                console.log('finish start api');
            })
            .catch(() => {
                props.setNetError('netError');
            });

        props.setCurrentPath('');

        messageEvent.emit('start-lamp-hb');
        messageEvent.emit('message-clear');
        isPause = false;
        window.isPause = false;
    }

    /**
     * 暂停播放
     */
    function pause() {
        if (ended) {
            console.log('pause in end');
            myInterval && cleanInterval();
            setCountDown(0);
            !isDev && showControl('');
            return;
        }
        console.log('pause');
        lampAudio.pause(true);
        isPause = true;
        window.isPause = true;
    }

    /**
     * 继续播放
     */
    async function replay() {
        console.log('replay', isPause);
        // if (!isPause) return;
        await new Promise(resolve => setTimeout(resolve, 1500));
        lampAudio.play();
        done && done.run();
        isPause = false;
        window.isPause = false;
    }

    /**
     * 重播
     */
    function restart() {
        //清楚定时器
        myInterval && cleanInterval();
        timeLimit = 10;

        pause();
        !isDev && hideControl();
        const target = document.querySelector('#questionContent') as HTMLElement;
        gotoOld(target, {container: '#container', duration: 800}).then(async () => {
            // setEndVisible(false);
            // console.log(props.info.initStructure);
            // store.dispatch({type: InfoActions.setStructure, payload: {...props.info.initStructure}});
            await new Promise(resolve => setTimeout(resolve, 500));
            start();
        });
    }

    function restartEntry() {
        //@ts-ignore
        // window.audioFeedback({code: 0, data: {cmd: 'repeat'}});
        // if (window.AIT) {
        //     //判断台灯环境or本地开发环境
        //     //@ts-ignore
        //     window.AIT.refreshToken('refreshToken');
        // } else {
        //     restart();
        // }
    }

    /**
     * 下一题
     */
    function next() {
        console.log('quit');
        window.AIT && window.AIT.exit();
    }

    /**
     * 加载点赞动画
     */
    function loadLikeAnimate() {
        const player = new SVGA.Player((likeAnimateRef.current as unknown) as HTMLDivElement);
        const parser = new SVGA.Parser();
        player.loops = 1;

        player.onFinished(() => {
            player.stepToPercentage(100);
        });

        parser.load('/svga/Like.svga', (videoItem: any) => {
            player.setVideoItem(videoItem);

            const key = `lamp-${qId}`;
            if (window.localStorage.getItem(key)) {
                setLikeVisible(true);
                setIsLike(true);
                player.stepToPercentage(100);
            }
        });

        setLikeAnimatePlayer(player);
    }

    /**
     * 显示点赞动画
     */
    function showLikeAnimate() {
        const next = !isLike;
        setLikeVisible(next);
        next ? activeLikeAnimate() : LikeAnimatePlayer.stepToPercentage(0);
        submitFeedback(next);

        setIsLike(next);
        toggleLikeStatus(next);
        if (myInterval) {
            cleanInterval();
            setCountDown(0);
            !isDev && showControl('');
        }
    }

    function activeLikeAnimate() {
        LikeAnimatePlayer.startAnimation();
        effectSound.praise.play();
    }

    function submitFeedback(tag: boolean) {
        questions.submitFeedback({
            id: props.info.questionId,
            like: tag ? 1 : -1
        });
    }

    /**
     * 本地根据题目id缓存点赞状态
     */
    function toggleLikeStatus(like: boolean) {
        const key = `lamp-${qId}`;
        const ls = window.localStorage;
        like ? ls.setItem(key, '1') : ls.removeItem(key);
    }

    /**
     * 加载点赞等待动画
     */
    function loadLikeWaveAnimate() {
        const player = new SVGA.Player((waveAnimateRef.current as unknown) as HTMLDivElement);
        const parser = new SVGA.Parser();
        player.loops = 1;

        player.onFinished(() => {
            player.stepToPercentage(100);
            const timeout = setTimeout(() => {
                player.startAnimation();
                clearTimeout(timeout);
            }, 5000);
        });

        parser.load('/svga/Like2.svga', async (videoItem: any) => {
            player.setVideoItem(videoItem);
            await new Promise(resolve => setTimeout(resolve, 3000));
            player.startAnimation();
        });

        // setWaveAnimatePlayer(player);
    }

    /**
     * 开启结束倒计时
     */
    function startCountdown() {
        !isDev && showControl(timeLimit);
        const interval = setInterval(() => {
            if (!checkEndTop()) return;
            timeLimit -= 1;
            setCountDown(timeLimit);
            !isDev && showControl(timeLimit);
            if (timeLimit <= 0) {
                myInterval && cleanInterval();
                next();
            }
        }, 1000);
        myInterval = interval;
    }

    function cleanInterval() {
        clearInterval(myInterval);
        myInterval = null;
    }

    /**
     * 判断结束页显示的高度，用来确认倒计时-1是否执行
     */
    function checkEndTop() {
        const el = document.querySelector('#container') as HTMLElement;
        const endEl = document.querySelector('#endPage') as HTMLElement;
        const tagTop = endEl.offsetTop - Math.floor(endEl.offsetHeight / 3);

        return el.scrollTop > tagTop;
    }

    /**
     * 滚动判定(结束页滚动超过1/3页面高度则暂停倒计时)
     */
    function bindScrollElement() {
        const el = document.querySelector('#container') as HTMLElement;
        const endEl = document.querySelector('#endPage') as HTMLElement;
        const tagTop = endEl.offsetTop - Math.floor(endEl.offsetHeight / 3);
        const scrollEvent = () => {
            if (el.scrollTop < tagTop) {
                el.removeEventListener('scroll', scrollEvent);
                myInterval && cleanInterval();
                setCountDown(0);
                !isDev && showControl('');
                bindScrollElementTwo();
            }
        };

        el.addEventListener('scroll', scrollEvent);
    }

    /**
     * 滚动判定(点赞或滚动导致倒计时暂停后，用户一分钟无交互操作则自动退出页面)
     */
    function bindScrollElementTwo() {
        const el = document.querySelector('#container') as HTMLElement;
        const touchStartEvent = () => {
            timeout && clearTimeout(timeout);
            timeout = null;
        };

        const touchEndEvent = () => {
            !timeout && startTimeout();
        };

        const startTimeout = () => {
            timeout = setTimeout(() => {
                next();
            }, 60 * 1000);
        };
        startTimeout();

        el.addEventListener('touchstart', touchStartEvent);
        el.addEventListener('touchend', touchEndEvent);
    }

    /**
     * 唤起和收起台灯助手
     */
    function showControl(time: number | string) {
        window.AIT.showControlConsole(time.toString());
    }

    function hideControl() {
        window.AIT.hideControlConsole();
    }

    return (
        <div className={`${classes.root} lamp`} id={'container'}>
            {loaded && <div className={`${classes.topMask}`}></div>}
            <div className="overflow-auto flex-grow-1" id={'questionContent'} style={{height: '100%', overflow: 'auto'}}>
                <div>{props.info.questionNode && <StructureQuestion data={props.info.questionNode.node} />}</div>
                {loaded && !qsFinished && props.info.hilMode && <LoadingPanel />}
            </div>

            <div
                id={'tutorBoardContent'}
                style={{minHeight: '100%', fontSize: '45px'}}
                ref={contentRef}
                className={`${classes.content} flex-grow-1 overflow-auto`}
                onTouchStart={event => (event.currentTarget.scrollTop += 0)}>
                <div id={'testContent'}>{props.info.structure && <StructureNode data={props.info.structure} />}</div>
                {qsFinished && props.info.hilMode && <LoadingPanel />}

                {/* {props.info.loadingVisible && <LoadingPanel />} */}
                <div className={`${classes.contentBlock}`}></div>
            </div>

            {loaded && (
                <div className={`${classes.endPage}`} style={{display: endVisible && props.info.ended ? 'block' : 'none'}} id={'endPage'}>
                    <div className={`${classes.likeContainer}`}>
                        <div
                            className={`${classes.likeAnimate}`}
                            style={{opacity: likeVisible ? 1 : 0}}
                            ref={likeAnimateRef}
                            onClick={() => showLikeAnimate()}
                        />
                        <div className={`${classes.likeWaveAnimate}`} style={{opacity: likeVisible ? 0 : 1}} ref={waveAnimateRef} />
                    </div>
                    <div className={`${classes.endText}`}>{isLike ? '多谢鼓励!' : '喜欢就点赞吧!'}</div>
                    {isDev && (
                        <div className={`${classes.endBtnContainer} d-flex align-center justify-space-between`}>
                            <div className="end-btn d-flex align-center justify-center" onClick={() => restartEntry()}>
                                再讲一遍
                            </div>
                            <div className="end-btn d-flex align-center justify-center" onClick={() => next()}>
                                下一题{countdown > 0 && `(${countdown})`}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* {!props.info.ended && <ProgressBar />} */}

            {/* <div className={`${classes.bottomBlock}`}></div> */}

            {loaded && <div className={`${classes.bottomMask}`} />}

            <BottomMessage visible={!props.info.ended} />

            <Fade in={endAnimate} style={{position: 'fixed', bottom: 20, left: 0, right: 0, pointerEvents: 'none', zIndex: 19}}>
                <div className={classes.endAnimate} ref={endAnimateRef} />
            </Fade>

            <div style={{display: errorVisible ? 'block' : 'none'}}>
                <LampError quit={next} />
            </div>
            {/* )} */}
        </div>
    );
};

export default connectInfoStore<any>(Lamp) as any;
