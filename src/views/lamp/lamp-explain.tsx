import React, {useEffect, useState} from 'react';
import {createStyles, makeStyles, Theme, useTheme} from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => {
    return createStyles({
        root: {
            width: '100%',
            height: '100vh',
            position: 'relative',
            backgroundColor: '#ffffff',
            fontSize: 24,
            background: `url('/images/lamp_bg.png')`,
            backgroundSize: '100%',
            backgroundRepeat: 'repeat-y',
            fontFamily: 'FZY4JW--GB1-0,FZY4JW--GB1'
        },
        header: {
            height: 84,
            textAlign: 'center',
            paddingTop: 32,
            backgroundColor: '#FFBC18'
        },
        headerText: {
            fontSize: 26,
            color: '#ffffff',
            textShadow: '0px 3px 5px rgba(255,111,0,0.5)',
            lineHeight: '30px'
        },
        mainContain: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 84,
            bottom: 0,
            overflow: 'auto',
            paddingTop: 40,
            paddingBottom: 80
        },
        itemContain: {
            position: 'relative',
            width: 336,
            padding: '50px 0 20px',
            margin: '0 auto 40px',
            background: 'linear-gradient(180deg,rgba(255,255,255,1) 0%,rgba(255,247,234,1) 100%)',
            boxShadow: '0px 12px 30px 0px rgba(255,171,0,0.5)',
            border: '8px solid rgba(255,221,141,1)',
            borderRadius: 20
        },
        itemTitleContain: {
            position: 'absolute',
            width: 260,
            height: 66,
            border: '8px solid rgba(255,221,141,1)',
            borderRadius: 33,
            top: -33,
            left: 'calc(50% - 130px)',
            backgroundColor: 'rgba(255,242,212,1)',
            display: 'flex'
        },
        itemTitleIcon: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundSize: '100% 100%',
            '&.check': {
                backgroundImage: `url('/images/icon_check.png')`
            },
            '&.wrong': {
                backgroundImage: `url('/images/icon_wrong.png')`
            }
        },
        itemTitleText: {
            flex: 1,
            textAlign: 'center',
            lineHeight: '50px',
            color: '#433008'
        },
        item: {
            width: 295,
            margin: 'auto',
            padding: '20px 0',
            textAlign: 'center',
            '&.border-bottom': {
                borderBottom: 'rgba(222, 221, 209, 0.4) solid 2px'
            }
        },
        itemTitle: {
            fontSize: 26,
            lineHeight: '30px',
            marginBottom: '5px',
            '&.check': {
                color: '#2DB84D'
            },
            '&.wrong': {
                color: '#F64F4E'
            }
        }
    });
});

// const explainText = [
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>66</mn><mo>+</mo><mn>67</mn><mo>-</mo><mn>45</mn><mo>+</mo><mfrac><mn>2</mn><mn>5</mn></mfrac><mo>-</mo><mn>30</mn><mo>%</mo></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>12</mn><mo>.</mo><mn>5</mn><mo>&#xD7;</mo><mn>80</mn><mo>&#xF7;</mo><mn>2</mn><mo>%</mo></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>12</mn><mo>.</mo><mn>5</mn><mo>&#xD7;</mo><mfenced><mrow><mn>8</mn><mo>+</mo><mn>100</mn></mrow></mfenced></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>15</mn><mo>&#xD7;</mo><mo>&#xA0;</mo><menclose notation="bottom"><mo>&#xA0;</mo><mo>&#xA0;</mo><mo>&#xA0;</mo><mo>&#xA0;</mo><mo>&#xA0;</mo><mo>&#xA0;</mo><mo>&#xA0;</mo></menclose><mo>&#xA0;</mo><mo>=</mo><mn>150</mn></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>1</mn><mo>-</mo><mfrac><mrow><mo>(</mo><mo>&#xA0;</mo><mo>&#xA0;</mo><mo>&#xA0;</mo><mo>)</mo></mrow><mn>7</mn></mfrac><mo>+</mo><mfrac><mn>2</mn><mn>7</mn></mfrac><mo>=</mo><mfrac><mn>4</mn><mn>7</mn></mfrac></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>18</mn><mo>:</mo><mfrac><mn>2</mn><mn>3</mn></mfrac></math>`,
//     `<math xmlns="http://www.w3.org/1998/Math/MathML"><mn>18</mn><mo>&#xF7;</mo><mi>x</mi><mo>=</mo><mn>6</mn></math>`,
// ];

