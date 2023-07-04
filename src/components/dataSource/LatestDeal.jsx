
import React from 'react';
import { inject, observer } from "mobx-react";
import { LoadingComponent, NoRecord } from '@/components/common'
import tradeTools from '@/utils/tradeTools';
import proTradeApi from '@/utils/proTradeApi';
import HuaZhuan from '@/assets/images/HuaZhuan.svg'

@inject('store')
@observer
class LatestDeal extends React.Component {
    componentDidMount() {
        this.fetchTradeHistory();
        this.monitorNewOrdersSubscribe = PubSub.subscribe('TRADE_EVENT_trades.update', this.monitorNewOrders);
        this.resetDataSubscribe = PubSub.subscribe('TRADE_EVENT_SWITCH_MARKET', this.resetData)
    }
    componentWillUnmount() {
        PubSub.unsubscribe(this.monitorNewOrdersSubscribe);
        PubSub.unsubscribe(this.resetDataSubscribe);
        this.clearAllTimeout()
    }
    resetData() {
        this.clearAllTimeout();
        this.setState({
            tradeList: [],
            loading: true
        }, () => {
            this.fetchTradeHistory()
        }
        )
    }
    fetchTradeHistory() {
        const { curr_a, curr_b } = this.props.store;
        let params = {
            curr_a: curr_a,
            curr_b: curr_b
        };
        proTradeApi.getTradeHistory(params).then(res => {
            let data = res;
            if (data.data) {
                let orderArr = [];
                let forArr = data.data;
                for (let i = 0; i < forArr.length; i++) {
                    let obj = {
                        id: forArr[i].tradeID,
                        amount: forArr[i].amount,
                        price: forArr[i].rate,
                        time: forArr[i].timestamp,
                        type: forArr[i].type
                    };
                    orderArr.push(obj)
                }
                let showArr = [`${curr_a}_ ${curr_b}`, orderArr,];
                this.monitorNewOrders(null, showArr)
            }
            this.setState({
                loading: false
            })
        }
        ).catch(error => {
            console.log(error)
        }
        )
    }
    render() {
        let { loading, tradeList, showTotal } = this.state;
        const { curr_a, curr_b, currSymbol } = this.props.store;
        const precision1 = tradeTools.getPrecisionConfig(currSymbol);
        if (tradeList.length) {
            tradeList = tradeList.sort((a, b) => {
                return a.time - b.time
            }
            )
        }
        return (
            <div id="tradeGroup">
                {
                    loading ? <LoadingComponent></LoadingComponent> :
                        <>
                            <div className='trade_box_ul_title'>
                                <div className='trade_box_left'>
                                    {lang_string('时间')}
                                </div>
                                <div className='trade_box_right'>
                                    {lang_string('成交价')}
                                    <span>
                                        ({curr_b.toUpperCase()})
                                    </span>
                                </div>
                                <div
                                    data-click-event="trade_andicap_turn_click"
                                    data-collect-params={`{"button_name":"transaction_turn"}`}
                                    onClick={() => this.changeShowTotal()}
                                    className="trade_box_right_container"
                                >
                                    <span className='trade_box_right'>
                                        {this.getValue()}
                                    </span>
                                    <HuaZhuan className="icon iconwarn" style={{ marginLeft: '4px' }}></HuaZhuan>
                                </div>
                            </div>

                            {
                                tradeList.length ? <div className='tradeGroup_list'>
                                    <div className='trade_box'>
                                        <ul id="trade_box_ul">
                                            {
                                                tradeList.map((item, index) => {
                                                    const total = (item.amount * item.rateLocal).toFixed(precision1.precision_total);
                                                    return <li key={'trade-' + index} className='tradeShowLi'>
                                                        <div className='trade_list_time'>
                                                            {tradeTools.getTimeStr(item.time)}
                                                        </div>
                                                        <div className={item.type == 'sell' ? 'trade_list_price trade_down' : 'trade_list_price trade_up'}>
                                                            {item.rateLocal}
                                                        </div>
                                                        <div className='trade_list_num'>
                                                            {showTotal ? total : item.amount}
                                                        </div>
                                                    </li>
                                                }
                                                )
                                            }
                                        </ul>
                                    </div>
                                </div> : <NoRecord />
                            }
                            <div>

                            </div>
                        </>
                }

            </div>
        )
    }
    clearAllTimeout() {
        Object.keys(this.timeOutArray).forEach(key => {
            this.timeOutArray[key] && clearTimeout(this.timeOutArray[key])
        }
        );
        this.timeOutArray = []
    }
    froceUpdateSpotLatestDeal() {
        if (globalStore.orderBookTradeTabType === ORDERBOOK_TRADE.ORDER_BOOK)
            return;
        const { curr_a, curr_b } = globalStore;
        let params = {
            curr_a: curr_a,
            curr_b: curr_b
        };
        proTradeApi.getTradeHistory(params).then(res => {
            let data = res;
            if (!data)
                return;
            if (data.data) {
                let orderArr = [];
                let forArr = data.data;
                for (let i = 0; i < forArr.length; i++) {
                    let obj = {
                        id: forArr[i].tradeID,
                        amount: forArr[i].amount,
                        price: forArr[i].rate,
                        time: forArr[i].timestamp,
                        type: forArr[i].type
                    };
                    orderArr.push(obj)
                }
                let showArr = [`${curr_a}_ ${curr_b}`, orderArr,];
                this.monitorNewOrders(null, showArr)
            }
            this.setState({
                loading: false
            })
        }
        ).catch(error => {
            console.log(error)
        }
        )
    }
    monitorNewOrders(key, arr) {
        const { currSymbol } = this.props.store;
        if (arr[0]) {
            if (arr[0] !== currSymbol) {
                return false
            }
        }
        let tempList = arr[1]
            , tempArr = [];
        if (!tempList || tempList.length <= 0) {
            return false
        }
        tempArr = this.assembleHistory(tempList);
        for (let i = 0; i < tempArr.length; i++) {
            const key1 = `${tempArr[i].id}${i}`;
            this.timeOutArray[key1] = setTimeout(() => {
                let newList = [];
                const oldList = [...this.state.tradeList];
                const findIndex = oldList.findIndex(item => item.id === tempArr[i].id);
                if (findIndex !== -1) {
                    oldList[findIndex] = tempArr[i];
                    newList = oldList
                } else {
                    newList = oldList.concat([tempArr[i]])
                }
                if (newList.length > 100) {
                    newList = newList.slice(-50)
                }
                this.setState({
                    tradeList: newList
                });
                this.timeOutArray[key1] && clearTimeout(this.timeOutArray[key1]);
                this.timeOutArray[key1] = null
            }
                , i * 100)
        }
    }
    changeShowTotal() {
        this.setState({
            showTotal: !this.state.showTotal
        })
    }
    assembleHistory(tempList) {
        const { curr_b, currSymbol } = this.props.store;
        let fiat_vol_decimals = 3
            , fiat_rate = tradeTools.get_global_fiat_rate(curr_b);
        let tempArr = [];
        for (let j = 0; j < tempList.length; j++) {
            let row = tempList[j];
            let tempObj = {};
            let rate_disp, vol_disp;
            let rate = row['price']
                , vol = row['amount']
                , total = rate * vol
                , type = row['type']
                , id = row['id']
                , time = Math.floor(row['time']);
            const precision1 = tradeTools.getPrecisionConfig(currSymbol);
            rate = Number(rate).toFixed(precision1.precision_rate);
            vol = Number(vol).toFixed(precision1.precision_vol);
            total = Number(total).toFixed(precision1.precision_total);
            rate_disp = rate * 1;
            rate_disp = rate_disp.toFixed(precision1.precision_rate);
            vol_disp = total * fiat_rate;
            vol_disp = vol_disp.toFixed(fiat_vol_decimals);
            tempObj = {
                id: id,
                time: time,
                rate: rate,
                rateLocal: rate_disp,
                amount: vol,
                amountLocal: vol_disp,
                total: total,
                type: type
            };
            tempArr.push(tempObj)
        }
        return tempArr
    }
    getValue() {
        const { curr_a, curr_b } = this.props.store;
        const { showTotal } = this.state;
        let str = lang_string(!showTotal ? '数量' : '总计') + `(${!showTotal ? curr_a : curr_b})`;
        if ((is_ru || is_ar) && showTotal) {
            str = str.slice(0, 6) + '...'
        }
        return str
    }
    constructor(props) {
        super(props);
        this._loaded = true
        this.clearAllTimeout = this.clearAllTimeout.bind(this)
        this.froceUpdateSpotLatestDeal = this.froceUpdateSpotLatestDeal.bind(this)
        this.monitorNewOrders = this.monitorNewOrders.bind(this)
        this.changeShowTotal = this.changeShowTotal.bind(this)
        this.assembleHistory = this.assembleHistory.bind(this)
        this.getValue = this.getValue.bind(this)
        this.state = {
            tradeList: [],
            loading: true,
            showTotal: false,
            totalNum: 50
        };
        this.timeOutArray = {};
        this.resetData = this.resetData.bind(this);
        window.froceUpdateSpotLatestDeal = this.froceUpdateSpotLatestDeal
    }
}

export default LatestDeal