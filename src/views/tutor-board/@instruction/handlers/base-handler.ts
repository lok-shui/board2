import {HandlerTemplate} from './handler-template';
import {MathContent, TextContent} from '../content';
import {PGNode} from '@/types/instruction';
import {STRUCT_TYPE} from '@/const';
import store from '@/store';
import {InfoActions} from '@/store/info';
// import pageEvent from '@/utils/event';
import {messageEvent} from '@/views/lamp/message.event';
import lampAudio from '@/views/lamp/lamp-audio';

import {noBreak} from 'ait-mathml-utils';

export class BaseHandler extends HandlerTemplate {
    needResetFont: boolean = true;

    subscribe(): void {
        /**
         * 题目指令处理
         */
        this.onInstruction('显示题目', async (instruction, done) => {
            const {内容, 同步方式, 重点} = instruction.params;
            const node = this.pathMap.get(instruction.path);

            let contentText = 内容;

            // 忽略重复显示题目指令
            if (node && node.content && (node.content as TextContent).text === contentText) {
                done.run();
            } else {
                // 移出原本结构
                if (node && node.parent) {
                    const index = node.parent.children.indexOf(node);
                    node.parent.children.splice(index, 1);
                    // @ts-ignore
                    node.parent = null;
                }

                const textNode = new TextContent(contentText, done, node as PGNode, '', true);
                node && (node.content = textNode);
                done.fast = true;
                textNode.isQuestion = true;

                // setKeyPoints(重点, textNode);

                done.run();
                store.dispatch({type: InfoActions.setQuestionNode, payload: {...{node}}});
            }
        });

        /**
         * 显示元信息指令处理
         */
        this.onInstruction('显示元信息', async (instruction, done) => {
            let {内容, 类型, 重点, 缩进, 序号, 关联} = instruction.params;
            let {事件标识, 广播事件} = 关联 || {事件标识: null, 广播事件: null};
            事件标识 && (事件标识 += '');

            const node = this.pathMap.get(instruction.path);
            序号 && (内容 = `（${序号}）&nbsp;${内容}`);

            if (类型 === '知识点') {
                const kpContent = new TextContent(内容, done, node as PGNode);
                const kps = store.getState().info.kps || [];

                let index = kps.findIndex((item: TextContent) => item.node === node);
                node && (node.kp = true);

                if (~index) {
                    kps[index] = kpContent;
                } else if (!~kps.findIndex((content: TextContent) => content.text === 内容)) {
                    kps.push(kpContent);
                }

                done.run();

                this.updateKps(kps);
            } else if (['已知量', '易错点', '关键信息', '规律', '干扰信息'].includes(类型)) {
                if (!node) {
                    done.run();
                    return;
                }
                const parent = node.parent;

                if (parent.structType !== STRUCT_TYPE.Step) {
                    const textNode = new TextContent(类型, {run: () => {}, fast: true} as any, parent as PGNode);
                    parent.structType = STRUCT_TYPE.Step;
                    parent.content = textNode;
                }

                const textNode = new TextContent(内容, done, node as PGNode);
                // textNode.indent = 缩进 || 0;
                事件标识 && (textNode.eventName = 事件标识);
                node.content = textNode;
                // setKeyPoints(重点, textNode);

                this.updateNode();
            }
        });

        /**
         * 显示步骤名称
         */
        this.onInstruction('显示步骤', async (instruction, done) => {
            let {内容, 序号, 重点} = instruction.params;
            const node = this.pathMap.get(instruction.path);
            const parent = node && node.parent;
            序号 && (内容 = `${序号}.&nbsp;${内容}`);

            if (!node) {
                done.run();
                return;
            }
            done.fast = true;

            const textNode = new TextContent(`<span style="font-size:1.8rem">${内容}</span>`, done, node as PGNode);
            // if (重点) {
            //     textNode.emphasis = 重点.map((item: any) => resolveEmphasize(item.开始));
            // }

            parent && (parent.structType = STRUCT_TYPE.Step);
            parent && (parent.content = textNode);

            this.updateNode();
        });

        /**
         * 显示步骤内的内容
         */
        this.onInstruction('显示内容', async (instruction, done) => {
            const {内容, 重点, 说明, 说明位置, 关联, 竖式标识} = instruction.params;
            let {事件标识, 广播事件} = 关联 || {事件标识: null, 广播事件: null};
            事件标识 && (事件标识 += '');

            let node = this.pathMap.get(instruction.path);

            if (!node) {
                done.run();
                return;
            }

            if (竖式标识) {
                if (this.shushiMap.get(竖式标识)) {
                    node = this.shushiMap.get(竖式标识);
                } else {
                    this.shushiMap.set(竖式标识, node);
                    this.updateShushiMap(this.shushiMap);
                }
            }

            if (isMathML(内容, 说明)) {
                const mathNode = new MathContent(noBreak.addNoBreak(内容), done, node as PGNode, 说明);
                mathNode.说明位置 = 说明位置;

                node && (node.content = mathNode);
                this.needResetFont = false;
                this.updateNode();
                return;
            }
            const textNode = new TextContent(noBreak.addNoBreak(内容), done, node as PGNode, '', this.needResetFont);
            textNode.eventName = 事件标识;
            node && (node.content = textNode);
            this.needResetFont = false;

            // setKeyPoints(重点, textNode);

            if (store.getState().info.isLamp) {
                messageEvent.emit('message', 说明);
                await new Promise(resolve => setTimeout(resolve, 说明 ? 10 : 1000));
            }

            this.updateNode();
        });

        /**
         * 音频解说
         */
        this.onInstruction('解说', async (instruction, done) => {
            const {时间轴, 语音, 关联} = instruction.params;
            let {事件标识, 广播事件} = 关联 || {事件标识: null, 广播事件: null};
            事件标识 && (事件标识 += '');

            if (done.fast) {
                done.run();
                return;
            }

            lampAudio.setAudio(语音, done);
            // if (store.getState().info.isLamp) {
            //     lampAudio.setAudio(语音, done);
            //     return;
            // }
        });
    }
}

function isMathML(content: string, hasExplain?: string) {
    const mathStart = /^<math(.|\n|\r)*<\/math>$/.test(content);
    const hasAnimation = /ani-/.test(content);

    return mathStart && (hasAnimation || !!hasExplain);
}