const explainHtml = [
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c36"></mjx-c><mjx-c class="mjx-c36"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2B"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c36"></mjx-c><mjx-c class="mjx-c37"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2212"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c34"></mjx-c><mjx-c class="mjx-c35"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2B"></mjx-c></mjx-mo><mjx-mfrac space="3"><mjx-frac><mjx-num><mjx-nstrut></mjx-nstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c32"></mjx-c></mjx-mn></mjx-num><mjx-dbox><mjx-dtable><mjx-line></mjx-line><mjx-row><mjx-den><mjx-dstrut></mjx-dstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c35"></mjx-c></mjx-mn></mjx-den></mjx-row></mjx-dtable></mjx-dbox></mjx-frac></mjx-mfrac><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2212"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c33"></mjx-c><mjx-c class="mjx-c30"></mjx-c></mjx-mn><mjx-mo class="mjx-n"><mjx-c class="mjx-c25"></mjx-c></mjx-mo></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>66</mn><mo>+</mo><mn>67</mn><mo>-</mo><mn>45</mn><mo>+</mo><mfrac><mn>2</mn><mn>5</mn></mfrac><mo>-</mo><mn>30</mn><mo>%</mo></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c32"></mjx-c></mjx-mn><mjx-mo class="mjx-n"><mjx-c class="mjx-c2E"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="2"><mjx-c class="mjx-c35"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cD7"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c38"></mjx-c><mjx-c class="mjx-c30"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cF7"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c32"></mjx-c></mjx-mn><mjx-mo class="mjx-n"><mjx-c class="mjx-c25"></mjx-c></mjx-mo></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>12</mn><mo>.</mo><mn>5</mn><mo>×</mo><mn>80</mn><mo>÷</mo><mn>2</mn><mo>%</mo></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c32"></mjx-c></mjx-mn><mjx-mo class="mjx-n"><mjx-c class="mjx-c2E"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="2"><mjx-c class="mjx-c35"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cD7"></mjx-c></mjx-mo><mjx-mfenced space="3"><mjx-mo class="mjx-n"><mjx-c class="mjx-c28"></mjx-c></mjx-mo><mjx-mrow><mjx-mn class="mjx-n"><mjx-c class="mjx-c38"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2B"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="3"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c30"></mjx-c><mjx-c class="mjx-c30"></mjx-c></mjx-mn></mjx-mrow><mjx-mo class="mjx-n"><mjx-c class="mjx-c29"></mjx-c></mjx-mo></mjx-mfenced></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>12</mn><mo>.</mo><mn>5</mn><mo>×</mo><mfenced><mrow><mn>8</mn><mo>+</mo><mn>100</mn></mrow></mfenced></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c35"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cD7"></mjx-c></mjx-mo><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-menclose><mjx-box style="border-bottom: 0.067em solid; padding-bottom: 0.2em;"><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo></mjx-box></mjx-menclose><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-mo class="mjx-n" space="4"><mjx-c class="mjx-c3D"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="4"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c35"></mjx-c><mjx-c class="mjx-c30"></mjx-c></mjx-mn></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>15</mn><mo>×</mo><mo>&nbsp;</mo><menclose notation="bottom"><mo>&nbsp;</mo><mo>&nbsp;</mo><mo>&nbsp;</mo><mo>&nbsp;</mo><mo>&nbsp;</mo><mo>&nbsp;</mo><mo>&nbsp;</mo></menclose><mo>&nbsp;</mo><mo>=</mo><mn>150</mn></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c31"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2212"></mjx-c></mjx-mo><mjx-mfrac space="3"><mjx-frac><mjx-num><mjx-nstrut></mjx-nstrut><mjx-mrow size="s"><mjx-mo class="mjx-n"><mjx-c class="mjx-c28"></mjx-c></mjx-mo><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-mo class="mjx-n"><mjx-c class="mjx-cA0"></mjx-c></mjx-mo><mjx-mo class="mjx-n"><mjx-c class="mjx-c29"></mjx-c></mjx-mo></mjx-mrow></mjx-num><mjx-dbox><mjx-dtable><mjx-line></mjx-line><mjx-row><mjx-den><mjx-dstrut></mjx-dstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c37"></mjx-c></mjx-mn></mjx-den></mjx-row></mjx-dtable></mjx-dbox></mjx-frac></mjx-mfrac><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-c2B"></mjx-c></mjx-mo><mjx-mfrac space="3"><mjx-frac><mjx-num><mjx-nstrut></mjx-nstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c32"></mjx-c></mjx-mn></mjx-num><mjx-dbox><mjx-dtable><mjx-line></mjx-line><mjx-row><mjx-den><mjx-dstrut></mjx-dstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c37"></mjx-c></mjx-mn></mjx-den></mjx-row></mjx-dtable></mjx-dbox></mjx-frac></mjx-mfrac><mjx-mo class="mjx-n" space="4"><mjx-c class="mjx-c3D"></mjx-c></mjx-mo><mjx-mfrac space="4"><mjx-frac><mjx-num><mjx-nstrut></mjx-nstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c34"></mjx-c></mjx-mn></mjx-num><mjx-dbox><mjx-dtable><mjx-line></mjx-line><mjx-row><mjx-den><mjx-dstrut></mjx-dstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c37"></mjx-c></mjx-mn></mjx-den></mjx-row></mjx-dtable></mjx-dbox></mjx-frac></mjx-mfrac></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>1</mn><mo>-</mo><mfrac><mrow><mo>(</mo><mo>&nbsp;</mo><mo>&nbsp;</mo><mo>&nbsp;</mo><mo>)</mo></mrow><mn>7</mn></mfrac><mo>+</mo><mfrac><mn>2</mn><mn>7</mn></mfrac><mo>=</mo><mfrac><mn>4</mn><mn>7</mn></mfrac></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c38"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="4"><mjx-c class="mjx-c3A"></mjx-c></mjx-mo><mjx-mfrac space="4"><mjx-frac><mjx-num><mjx-nstrut></mjx-nstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c32"></mjx-c></mjx-mn></mjx-num><mjx-dbox><mjx-dtable><mjx-line></mjx-line><mjx-row><mjx-den><mjx-dstrut></mjx-dstrut><mjx-mn class="mjx-n" size="s"><mjx-c class="mjx-c33"></mjx-c></mjx-mn></mjx-den></mjx-row></mjx-dtable></mjx-dbox></mjx-frac></mjx-mfrac></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>18</mn><mo>:</mo><mfrac><mn>2</mn><mn>3</mn></mfrac></math></mjx-assistive-mml></mjx-container>`,
    `<mjx-container class="MathJax" jax="CHTML" role="presentation" style="position: relative;"><mjx-math class="MJX-TEX" aria-hidden="true"><mjx-mn class="mjx-n"><mjx-c class="mjx-c31"></mjx-c><mjx-c class="mjx-c38"></mjx-c></mjx-mn><mjx-mo class="mjx-n" space="3"><mjx-c class="mjx-cF7"></mjx-c></mjx-mo><mjx-mi class="mjx-i" space="3"><mjx-c class="mjx-c1D465 TEX-I"></mjx-c></mjx-mi><mjx-mo class="mjx-n" space="4"><mjx-c class="mjx-c3D"></mjx-c></mjx-mo><mjx-mn class="mjx-n" space="4"><mjx-c class="mjx-c36"></mjx-c></mjx-mn></mjx-math><mjx-assistive-mml role="presentation" unselectable="on" display="block"><math xmlns="http://www.w3.org/1998/Math/MathML"><mn>18</mn><mo>÷</mo><mi>x</mi><mo>=</mo><mn>6</mn></math></mjx-assistive-mml></mjx-container>`
];

const icon = {
    correct: '/images/icon_correct.png',
    error: '/images/icon_error.png'
};
let timeout: any = null;

export default () => {
    const classes = useStyles();

    useEffect(() => {
        const els = document.querySelectorAll('.item-math');
        els.forEach((el, index) => {
            el.innerHTML = explainHtml[index];
        });

        bindScrollElement();
        //@ts-ignore
        window.onloadTag = false;
    }, []);

    /**
     * 滚动判定(用户一分钟无交互操作则自动退出页面)
     */
    function bindScrollElement() {
        const el = document.querySelector('#lampExplain') as HTMLElement;
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
     * 返回拍照页
     */
    function next() {
        console.log('quit');
        //@ts-ignore
        window.AIT && window.AIT.exit();
    }

    return (
        <div className={`${classes.root} lamp`} id={'lampExplain'}>
            <div className={`${classes.header}`}>
                <div className={`${classes.headerText}`}>可讲解范围说明</div>
            </div>
            <div className={`${classes.mainContain}`}>
                <div className={`${classes.itemContain}`}>
                    <div className={`${classes.itemTitleContain}`}>
                        <div className={`${classes.itemTitleIcon} check`} />
                        <div className={`${classes.itemTitleText}`}>可识别讲解类型</div>
                    </div>

                    <div>
                        <div className={`${classes.item} border-bottom`}>
                            <div className={`${classes.itemTitle} check`}>加减运算</div>
                            <div className={`item-math`}></div>
                        </div>

                        <div className={`${classes.item} border-bottom`}>
                            <div className={`${classes.itemTitle} check`}>乘除运算</div>
                            <div className={`item-math`}></div>
                        </div>

                        <div className={`${classes.item}`}>
                            <div className={`${classes.itemTitle} check`}>混合运算</div>
                            <div className={`item-math`}></div>
                        </div>
                    </div>
                </div>

                <div className={`${classes.itemContain}`}>
                    <div className={`${classes.itemTitleContain}`}>
                        <div className={`${classes.itemTitleIcon} wrong`} />
                        <div className={`${classes.itemTitleText}`}>不支持识别类型</div>
                    </div>

                    <div>
                        <div className={`${classes.item} border-bottom`}>
                            <div className={`${classes.itemTitle} wrong`}>填空题</div>
                            <div className={`item-math`}></div>
                        </div>

                        <div className={`${classes.item}`}>
                            <div className={`item-math`}></div>
                        </div>

                        <div className={`${classes.item} border-bottom`}>
                            <div className={`${classes.itemTitle} wrong`}>暂不支持比例、方程讲解</div>
                            <div className={`item-math`}></div>
                        </div>

                        <div className={`${classes.item}`}>
                            <div className={`item-math`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
