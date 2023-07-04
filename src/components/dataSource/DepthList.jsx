import React from 'react';
import { inject, observer } from "mobx-react";
import PriceInfo from './PriceInfo';
import tradeTools from '@/utils/tradeTools';
import { Calc } from '@/utils/MathUtil';

@inject('store')
@observer
class DepthList extends React.Component {
    componentDidMount() {
        const wrapper = document.querySelector(".animation-wrapper");
        if (wrapper) {
            wrapper.addEventListener('animationend', eve => {
                eve.target.classList.remove('upAnimation');
                eve.target.classList.remove('downAnimation')
            }
            )
        }
    }
    componentWillUnmount() {
        const wrapper = document.querySelector(".animation-wrapper");
        if (wrapper) {
            wrapper.removeEventListener('animationend', eve => {
                eve.target.classList.remove('upAnimation');
                eve.target.classList.remove('downAnimation')
            }
            )
        }
    }
    mouseHandler(e, index, type) {
        if (type === 0) {
            const { top } = e.target.getBoundingClientRect();
            const { left } = $('.orderGroup_content').offset();
            const width = $('.orderGroup_content').width();
            this.setState({
                index,
                showBubble: true
            }, () => {
                const calculateAverage = this.calculateAverage();
                PubSub.publish('ON_RECEIVE_BUBBLE_IS_SHOW', {
                    showBubble: true,
                    calculateAverage,
                    isAsk: this.props.isAsk,
                    height: top,
                    left,
                    width
                })
            }
            )
        } else {
            this.setState({
                index: -1,
                showBubble: false
            }, () => PubSub.publish('ON_RECEIVE_BUBBLE_IS_SHOW', {
                showBubble: false,
                calculateAverage: {},
                isAsk: this.props.isAsk,
                height: 0,
                left: 0,
                width: 0
            }))
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        if (this.props.orderList !== nextProps.orderList && this.state.showBubble) {
            const calculateAverage = this.calculateAverage();
            PubSub.publish('UPDATE_BUBBLE_DATA', {
                calculateAverage
            })
        }
        if (this.props.limitNum !== nextProps.limitNum) {
            this.setState({
                limitChanged: true
            })
        }
        if (nextProps.canUpdate || this.props.limitNum !== nextProps.limitNum)
            this.renderItem()
    }
    calculateAverage() {
        let limit = this.state.index + 1;
        let datas = this.props.orderList;
        if (limit <= 0 || !datas) {
            return
        }
        const sum = datas.slice(0, limit).reduce((acc, curr) => Calc.Add(acc, +curr[2]), 0);
        const sumBase = datas.slice(0, limit).reduce((acc, curr) => Calc.Add(acc, +curr[1]), 0);
        return {
            averagePrice: parseFloat(sum / sumBase).toFixed(tradeTools.genDecimalsDeep(this.props.depthDecimalPlaces).length - 2),
            totalBTC: sumBase,
            totalUSDT: true ? (tradeTools.get_bid_or_ask_decimals(datas).fiat_rate * sum).toFixed(2) : (+sum).toFixed(2)
        }
    }
    render() {
        const { isAsk, orderList, selectPendingOrderType, curIsETF, percent, tempPrice, tempCurrFiat } = this.props;
        return <div className='order_list_wrap'>
            <ul className={`${isAsk ? 'reverse' : ''} ${selectPendingOrderType === 0 && isAsk ? 'spot-reverse' : ''}`}
                id={this.props.type}>
                {this.state.items}
            </ul>
            {
                selectPendingOrderType === 2 && <PriceInfo
                    curIsETF={curIsETF}
                    percent={percent}
                    tempPrice={tempPrice}
                    tempCurrFiat={tempCurrFiat}
                />
            }
        </div>
    }
    setTrustPrice(value, index) {
        const { isAsk, orderList, showTotal } = this.props;
        const fix_num = GLOBAL_PRO_TRADE.precision[GLOBAL_PRO_TRADE.currSymbol];
        const curData = orderList[index];
        const num = curData && curData.length > 0 ? curData[1] : 0;
        const askList = orderList.reduce((a, c, i) => {
            if (i > index) {
                return a
            } else {
                a.push(c && c.length > 0 ? c[1] : 0);
                return a
            }
        }
            , []);
        const total = askList.reduce((a, b) => tradeTools.numAdd(a * 1, b * 1), 0).toFixed(fix_num.precision_vol);
        const data = {
            value: value,
            action: isAsk === 0 ? TRADE_TYPE.BUY : TRADE_TYPE.SELL,
            num: total
        };
        if (localStorage.getItem('trade_order_config_quick') === 'true') {
            this.props.store.setTradeType(isAsk === 0 ? TRADE_TYPE.BUY : TRADE_TYPE.SELL)
        }
        PubSub.publish('EVENT_TRUST_PRICE', data)
    }
    handleEnd(eve) {
        eve.target.classList.remove('upAnimation');
        eve.target.classList.remove('downAnimation')
    }
    renderItem() {
        const { isAsk, limitNum, orderList, isOpenLocalCurrency, currB, depthDecimalPlaces, showTotal, canUpdate, isDecimalsChanged, dataSymbo } = this.props;
        const { marketsConfig, currSymbol } = this.props.store;
        if (!orderList || !orderList[0]) {
            this.setState({
                items: []
            });
            return
        }
        let n = +new Date();
        let domArr = [], itemDiv, len = orderList.length, count = 0, vol_l_sum = 0, vol_r_sum = 0, vol_l_disp, vol_r_disp, width, curDepthPrecision = tradeTools.genDecimalsDeep(depthDecimalPlaces), vol_max_sum = tradeTools.get_ask_bid_list_vol_sum(orderList, limitNum, isAsk, parseFloat(orderList[0][0]));
        let rate_decimals, fiat_rate;
        const fix_num = GLOBAL_PRO_TRADE.precision[GLOBAL_PRO_TRADE.currSymbol];
        if (isOpenLocalCurrency) {
            rate_decimals = tradeTools.get_bid_or_ask_decimals(orderList, currB, true);
            fiat_rate = GLOBAL_PRO_TRADE.curr_fiat_market_rates[currB.toUpperCase()]
        }
        let askList = [];
        for (let i = 0; i < len; i++) {
            let tempArr = orderList[i];
            if (Number(tempArr[1]) === 0) {
                continue
            }
            count++;
            if (count > limitNum) {
                break
            }
            const isUpFlag = tempArr.length > 3 ? tempArr[3] : 0;
            let rate_disp = parseFloat(tempArr[0]).toFixed(curDepthPrecision.length - 2);
            let rate_disp_usd = rate_disp;
            let rate_total = parseFloat(tempArr[2]).toFixed(fix_num.precision_total);
            if (isOpenLocalCurrency) {
                let tempRate = tempArr[0];
                let tempTotal = tempArr[2];
                tempRate *= fiat_rate;
                tempTotal *= fiat_rate;
                rate_disp = parseFloat(tempRate).toFixed(curDepthPrecision.length - 2);
                rate_total = parseFloat(tempTotal).toFixed(2)
            }
            if (isAsk) {
                vol_l_disp = tempArr[1];
                vol_l_sum += parseFloat(tempArr[1]);
                width = Math.pow(vol_l_sum, 1 / 2) / Math.pow(vol_max_sum, 1 / 2) * 100
            } else {
                vol_r_disp = tempArr[1];
                vol_r_sum += parseFloat(tempArr[2]);
                width = Math.pow(vol_r_sum, 1 / 2) / Math.pow(vol_max_sum, 1 / 2) * 100
            }
            if (width < 1)
                width = 1;
            if (tempArr['rate'] <= 0 || tempArr['symbol_l'] <= 0 || tempArr['symbol_r'] <= 0)
                continue;
            askList.push({
                l: vol_l_disp,
                s: rate_total,
                r: vol_r_disp
            });
            const total_l = askList.reduce((a, b) => tradeTools.numAdd(a * 1, b.l * 1), 0).toFixed(fix_num.precision_vol);
            const total_s = askList.reduce((a, b) => tradeTools.numAdd(a * 1, b.s * 1), 0).toFixed(fix_num.precision_total);
            const total_r = askList.reduce((a, b) => tradeTools.numAdd(a * 1, b.r * 1), 0).toFixed(fix_num.precision_vol);
            if (isAsk) {
                itemDiv = <li key={'ask' + i}
                    onMouseEnter={e => {
                        e.stopPropagation();
                        this.mouseHandler(e, i, 0)
                    }}
                    onMouseLeave={
                        e => {
                            e.stopPropagation();
                            this.mouseHandler(null, i, 1)
                        }
                    }
                    onClick={() => this.setTrustPrice(rate_disp_usd, i)}
                    className={`row row_enter ${i <= this.state.index ? 'over_background' : ''} ${i === this.state.index ? 'dashed_border' : ''}`}
                >
                    <span className='price font-dec-color'> {rate_disp} </span>
                    <span onAnimationEnd={this.handleEnd} className={`value animation-wrapper ${isUpFlag === 1 ? 'upAnimation' : isUpFlag === 2 ? 'downAnimation' : ''}`}>
                        {tradeTools.formatLittleValue(foramtedValuesTool.conversionUnit(showTotal ? total_l : vol_l_disp), showTotal ? fix_num.precision_total : fix_num.precision_vol)}
                    </span>
                    <span className='value value_total'>{foramtedValuesTool.conversionUnit(showTotal ? total_s : rate_total)}
                        <span className='changes bg-dec-color' style={{ width: width + '%' }}>
                        </span></span>
                </li>
            } else {
                itemDiv = <li key={'bid' + i}
                    onMouseEnter={e => {
                        e.stopPropagation();
                        this.mouseHandler(e, i, 0)
                    }}
                    onMouseLeave={
                        e => {
                            e.stopPropagation();
                            this.mouseHandler(null, i, 1)
                        }
                    }
                    onClick={() => this.setTrustPrice(rate_disp_usd, i)}
                    className={`row row_enter ${i <= this.state.index ? 'over_background' : ''} ${i === this.state.index ? 'dashed_border_reverse' : ''}`}
                >
                    <span className='price font-dec-color'> {rate_disp} </span>
                    <span onAnimationEnd={this.handleEnd} className={`value animation-wrapper ${isUpFlag === 1 ? 'upAnimation' : isUpFlag === 2 ? 'downAnimation' : ''}`}>
                        {tradeTools.formatLittleValue(foramtedValuesTool.conversionUnit(showTotal ? total_r : vol_r_disp), showTotal ? fix_num.precision_total : fix_num.precision_vol)}
                    </span>
                    <span className='value value_total'>{foramtedValuesTool.conversionUnit(showTotal ? total_s : rate_total)}
                        <span className='changes bg-dec-color' style={{ width: width + '%' }}>
                        </span></span>
                </li>
            }
            domArr.push(itemDiv)
        }
        itemDiv = null;
        this.setState({
            items: domArr
        })
    }
    constructor(props) {
        super(props);
        this.setTrustPrice = this.setTrustPrice.bind(this)
        this.handleEnd = this.handleEnd.bind(this)
        this.renderItem = this.renderItem.bind(this)
        this.isScrollInit = false;
        this.state = {
            index: -1,
            showBubble: false,
            items: [],
            limitChanged: false
        }
    }
}

export default DepthList