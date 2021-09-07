import axios from '../axios';
import PG from './pg.json';

const baseURL = '/api/v1/tutor';

export const tutor = {
    room(params: {questionId: string}) {
        return axios
            .get('/room', {params, baseURL})
            .then(({data}) => data)
            .catch(() => 'aaa111');
    },
    startExplain(params: {
        questionId: string;
        appId?: string;
        roomId: string;
        type: 'explain' | 'tip';
        pgStartPath?: string;
        initOnly: boolean;
        skipToPath?: string;
        skipInitProcess?: boolean;
        hilMode?: boolean;
        eaogId?: string;
    }) {
        // return axios.post(
        //     '/api/pg/exec',
        //     {
        //         roomId: params.roomId,
        //         eaogData: PG,
        //         explainType: 'EXPLAIN',
        //         // initOnly: params.initOnly,
        //         skipInitProcess: params.skipInitProcess,
        //         skipToPath: params.skipToPath,
        //         // type: 'tip',
        //         fastRunning: true
        //     },
        //     {baseURL: ''}
        // );

        return axios.post('/start', params, {baseURL}).then(({data}) => data);

        // let params2 = {
        //     roomId: '40288393737a924101737a99b0da015d-3919903',
        //     eaogData: PG,
        //     skipInitProcess: false,
        //     explainType: 'EXPLAIN',
        //     fastRunning: false,
        //     eaogIntermediate: false
        // };
        // params2.roomId = params.roomId;
        // return axios.post('/exec', params2, {baseURL: '/api/pg'}).then(({data}) => data);
    },
    getQrCode() {
        return axios
            .get(process.env.NODE_ENV === 'development' ? 'http://ait-cast-svc-ait.dev.dm-ai.cn/api/v1/room/create' : '/room/create', {})
            .then(({data}) => data);
    }
};
