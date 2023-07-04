import React from 'react';
import { inject, observer } from "mobx-react";
import { reaction } from 'mobx';

import { Tooltips } from '@/components/common';
import JiantouFill from '@/assets/images/jiantou_fill.svg';
import HuaZhuan from '@/assets/images/HuaZhuan.svg'
import DepthList from './DepthList';
import PriceInfo from './PriceInfo';
import tradeTools from '@/utils/tradeTools';
import proTradeApi from '@/utils/proTradeApi';

@inject('store')
@observer
export default class EntrustInfo extends React.Component {
    componentDidMount() {
        this.props.onRef && this.props.onRef(this);
        this.tid_ = setTimeout(() => this.getShowNum(), 300);
        document.addEventListener('mousedown', this.handleClickOutside, false);
        let that = this;
        window.addEventListener('resize', function () {
            that.getShowNum('resize')
        });
        this.resizeLayoutSubscribe = PubSub.subscribe('RESIZE_LAYOUT_SAVE', this.saveLayoutData);
        this.resizeShowNumberSubscribe = PubSub.subscribe('RESIZE_SHOW_NUMBER', () => this.getShowNum('resize'));
        this.resetDataSubscribe = PubSub.subscribe('SHOW_NEW_COIN_START', this.resetData);
        this.depthUpdateHandlerSubscribe = PubSub.subscribe('TRADE_EVENT_depth.update', this.depthUpdateHandler);
        this.resetDataSubscribe = PubSub.subscribe('TRADE_EVENT_SWITCH_MARKET', this.resetData1);
        this.rollingStatus();
        this.query_loan_situation();
        reaction(() => this.props.store.last_price, () => this.changeSymbol());
        this.getOrderBookList();
        this.audoCaclRowNum = PubSub.subscribe('AUTO_CACL_DEEP_ROW_NUMBER', this.getShowNum)
    }
    componentWillUnmount() {
        PubSub.unsubscribe(this.resetDataSubscribe);
        PubSub.unsubscribe(this.resizeShowNumberSubscribe);
        PubSub.unsubscribe(this.resetDataSubscribe);
        PubSub.unsubscribe(this.depthUpdateHandlerSubscribe);
        PubSub.unsubscribe(this.audoCaclRowNum);
        PubSub.unsubscribe(this.resizeLayoutSubscribe);
        this.clearTrustDepthSelectTimer();
        document.removeEventListener('mousedown', this.handleClickOutside, false);
        let that = this;
        window.removeEventListener('resize', function () {
            that.getShowNum('resize')
        });
        clearTimeout(this._timer);
        if (this.tid_) {
            clearTimeout(this.tid_)
        }
    }
    render() {
        const { curr_a, curr_b, multiPriceArr, currSymbol } = this.props.store;
        const { isDecimalsChanged } = this.state;
        let priceData = this.state.pricePercentData;
        if (multiPriceArr[currSymbol]) {
            priceData = multiPriceArr[currSymbol]
        }
        const { coinbaseSymbol = '', currPriceToLocal = '', unitSymbol = '￥', percent = 0, priceStr = '0000' } = priceData;
        const tempPrice = CommonFormatPrice(priceStr);
        const tempCurrFiat = currPriceToLocal && currPriceToLocal < 0.00001 ? `＜${coinbaseSymbol}0.00001` : `${coinbaseSymbol} ${currPriceToLocal}`;
        const { askList, bidList, limitNum, selectedDepthDecimals, depthDecimals, depthDecimalPlaces, pendingOrdertype, selectPendingOrderType, rateInfo, showTotal, dataSymbol } = this.state;
        const showBase = curr_b;
        const curIsETF = GLOBAL_PRO_TRADE.currSymbol.match(/3S|3L|5S|5L/g);
        return (
            <div id='orderGroup'>
                <div className='orderGroup_content'>
                    <div className='order_show_type'>
                        <div className='change_type_button'>
                            {
                                pendingOrdertype.map((item, index) => {

                                    return <Tooltips label={item.name} key={item.id}>
                                        <div className={`${item.className} pending_order_btn ${selectPendingOrderType === item.id ? '' : 'pending_order_btn_opacity'}`}
                                            onClick={
                                                () => {
                                                    if (window.collectEvent) {
                                                        let type = 'both';
                                                        const obj = {
                                                            '0': 'both',
                                                            '1': 'buy_only',
                                                            '2': 'sell_only'
                                                        };
                                                        type = obj[item.id] || 'both';
                                                        window.collectEvent('beconEvent', 'trade_orderbok_type_click', {
                                                            button_name: type
                                                        })
                                                    }
                                                    this.setState({
                                                        selectPendingOrderType: item.id
                                                    }, () => {
                                                        this.getShowNum()
                                                    }
                                                    )
                                                }
                                            }
                                        >
                                            {
                                                item.id !== selectPendingOrderType && <div className='pending_order_btn_shadow'>
                                                </div>
                                            }
                                            <div className='pending-order-btn-icon-right'></div>
                                        </div>
                                    </Tooltips>
                                }
                                )
                            }
                        </div>
                        <div className='deep_merge orderGroup_head' ref={this.setWrapperRef}>
                            <div className='depth_interval' onClick={this.handleChangeInterval}>
                                <span>{selectedDepthDecimals}</span>
                                <JiantouFill className="icon entrust_drow" />
                            </div>
                            <div className='select-option-wrap' style={{ display: this.state.showDepthIntervalOption ? 'block' : 'none' }}>

                                {
                                    depthDecimals.map((item, index) => {
                                        return <div key={index} className='option-item' onClick={() => { this.changeDepthInterval(item) }}>
                                            <div className='select-option'>{item.value}</div>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <div className='entrust_rate'>
                        <div className='entrust_rate_buy'>L</div>
                        <div className='entrust_background'>
                            <div className='entrust_buy_background' style={{ width: rateInfo.buy_width + '%' }}>
                                {rateInfo.buy_rate}%
                            </div>
                            <div className='entrust_sell_background' style={{ width: rateInfo.sell_width + '%' }}>
                                {rateInfo.sell_rate}%
                            </div>
                        </div>
                        <div className='entrust_rate_sell'>
                            S
                        </div>
                        <div className='entrust_rate_tooltip' dangerouslySetInnerHTML={{ __html: `<span class='rate_top_arrow'></span>${i18n_trade.i18n_situation_tip}` }}>

                        </div>
                    </div>
                    <div className='entrust_header'>
                        <div className='entrust_header-wrap'>
                            <div>
                                <span>
                                    {lang_string('价格')}
                                </span>
                                <span>({curr_b})</span>
                            </div>
                            <div className='end'>
                                <span>
                                    {lang_string(showTotal ? '累计' : '数量')}
                                </span>
                                <span>({curr_a.length > 4 ? curr_a.slice(0, 4) + '...' : curr_a})</span>
                            </div>
                            <div className='col entrust_header-wrap-total'>
                                <span title={`${lang_string(showTotal ? '累计' : '总额')}(${curr_b})`}>
                                    {lang_string(showTotal ? '累计' : '总额')}
                                </span>
                                <span>({showBase.length > 4 ? showBase.slice(0, 4) + '...' : showBase})</span>
                                <HuaZhuan
                                    data-click-event="trade_andicap_turn_click"
                                    data-collect-params={`{"button_name":"andication_turn"}`}
                                    onClick={() => this.changeShowTotal()}
                                    className="icon iconwarn"
                                    style={{ marginLeft: '4px' }}
                                ></HuaZhuan>
                            </div>
                        </div>
                    </div>
                    <div className='order_list'>
                        {
                            selectPendingOrderType !== 1 && <div className='order_list_book listTop'>
                                <DepthList
                                    selectPendingOrderType={selectPendingOrderType}
                                    isDecimalsChanged={isDecimalsChanged}
                                    dataSymbo={dataSymbol}
                                    canUpdate={isDecimalsChanged && (!dataSymbol || dataSymbol.toLocaleLowerCase() === currSymbol.toLocaleLowerCase())}
                                    showTotal={showTotal}
                                    isAsk={1}
                                    orderList={askList}
                                    limitNum={limitNum}
                                    isOpenLocalCurrency={false}
                                    depthDecimalPlaces={depthDecimalPlaces}
                                    currB={curr_b}
                                    curIsETF={curIsETF}
                                    percent={percent}
                                    tempPrice={tempPrice}
                                    tempCurrFiat={tempCurrFiat}
                                />
                            </div>
                        }
                        {
                            selectPendingOrderType !== 2 && <PriceInfo
                                curIsETF={curIsETF}
                                percent={percent}
                                tempPrice={tempPrice}
                                tempCurrFiat={tempCurrFiat}
                                currPriceToLocal={currPriceToLocal}
                            ></PriceInfo>
                        }
                        {
                            selectPendingOrderType !== 2 && <div className='order_list_book listBottom'>
                                <DepthList
                                    selectPendingOrderType={selectPendingOrderType}
                                    isDecimalsChanged={isDecimalsChanged}
                                    dataSymbo={dataSymbol}
                                    canUpdate={isDecimalsChanged && (!dataSymbol || dataSymbol.toLocaleLowerCase() === currSymbol.toLocaleLowerCase())}
                                    showTotal={showTotal}
                                    isAsk={0}
                                    orderList={bidList}
                                    limitNum={limitNum}
                                    isOpenLocalCurrency={false}
                                    depthDecimalPlaces={depthDecimalPlaces}
                                    currB={curr_b}
                                />
                            </div>
                        }

                    </div>
                </div>
            </div>
        )
    }

    froceUpdateOrderBook = async () => {
        try {
            const ret = await getDefaultSpotChangeDecimals(globalStore.currSymbol);
            const decimals = ret ? ret.decimals : '';
            proTradeApi.getOrderBookList(globalStore.currSymbol, decimals).then(res => {
                if (!res)
                    return;
                if (res === null || res === void 0 ? void 0 : res.result) {
                    this.setState({
                        askList: res.ask_list,
                        bidList: res.bid_list,
                        dataSymbol: globalStore.currSymbol
                    })
                }
            }
            )
        } catch (e) { }
    }
    changeShowTotal = () => {
        const show = !this.state.showTotal;
        this.setState({
            showTotal: show
        }, () => {
            const total = show ? "1" : "2";
            localStorage.setItem('order-show-total', total)
        }
        )
    }
    changeSymbol = () => {
        const { currSymbol, multiPriceArr } = this.props.store;
        const { selectedDepthDecimals, depthDecimalPlaces, isFirstQuery } = this.state;
        if (!isFirstQuery)
            return;
        const precision = tradeTools.getPrecisionConfig(currSymbol);
        let priceData = this.state.pricePercentData;
        if (multiPriceArr[currSymbol]) {
            priceData = multiPriceArr[currSymbol]
        }
        let priceValue = this.props.store.last_price || priceData.priceStr || '';
        const depthList = tradeTools.addDepthOption(priceValue, tradeTools.genDepthDecimals(precision.precision_rate));
        getDefaultSpotChangeDecimals(currSymbol).then(res => {
            const selecDecimal = res || {
                decimals: depthList[0].value,
                precision: depthList[0].precision
            };
            this.setState({
                depthDecimals: depthList,
                selectedDepthDecimals: selecDecimal.decimals,
                depthDecimalPlaces: selecDecimal.precision,
                isFirstQuery: false,
                isDecimalsChanged: true
            });
            globalStore.set_deepValue(selecDecimal.decimals)
        }
        )
    }
    resetData = () => {
        this.setState({
            askList: [],
            bidList: []
        })
    }
    resetData1 = () => {
        this.query_loan_situation(true);
        this.setState({
            isFirstQuery: true,
            isDecimalsChanged: false
        });
        this.getOrderBookList(true)
    }
    saveLayoutData = () => {
        tradeTools.saveLayoutData()
    }
    rollingStatus = () => {
        clearTimeout(this._timer);
        this._timer = setTimeout(() => {
            this.query_loan_situation();
            this.rollingStatus()
        }
            , 6e4)
    }
    getOrderBookList = async initDecimal => {
        const { currSymbol, multiPriceArr, last_price } = this.props.store;
        let { selectedDepthDecimals, depthDecimalPlaces } = this.state;
        if (initDecimal) {
            const precision = tradeTools.getPrecisionConfig(currSymbol);
            let priceData = this.state.pricePercentData;
            if (multiPriceArr[currSymbol]) {
                priceData = multiPriceArr[currSymbol]
            }
            let priceValue = last_price || priceData.priceStr || '';
            const depthList = tradeTools.addDepthOption(priceValue, tradeTools.genDepthDecimals(precision.precision_rate));
            selectedDepthDecimals = depthList && depthList[0].value;
            depthDecimalPlaces = depthList && depthList[0].precision
        }
        if (!selectedDepthDecimals || initDecimal) {
            const rest = await getDefaultSpotChangeDecimals(currSymbol);
            if (rest && rest.decimals) {
                selectedDepthDecimals = rest.decimals;
                depthDecimalPlaces = rest.precision
            }
        }
        this.setState({
            selectedDepthDecimals,
            depthDecimalPlaces
        });
        proTradeApi.getOrderBookList(currSymbol, selectedDepthDecimals).then(res => {
            this.setState({
                isDecimalsChanged: true
            });
            if (res.result) {
                const ask_list = res.ask_list ? res.ask_list : [];
                const bid_list = res.bid_list ? res.bid_list : [];
                this.setState({
                    askList: [...ask_list],
                    bidList: [...bid_list],
                    dataSymbol: currSymbol
                })
            }
        }
        ).catch(() => this.setState({
            isDecimalsChanged: true
        }))
    }
    query_loan_situation = flag => {
        const { currSymbol, curr_a, curr_b } = this.props.store;
        const opts = {
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'market=' + currSymbol
        };
        fetch('/uni_loan/market_borrowed', opts).then(res => res.json()).then(data => {
            if (data.code === 200) {
                const buy_width = data.data[curr_a.toUpperCase() + '_PERCENT'] * 0.6 + 20;
                const buy_rate = data.data[curr_a.toUpperCase() + '_PERCENT'];
                const sell_width = data.data[curr_b.toUpperCase() + '_PERCENT'] * 0.6 + 20;
                const sell_rate = data.data[curr_b.toUpperCase() + '_PERCENT'];
                this.setState({
                    rateInfo: {
                        sell_width,
                        buy_width,
                        buy_rate,
                        sell_rate
                    }
                })
            } else {
                this.setState({
                    rateInfo: {
                        sell_width: 50,
                        buy_width: 50,
                        buy_rate: 50,
                        sell_rate: 50
                    }
                })
            }
        }
        ).catch(() => {
            this.setState({
                rateInfo: {
                    sell_width: 50,
                    buy_width: 50,
                    buy_rate: 50,
                    sell_rate: 50
                }
            })
        }
        )
    }
    getShowNum = type => {
        let $dom = $('.listTop');
        if (this.state.selectPendingOrderType === 1)
            $dom = $('.listBottom');
        let h = '';
        if ($dom[0] && type !== 'resize') {
            h = $dom.css('height');
            h = h.replace('px', '');
            const isetf = GLOBAL_PRO_TRADE.currSymbol.match(/3S|3L|5S|5L/g);
            if (this.state.selectPendingOrderType === 2)
                h = h - (isetf ? 50 : 36)
        }
        if (type === 'resize') {
            let layout = localStorage.getItem('deep_list_layout_v1');
            if (layout) {
                layout = JSON.parse(layout)
            }
            const selectTypeH = $('.dataSource .order_show_type').outerHeight(true);
            const rateH = $('.dataSource .entrust_rate').outerHeight(true);
            const headerH = $('.dataSource .entrust_header').outerHeight(true);
            if (layout && layout.layout != '0') {
                const entruH = $('.dataSource .entrustInfo-drag').height();
                const tabH = $('.dataSource .entrustInfo-drag .dataSource-tab').outerHeight(true);
                h = parseFloat(entruH) - parseFloat(tabH) - parseFloat(selectTypeH) - parseFloat(rateH) - parseFloat(headerH)
            } else {
                var ref56;
                const parentH = (ref56 = $('.dataSource').parent()) === null || ref56 === void 0 ? void 0 : ref56.outerHeight(true);
                const tabH = $('.dataSource .dataSource-tabs').outerHeight(true);
                h = parseFloat(parentH) - parseFloat(tabH) - parseFloat(selectTypeH) - parseFloat(rateH) - parseFloat(headerH)
            }
            const isetf = GLOBAL_PRO_TRADE.currSymbol.match(/3S|3L|5S|5L/g);
            h = h - (isetf ? 50 : 36);
            if (this.state.selectPendingOrderType === 0) {
                h = h / 2
            }
        }
        if (isNaN(h) || Number(h) <= 0)
            return;
        let num = h / 20;
        num = num.toFixed(2) - parseInt(num) > 0.7 ? num + 1 : num;
        this.setState({
            limitNum: parseInt(num)
        })
    }
    depthUpdateHandler = (key, arr) => {
        const { currSymbol } = this.props.store;
        let isCompleteUpt = arr[0];
        let asks = arr[1]['asks'];
        let bids = arr[1]['bids'];
        if (arr[2]) {
            if (arr[2] !== currSymbol) {
                return false
            }
        }
        const precision = tradeTools.getPrecisionConfig(currSymbol);
        if (asks && asks[0]) {
            for (let j = 0, len = asks.length; j < len; j++) {
                asks[j][2] = asks[j][0] * asks[j][1];
                asks[j][0] = Number(asks[j][0]).toFixed(precision.precision_rate);
                asks[j][1] = Number(asks[j][1]).toFixed(precision.precision_vol);
                asks[j][2] = Number(asks[j][2]).toFixed(precision.precision_total)
            }
        }
        if (bids && bids[0]) {
            for (let i = 0, len2 = bids.length; i < len2; i++) {
                bids[i][2] = bids[i][0] * bids[i][1];
                bids[i][0] = Number(bids[i][0]).toFixed(precision.precision_rate);
                bids[i][1] = Number(bids[i][1]).toFixed(precision.precision_vol);
                bids[i][2] = Number(bids[i][2]).toFixed(precision.precision_total)
            }
        }
        if (asks && asks[0]) {
            if (isCompleteUpt) {
                const a = tradeTools.addDeepListUpDown(this.state.askList, asks);
                this.setState({
                    askList: a
                });
                globalStore.depthAsks = a
            } else {
                let tempAskArr = tradeTools.mergeDepth(this.state.askList, asks, 1);
                this.setState({
                    askList: tempAskArr
                });
                globalStore.depthAsks = tempAskArr;
                tempAskArr = null
            }
        }
        if (bids && bids[0]) {
            if (isCompleteUpt) {
                const a = tradeTools.addDeepListUpDown(this.state.bidList, bids);
                this.setState({
                    bidList: a
                });
                globalStore.depthBids = a
            } else {
                let tempBidArr = tradeTools.mergeDepth(this.state.bidList, bids, 0);
                this.setState({
                    bidList: tempBidArr
                });
                globalStore.depthBids = tempBidArr;
                tempBidArr = null
            }
        }
        this.setState({
            dataSymbol: arr[2] ? arr[2] : ''
        });
        asks = null;
        bids = null;
        typeof updateDepth !== 'undefined' && updateDepth(this.state.bidList, this.state.askList)
    }
    clearTrustDepthSelectTimer = () => {
        if (this.hideSelect) {
            clearTimeout(this.hideSelect);
            this.hideSelect = null
        }
    }
    setWrapperRef = node => {
        this.wrapperRef = node
    }
    handleClickOutside = event => {
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            this.setState({
                showDepthIntervalOption: false
            })
        }
    }
    changeDepthInterval = item => {
        proTradeSocket.socket_send_cmd(proTradeSocket.socket, 'depth.unsubscribe', [window.GLOBAL_PRO_TRADE.currSymbol, 30, this.state.selectedDepthDecimals]);
        this.setState({
            dataSymbol: 'init'
        });
        this.setState({
            showDepthIntervalOption: false,
            selectedDepthDecimals: item.value,
            depthDecimalPlaces: item.precision,
            isDecimalsChanged: true
        });
        globalStore.set_deepValue(item.value);
        proTradeApi.getOrderBookList(window.GLOBAL_PRO_TRADE.currSymbol, item.value).then(res => {
            if (res.result) {
                const ask_list = res.ask_list ? res.ask_list : [];
                const bid_list = res.bid_list ? res.bid_list : [];
                this.setState({
                    askList: [...ask_list],
                    bidList: [...bid_list],
                    dataSymbol: window.GLOBAL_PRO_TRADE.currSymbol
                })
            }
        }
        );
        proTradeSocket.socket_send_cmd(proTradeSocket.socket, 'depth.subscribe', [window.GLOBAL_PRO_TRADE.currSymbol, 30, item.value]);
        getDataFromIndexedDB('proSpotOrderBookDecimals').then(res => {
            const obj = Object.assign({}, res, {
                [`${window.GLOBAL_PRO_TRADE.currSymbol}`]: {
                    decimals: item.value,
                    precision: +item.precision
                }
            });
            addDataToIndexDB('proSpotOrderBookDecimals', obj)
        }
        )
    }
    handleChangeInterval = () => {
        this.setState({
            showDepthIntervalOption: !this.state.showDepthIntervalOption
        });
        tradeTools.fnAddPoint && tradeTools.fnAddPoint('trade_button_click', 'orderbook_size');
        tradeTools.checkLayoutData().then(checked => {
            if (checked) {
                tradeTools.fnAddPoint && tradeTools.fnAddPoint('trade_button_click', 'orderbook_adjust')
            }
        }
        )
    }

    constructor(props) {
        super(props);
        this._timer = null;
        this.froceUpdateOrderBook = this.froceUpdateOrderBook.bind(this)
        this.changeShowTotal = this.changeShowTotal.bind(this)
        this.changeSymbol = this.changeSymbol.bind(this)
        this.resetData = this.resetData.bind(this)
        this.resetData1 = this.resetData1.bind(this)
        this.saveLayoutData = this.saveLayoutData.bind(this)
        this.rollingStatus = this.rollingStatus.bind(this)
        this.getOrderBookList = this.getOrderBookList.bind(this)
        this.query_loan_situation = this.query_loan_situation.bind(this)
        this.getShowNum = this.getShowNum.bind(this)
        this.depthUpdateHandler = this.depthUpdateHandler.bind(this)
        this.clearTrustDepthSelectTimer = this.clearTrustDepthSelectTimer.bind(this)
        this.setWrapperRef = this.setWrapperRef.bind(this)
        this.handleClickOutside = this.handleClickOutside.bind(this)
        this.changeDepthInterval = this.changeDepthInterval.bind(this)
        this.handleChangeInterval = this.handleChangeInterval.bind(this)
        
        const precision = tradeTools.getPrecisionConfig(GLOBAL_PRO_TRADE.currSymbol);
        this.observer = null;
        this.recordOldValue = {
            width: 0,
            height: 0
        };
        this.pendingOrdertypeName = ['futureTradeBookBuy', 'Bids', 'Asks'];
        const priceStr = GLOBAL_PRO_TRADE.ticker_last;
        const depthList = tradeTools.addDepthOption(priceStr, tradeTools.genDepthDecimals(precision.precision_rate));
        this.state = {
            askList: [],
            bidList: [],
            dataSymbol: '',
            limitNum: 10,
            isFirstQuery: true,
            pricePercentData: {
                coinbaseSymbol: '0.00',
                currPriceToLocal: '',
                unitSymbol: '￥',
                priceStr: '0000',
                percent: 0
            },
            showDepthIntervalOption: false,
            depthDecimals: depthList,
            selectedDepthDecimals: '',
            depthDecimalPlaces: '',
            pendingOrdertype: [{
                id: 0,
                name: t(this.pendingOrdertypeName[0]),
                className: 'average_pending_order'
            }, {
                id: 1,
                name: t(this.pendingOrdertypeName[1]),
                className: 'buy_pending_order'
            }, {
                id: 2,
                name: t(this.pendingOrdertypeName[2]),
                className: 'sell_pending_order'
            },],
            selectPendingOrderType: 0,
            rateInfo: {
                sell_width: '50',
                buy_width: '50',
                sell_rate: '0',
                buy_rate: '0'
            },
            showTotal: localStorage.getItem('order-show-total') === '1',
            isDecimalsChanged: false
        };
        getDefaultSpotChangeDecimals(GLOBAL_PRO_TRADE.currSymbol).then(res => {
            const selecDecimal = res || {
                decimals: depthList[0].value,
                precision: depthList[0].precision
            };
            this.state.selectedDepthDecimals = selecDecimal.decimals;
            this.state.depthDecimalPlaces = selecDecimal.precision
        }
        ).catch();
        window.froceUpdateSpotOrderBook = this.froceUpdateOrderBook
    }
}

