import React, {useEffect, useRef, useState} from 'react';
import {TextContent} from '@/views/tutor-board/@instruction/content';
import {TextPrinter, goto, showMathMl} from '@/utils';
import classNames from 'classnames';
import Collapse from '@material-ui/core/Collapse';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import Chalk from '@/utils/chalk';
import aitAudio from '@/views/tutor-board/ait-audio';
import pageEvent from '@/utils/event';

import store from '@/store';
// import {messageEvent} from '@/views/lamp/message.event';

const chalk = new Chalk().delayTime(0);

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            '& ul': {
                listStyleType: 'none',
                margin: '0',
                '& li': {
                    margin: '0.25rem 0'
                }
            }
        },
        cursor: {
            color: theme.palette.text.primary
        }
    })
);

declare var MathJax: any;

let fontSize = getComputedStyle(document.documentElement).fontSize as any;
fontSize = parseInt(fontSize || '15');

export default (props: {data: TextContent}) => {
    const classes = useStyles();
    const $el = useRef(null);
    const $container = useRef(null);
    const $cursor = useRef(null);
    const [visible, setVisible] = useState(false);
    const [collapse, setCollapse] = useState(props.data.isQuestion);
    const [finished, setFinished] = useState(true);

    useEffect(() => {
        if (visible) handleTextChanged();
    }, [props.data.text]);

    useEffect(() => {
        if (!props.data) return;

        (async () => {
            if (visible) {
                moveToCurrent();
                !props.data.done.fast && (await printText((($el.current as unknown) as HTMLElement).cloneNode(true) as HTMLElement));
                await new Promise(resolve => setTimeout(resolve, 200));
                props.data.done.run();
                return;
            }

            handleTextChanged();

            props.data.isQuestion ? setVisible(true) : setCollapse(true);
            setFinished(false);

            !props.data.done.fast && (await printText());
            setFinished(true);
            props.data.done.run();
        })();
    }, [props.data]);

    /**
     * 绑定节点内容元素
     */
    useEffect(() => {
        props.data.$el = ($el.current as unknown) as HTMLElement;
    }, [props.data]);

    /**
     * 处理内容变更
     */
    function handleTextChanged() {
        showMathMl($el.current);

        if ($el.current && props.data.needResetFont) {
            const el = (($el.current as unknown) as HTMLElement).querySelector('mjx-container') as HTMLElement;
            // el.style.lineHeight = '3'
            if (el && (el.offsetWidth / window.innerWidth > 0.7 || judgeElWidth(el))) {
                //@ts-ignore
                window.resetFontSize();
            }

            const els = el.querySelectorAll('mjx-mrow') as NodeList;
            if (!els.length) return;
            els.forEach((el: unknown) => {
                const _el = el as HTMLElement;
                _el.style.lineHeight = '0';
            });

            // const mathNodes = el.querySelector('mjx-math')?.childNodes as NodeList
            // if (mathNodes && mathNodes.length) {
            //   mathNodes.forEach((el: unknown) => {
            //     const _el = el as HTMLElement;
            //     _el.style.marginBottom = '12px';
            //   })
            // }
        }
    }

    function judgeElWidth(el: HTMLElement) {
        const mathNodes = el.querySelector('mjx-math')?.childNodes as NodeList;
        if (mathNodes && mathNodes.length) {
            let width = 0;
            mathNodes.forEach((mathNode: any) => {
                width += mathNode.offsetWidth;
            });
            return width >= window.innerWidth - 40;
        }
        return false;
    }

    /**
     * 移动到当前显示文字
     */
    function moveToCurrent() {
        if (props.data.done.fast) return;
        const target = ($container.current as unknown) as HTMLElement;
        if (!target) return;

        const option = {
            container: store.getState().info.globalScroll ? '#container' : '#tutorBoardContent',
            offset: 0
        };
        target.parentElement && goto(target.parentElement as HTMLElement, option);
    }

    /**
     * 逐文本显示
     */
    async function printText(targetElement?: HTMLElement) {
        const target = targetElement || (($el.current as unknown) as HTMLElement);
        const container = (target.parentElement as HTMLElement) || target;
        const cursorKeep = 800;
        container.style.minHeight = container.getBoundingClientRect().height + 'px';

        let callback = props.data.eventName
            ? (char: string, index: number, end?: boolean) => {
                  aitAudio.event.emit(props.data.eventName, target.textContent, end);
              }
            : null;

        const printer = new TextPrinter().in(target);
        await new Promise(resolve => setTimeout(resolve, cursorKeep));

        const handlePrinter = async (pause: boolean) => {
            !pause && (await moveToCurrent());
            printer.pause(pause);
        };
        pageEvent.addListener('printer', handlePrinter);
        await printer.out(callback);
        container.style.minHeight = '';

        pageEvent.removeListener('printer', handlePrinter);

        return new Promise(resolve => setTimeout(resolve, cursorKeep));
    }

    return (
        <div
            ref={$container}
            className={`content-text ${classes.root}`}
            style={{visibility: visible ? undefined : 'hidden', textIndent: props.data.indent + 'em'}}>
            <Collapse
                in={collapse}
                onEntered={() => {
                    setVisible(true);
                    moveToCurrent();
                }}>
                <span className={``} ref={$el} dangerouslySetInnerHTML={{__html: props.data.text}} />
                <span
                    ref={$cursor}
                    className={classNames('animate__flash', 'animate__animated', 'animate__infinite', 'animate__slow', classes.cursor)}
                    style={{display: !finished ? undefined : 'none'}}>
                    {/* | */}
                </span>
            </Collapse>
        </div>
    );
};
