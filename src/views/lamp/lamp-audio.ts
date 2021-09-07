import {InstructionDone} from '@/types/instruction';
import store from '@/store';
import {InfoActions} from '@/store/info';

declare var window: any;

class LampAudio {
    audio!: HTMLAudioElement | null;

    done?: InstructionDone | null;

    pauseByUser: boolean = false;

    interval: any = null;
    intervalCount: number = 0;

    //重试机制相关
    reloadLimit: number = 3;
    reloadCount: number = 0;
    reloadInterLimit: number = 5;
    reloadIntervalCount: number = 0;

    private _url: string = '';
    private _done?: InstructionDone;

    setAudio(url: string, done: InstructionDone, needLoading: boolean = true) {
        this.removeAudio();
        needLoading && this.clearLoadingInterval();
        const audio = new Audio(url);
        // const audio = new Audio();
        this.audio = audio;
        // this.audio.muted = this.muted;
        this.done = done;

        this._url = url;
        this._done = done;
        needLoading && this.startLoadingInterval();

        const play = () => {
            // console.log(this.audio?.duration);
            this.pauseByUser = false;
            audio.play();

            this.clearLoadingInterval();
        };

        // audio.ondurationchange = () => {
        //     console.log('durationchange', this.audio?.duration);
        // };

        audio.oncanplay = () => {
            if (window.isPause) {
                this.clearLoadingInterval();
                return;
            }
            play();
        };

        audio.onended = async () => {
            done.run();
            this.pause();
            this.removeAudio();
        };

        audio.onerror = () => {
            console.log('audio error');
            done.run();

            this.clearLoadingInterval();
            this.pause();
            this.removeAudio();
        };

        audio.ontimeupdate = () => {
            // let currentTime = audio.currentTime * 1000;
            // const currentTime = audio.currentTime;
            // console.log(url, currentTime);
        };

        audio.onpause = async () => {
            // console.log('pause', audio.currentTime === audio.duration);
            await new Promise(resolve => setTimeout(resolve, 100));
            if (!this.pauseByUser && audio.currentTime !== audio.duration && !window.isPause) {
                console.log('end by interrupt and restart');
                play();
            }
        };

        // audio.onwaiting = () => {
        //     console.log('audio waiting');
        // };

        // audio.onsuspend = () => {
        //     console.log('audio suspend');
        // };

        // audio.onstalled = () => {
        //     console.log('audio stalled');
        // };

        // audio.onabort = () => {
        //     console.log('audio abort');
        // };

        // this.play();
    }

    play() {
        if (!this.audio) return;
        this.pauseByUser = false;
        let promise = this.audio.play();

        promise &&
            promise.catch &&
            promise.catch(() => {
                console.log('in audio promise.catch');
                this.pause();
            });
    }

    pause(tag?: boolean) {
        if (!this.audio) return;
        if (tag) this.pauseByUser = true;
        this.audio.pause();
    }

    removeAudio() {
        // this.audio && console.log('removeAudio', this.audio);
        if (!this.audio) return;
        this.pause();

        this.audio.onended = null;
        this.audio.oncanplay = null;
        this.audio.onerror = null;
        this.audio.ontimeupdate = null;
        // this.audio.ondurationchange = null;
        this.audio.onpause = null;
        // this.audio.onwaiting = null;
        // this.audio.onsuspend = null;
        // this.audio.onstalled = null;
        // this.audio.onabort = null;

        this.audio = null;
        this.done = null;
    }

    startLoadingInterval() {
        this.intervalCount = 0;
        this.interval = setInterval(() => {
            this.intervalCount += 1;
            this.reloadIntervalCount += 1;
            if (this.reloadIntervalCount >= this.reloadInterLimit && this.reloadCount < this.reloadLimit) {
                this.startReload();
            }
            if (this.intervalCount === 10) {
                console.log('超时10s');
                store.dispatch({type: InfoActions.setHilMode, payload: true});
            }
            if (this.intervalCount >= 30) {
                console.log('error:音频加载超时30s');
                store.dispatch({type: InfoActions.setNetError, payload: 'audioError'});
                this.clearLoadingInterval(false);
            }
        }, 1000);
    }

    clearLoadingInterval(tag: boolean = true) {
        clearInterval(this.interval);
        this.interval = null;
        store.dispatch({type: InfoActions.setHilMode, payload: false});
        if (store.getState().info.netError === 'audioError' && tag) {
            store.dispatch({type: InfoActions.setNetError, payload: false});
        }
    }

    async startReload() {
        this.pause(true);
        this.removeAudio();
        this.reloadCount += 1;
        this.reloadIntervalCount = 0;
        console.log(`重试${this._url}第${this.reloadCount}次`);
        await new Promise(resolve => setTimeout(resolve, 600));
        this.setAudio(this._url, this._done as InstructionDone, false);
    }
}

const lampAudio = new LampAudio();

export default lampAudio;
