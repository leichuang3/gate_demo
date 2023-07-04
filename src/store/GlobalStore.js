import PubSub from "pubsub-js";
import { observable, action, computed, toJS } from "mobx";
import proTradeApi from '../utils/proTradeApi';
import tradeTools from '../utils/tradeTools';
const { shallow } = observable;

class GlobalStore {
    @observable
    strategyChartResize = 0
    @observable
    PRO_TRADE_WS_TIME = 0;
    @observable
    history = null;
    @observable
    balances_mulcharts = {};
    @observable
    margin_balances = {
        money: {
            available: '0.00',
            borrow: '0.00'
        },
        stock: {
            available: '0.00',
            borrow: '0.00'
        },
        risk_current: {
            price: '',
            risk: ''
        },
        risk_liquidate: {
            price: ''
        },
        risk_warning: '',
        margin_funds_total_usdt: ''
    }
    @observable
    pendingNum = 0;
    @observable
    coinInfo = {};
    @observable
    marketType = window.location.href.indexOf('trade') !== -1 ? 'spot' : window.location.href.indexOf('futures') !== -1 ? 'contract' : 'spot';
    @observable
    tabMarketType = MENU_MARKET.SPOT;
    @observable
    tabMarketTypeBeforeSearch = window.location.href.indexOf('trade') !== -1 ? MENU_MARKET.SPOT : MENU_MARKET.CONTRACT
    @observable
    showLoanBorrowModal = false;

    @shallow
    allMarketList = all_currency_list_json || {};

    @observable
    marketMenu = market_menu_config_json || []

    @observable
    currSymbol = GLOBAL_PRO_TRADE.currSymbol
    @observable
    curr_a = currA.toUpperCase()
    @observable
    curr_b=currB.toUpperCase()
    @observable
    netETF = {}
    @observable
    loadingAllMarketListData = false
    @observable
    frequency_value = frequencyDefaultValue || 1
    @observable
    last_price = GLOBAL_PRO_TRADE.last_price
    @observable
    bidOnePrice = 0
    @observable
    askOnePrice = 0
    @shallow
    depthAsks = []
    @shallow
    depthBids = []
    @observable
    currTradePanelMode = 0
    @observable
    klineShowOrderLine = false
    @observable
    mChartMode = false;
    @observable
    mChartActive
    @observable
    tabMarkets
    @observable
    multiPriceArr = {}
    @observable
    layoutMode = localStorage.getItem(`trade_layout_mode`) || LAYOUT_MODES.PRO_TRADE
    @observable
    showLayout = defaultShowLayout
    @observable
    layoutOption = localStorage.getItem(`trade_layout_mode`) == 'standard_trade' ? defaultSimpleTradeLayoutOption : defaultLayoutOption
    @observable
    marketSimpleMode = localStorage.getItem('show_simple_mode') !== '0'
    @observable
    marketFoldMode = localStorage.getItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_fold_mode`) === '1'
    @observable
    AllFoldModVersion = '0.0.22'
    @observable
    marketAllFoldMode = (localStorage.getItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_all_fold_mode_ ${this.AllFoldModVersion}`) || '0') === (document.body.clientWidth <= 1440 ? '0' : '1')
    @observable
    isFullScreen = false
    @observable
    showTradeEditPopup = false
    @observable
    TradeEditPanelObj = {}
    @observable
    tabIndex = TRADE_TABLE_TYPE.PENDING_ORDER
    @observable
    currOrderListType = localStorage.getItem('openOrder_type_select') * 1 || 0
    @observable
    currHistoryOrderListType = localStorage.getItem('orderHistory_type') * 1 || 0
    @observable
    orderBookTradeTabType = ORDERBOOK_TRADE.ORDER_BOOK
    @observable
    order = []
    @observable
    loanList = []
    @observable
    currentOrderNumber = {}
    @observable
    my_trade_list_table = {
        data: [],
        page: 1
    }
    @observable
    my_history_trades = {
        data: [],
        page: 1
    }
    @observable
    my_loan_management = {
        data: [],
        page: 1,
        total: 0,
        activeTypeBtn: 0,
        loanDetailsSelection: '1',
        isLoading: true
    }
    @observable
    tradeType = 'buy'
    @observable
    theme = tradeTools.getTheme()
    @observable
    showProfitCalculator = false
    @observable
    coinInfoExist = true;
    @observable
    spot_grid_list = {
        pedingPage: 1,
        pendingData: [],
        historyPage: 1,
        historyData: []
    }
    @observable
    marketsConfig = {}
    @observable
    wsTime = 0
    @observable
    wsIsConnecting = false
    @observable
    initCartSwitch = false;
    @observable
    unified_account_status = {
        notLoaded: true,
        is_open_portfolio_margin: 0,
        is_open_portfolio_margin_cross_margin: 0,
        is_open_portfolio_margin_futures_usd: 0,
        is_open_portfolio_margin_futures_usdt: 0,
        is_open_portfolio_margin_futures_btc: 0,
        portfolio_margin_account_uid: '',
        is_portfolio_margin_account: is_portfolio_margin_account ? 1 : 0
    }
    @observable
    classic_account_spot_setting = localStorage.getItem('classic_account_spot_setting') ? JSON.parse(localStorage.getItem('classic_account_spot_setting')) : {
        limit_price: true,
        market_price: true,
        sl_and_tp: true,
        alg_order: true,
        cancel_all_pending_orders: true
    }
    @observable
    maxLoanableNum = [0, 0]
    @observable
    spot_lerverage = localStorage.getItem('spot_leverage') === '1'
    @observable
    cross_margin_balances = null;
    @observable
    menuSubType = localStorage.getItem('SPOT_TRADE_MARKET_MENU') || 'USDT'
    @observable
    layoutversion = '1.4.05'
    @observable
    containerWidth = document.body.clientWidth
    @observable
    is_isolated_margin = false
    @observable
    dailyMarginRate = {
        curr_a: '0.00000',
        curr_b: '0.00000',
        year_a: '0.00',
        year_b: '0.00'
    }
    @observable
    classic_margin_order_confirm = localStorage.getItem('isolate_margin_remind') === '1'
    @observable
    user_migrate_status = 1
    @observable
    spot_margin_auto_borrow_setting = margin_auto_borrow_setting === '1'
    @observable
    spot_margin_auto_repay_setting = margin_auto_repay_setting === '1'
    @observable
    show_unified_account_trade_guide_modal = false
    @observable
    tradingType = getQueryVariable('tradModel') == 'strategybot' && show_strategy_bots_tab ? 'strategybot' : 'trade'
    @observable
    showOldUserFirstUsingBotTab = false
    @observable
    is_copy_trader = false
    @observable
    searchText = ""
    @observable
    searchedMarkets = {
        spot: [],
        future: [],
        loan: []
    }
    @observable
    is_in_copy = false
    @observable
    leftMarkets = []

    @action
    set_tradingType = tradingType => {
        this.tradingType = tradingType
    }

    @action
    set_is_copy_trader = e => {
        this.is_copy_trader = e
    }
    @action
    updateLeftMarkets = data => {
        this.leftMarkets = data || []
    }
    @action
    set_is_in_copy = e => {
        this.is_in_copy = e;
        if (e) {
            this.getSpotCopyUserAmount(e)
        } else {
            this.getMarketAvailable()
        }
    }
    @observable
    is_support_copy = true;
    @action
    set_is_support_copy = e => {
        this.is_support_copy = e
    }
    @observable
    support_follow_list = []
    @action
    set_support_follow_list = e => {
        this.support_follow_list = e
    }
    @action
    set_orderBookTradeTabType = e => {
        this.orderBookTradeTabType = e
    }
    @observable
    subAvailable = 0
    @action
    set_subAvailable = e => {
        this.subAvailable = e
    }
    @action
    getSpotCopyUserAmount = (is_in_copy = this.is_in_copy) => {
        if (!is_in_copy) {
            return
        }
        const that = this;
        proTradeApi.transfer_available({
            market: that.currSymbol
        }).then(res => {
            if (res.code == 0) {
                if (res.data.sub_spot.length != 0) {
                    var ref19, ref20;
                    const symbol = that.currSymbol.toLowerCase();
                    var ref21;
                    const symbolAva = (ref21 = (ref19 = res.data.sub_spot.find(i => i.currency.toLowerCase() == symbol.split('_')[0])) === null || ref19 === void 0 ? void 0 : ref19.available) !== null && ref21 !== void 0 ? ref21 : 0;
                    var ref22;
                    const usdtAva = (ref22 = (ref20 = res.data.sub_spot.find(i => i.currency.toLowerCase() == 'usdt')) === null || ref20 === void 0 ? void 0 : ref20.available) !== null && ref22 !== void 0 ? ref22 : 0;
                    that.balances_mulcharts[symbol] = [symbolAva, usdtAva]
                } else {
                    that.balances_mulcharts[that.currSymbol.toLowerCase()] = [0, 0]
                }
            }
        }
            , error => { }
        )
    }
    @action
    setUnifiedAccountTradeGuideModal = flag => {
        this.show_unified_account_trade_guide_modal = flag
    }
    @action
    setMarginOrderConfirm = () => {
        this.classic_margin_order_confirm = !this.classic_margin_order_confirm;
        localStorage.setItem('isolate_margin_remind', this.classic_margin_order_confirm ? '1' : '2')
    }
    @action
    setIsolatedMargin = flag => {
        this.is_isolated_margin = flag
    }
    @action
    setAutoMargin = (type, flag, tips = false) => {
        const params = {
            k: type,
            v: Number(flag)
        };
        proTradeApi.setMarginUserSetting(params).then(res => {
            if (res.code === 0) {
                if (type === 'auto_repay') {
                    this.spot_margin_auto_repay_setting = flag;
                    if (tips)
                        return;
                    flag ? NotySuccess(i18n_trade.EnableAutoRepay) : NotySuccess(i18n_trade.DisableAutoRepay)
                } else {
                    this.spot_margin_auto_borrow_setting = flag;
                    if (tips)
                        return;
                    flag ? NotySuccess(i18n_trade.EnableAutoBorrow) : NotySuccess(i18n_trade.DisableAutoBorrow)
                }
            } else {
                NotyWarning(res.message)
            }
        }
        )
    }
    @observable
    deepValue = ''

    @action
    set_deepValue = value => {
        this.deepValue = value
    }

    @observable
    tradeButtonSetting = localStorage.getItem('trade_button_setting') || TRADE_BTN_SETTING.MERGE

    @action
    updateMenuSubType = () => {
        const supportMarkets = Object.keys(this.curMarketList);
        if (!supportMarkets.includes(this.menuSubType)) {
            this.menuSubType = 'USDT'
        }
    }
    @action
    set_menuSubType = menuSubType => {
        this.menuSubType = menuSubType;
        const curMarket = this.allMarketList[menuSubType];
        if (menuSubType !== 'FAVRT' && Object.keys(curMarket).length === 0) {
            this.getMarketListByCategory(menuSubType)
        }
    }
    @action
    set_loan_marketType = () => {
        this.marketType = 'loan';
        this.tabMarketType = MENU_MARKET.LOAN;
        this.showLoanBorrowModal = true
    }
    @action
    setTabMarketType = type => {
        this.tabMarketType = type
    }
    @action
    setTabMarketTypeBeforeSearch = type => {
        this.tabMarketTypeBeforeSearch = type
    }
    @action
    set_showLoanBorrowModal = val => {
        this.showLoanBorrowModal = val
    }
    @action
    change_spot_lerverage = () => {
        this.spot_lerverage = !this.spot_lerverage;
        localStorage.setItem('spot_leverage', this.spot_lerverage ? '1' : '0')
    }
    @observable
    shouldReCompute = false
    @action
    setTime = time => {
        this.wsTime = time
    }
    @action
    setNet = value => {
        this.netETF = { ...value }
    }
    @action
    setFrequencyValue=value=>{
        this.frequency_value = value
    }
    @action
    setInitCart = flag => {
        this.initCartSwitch = flag
    }
    @action
    getUserMigrateStatus = () => {
        proTradeApi.userMigrateStatus().then(res => {
            if (res.code === 0) {
                this.user_migrate_status = res.data.status
            }
        }
        )
    }
    @action
    userMigrate = () => {
        return new Promise((resolve, reject) => {
            proTradeApi.userMigrate().then(res => {
                if (res.code === 0) {
                    NotySuccess(res.message)
                } else {
                    resolve(res)
                }
                setTimeout(() => this.getUserMigrateStatus(), 500)
            }
            )
        }
        )
    }
    @action
    closeAllFold = () => {
        if (!this.marketAllFoldMode && !this.marketFoldMode) {
            this.changeMarketAllFoldMode()
        }
    }
    @action
    openAllFold = () => {
        if (this.marketAllFoldMode && !this.marketFoldMode) {
            this.changeMarketAllFoldMode()
        }
    }
    @action
    updateSymbol = async marketName => {
        if (marketName) {
            await this.getMarketConfig(marketName);
            this.currSymbol = marketName.toUpperCase();
            GLOBAL_PRO_TRADE.currSymbol = marketName.toUpperCase();
            let tempArr = marketName.split('_');
            if (tempArr.length > 1) {
                this.curr_a = tempArr[0].toUpperCase();
                this.curr_b = tempArr[1].toUpperCase()
            }
            this.bidOnePrice = 0;
            this.askOnePrice = 0;
            this.setActiveChartMarket(marketName);
            this.updateMarginRate();
            let currMarketOnly = $.cookie('curr_market_only');
            if (currMarketOnly && currMarketOnly == '1') {
                this.initOrderListNumber()
            }
            proTradeApi.getCurrentSpotTicker({
                type: 'gate_spot',
                pair: marketName
            }).then(res => {
                if (!res || !res.last_price)
                    return;
                const price = res.last_price && Number(res.last_price);
                this.multiPriceArr ={
                    [this.currSymbol]:{
                        priceStr: price,
                        ...this.multiPriceArr[this.currSymbol]
                    },
                    ...this.multiPriceArr
                }
            }
            );
            PubSub.publish('TRADE_EVENT_SWITCH_MARKET', {
                currSymbol: this.currSymbol
            })
        }
    }
    @action
    updateMarginRate = () => {
        proTradeApi.dailyRate({
            curr_a: this.curr_a,
            curr_b: this.curr_b
        }).then(res => {
            if (res.code === 0) {
                var ref23, ref24, ref25, ref26;
                const a = window.Calc.Mul((ref23 = res.data) === null || ref23 === void 0 ? void 0 : ref23.curr_a, 100) + '%';
                const b = window.Calc.Mul((ref24 = res.data) === null || ref24 === void 0 ? void 0 : ref24.curr_b, 100) + '%';
                const year_a = window.Calc.Mul(((ref25 = res.data) === null || ref25 === void 0 ? void 0 : ref25.curr_a) * 1 * 365, 100).toFixed(2) + '%';
                const year_b = window.Calc.Mul(((ref26 = res.data) === null || ref26 === void 0 ? void 0 : ref26.curr_b) * 1 * 365, 100).toFixed(2) + '%';
                this.dailyMarginRate = {
                    curr_a: a,
                    curr_b: b,
                    year_a,
                    year_b
                }
            }
        }
        )
    }
    @action
    UpdateInfoCoins = () => {
        proTradeApi.getCoinInfo({
            curr_type: this.curr_a.toLowerCase()
        }).then(res => {
            if (res && res.datas && res.datas.coininfo) {
                const info = res.datas.coininfo;
                this.coinInfo.name = is_cn ? info.name_cn : info.name;
                this.coinInfo.coin_name = info.coin_name;
                this.coinInfo.symbolName = info.name;
                const price = info.ticker_last && Number(info.ticker_last);
                const decimals_fiatRate = tradeTools.get_bid_or_ask_decimals(price, this.curr_b, true);
                const currPriceToLocal = tradeTools.num_fix(price * decimals_fiatRate.fiat_rate, decimals_fiatRate.fiat_rate_decimals);
                this.multiPriceArr = {
                    ...this.multiPriceArr,
                    [this.currSymbol]:{
                        percent: info.change && Number(info.change).toFixed(2),
                        priceStr: price,
                        high: info.ticker_high,
                        low: info.ticker_low,
                        currPriceToLocal: currPriceToLocal,
                        baseVolume: conversionUnit(info.trade_amount),
                        quoteVolume: conversionUnit(info.trade_volume),
                        ...this.multiPriceArr[this.currSymbol]
                    }
                }
            }
        }
        )
    }
    @action
    getTabMarketsPrecision = () => {
        this.tabMarkets.map(async market => {
            if (market && !this.marketsConfig[market] && market !== this.currSymbol) {
                try {
                    const result = await proTradeApi.getMarketConfig(market);
                    if (result.code === 200) {
                        const { prec_v, prec_t, prec_r } = result.data;
                        GLOBAL_PRO_TRADE.precision[market] = {
                            precision_vol: prec_v,
                            precision_total: prec_t,
                            precision_rate: prec_r,
                            precision_amount: prec_v
                        };
                        this.marketsConfig[market] = result.data
                    }
                } catch (e) {
                    console.log('marketsConfig err:' + e)
                }
            }
        }
        )
    }
    @action
    getMarketConfig = async market => {
        if (!this.marketsConfig[market]) {
            let result = await proTradeApi.getMarketConfig(market);
            if (result.code === 200) {
                var ref27;
                const { prec_v, prec_t, prec_r } = result.data;
                GLOBAL_PRO_TRADE.precision[market] = {
                    precision_vol: prec_v,
                    precision_total: prec_t,
                    precision_rate: prec_r,
                    precision_amount: prec_v
                };
                if (market === this.currSymbol && !((ref27 = result.data) === null || ref27 === void 0 ? void 0 : ref27.is_cross_margin_market) && this.unified_account_status.is_portfolio_margin_account == 1) {
                    switchAccountMode(0)
                }
                this.marketsConfig[market] = result.data
            }
        }
    }
    @action
    fetchOtherMarkets = () => {
        this.loadingAllMarketListData = true;
        const spotInfo = this.marketMenu.find(o => o.market === MENU_MARKET.SPOT);
        let spotCategories = spotInfo ? spotInfo.sub.map(o => o.market.toUpperCase()) : [];
        spotCategories = spotCategories.filter(o => !['FAVRT', 'LOAN'].includes(o));
        let index = 0;
        const intervalId = setInterval(() => {
            this.getMarketListByCategory(spotCategories[index] === 'USD_S' ? 'USDT' : spotCategories[index], index === spotCategories.length - 1);
            index++;
            if (index === spotCategories.length) {
                clearInterval(intervalId)
            }
        }, 100)
    }
    @action
    fetchLoanList = () => {
        proTradeApi.getMarketList('LOAN').then(res => {
            if (res) {
                const list = res.map(item => {
                    return {
                        name: item[0],
                        fullName: item[1],
                        estimation_rate: item[2],
                        total_max_borrow_amount: item[3]
                    }
                }
                );
                this.loanList = list
            }
        }
        )
    }
    @action
    getMarketListByCategory = (category, isLast = false) => {
        try {
            proTradeApi.getMarketList(category).then(res => {
                if (res) {
                    const curMarketInfo = res.reduce((acc, cur) => {
                        const market = cur[0].toLowerCase();
                        const [curr_a, curr_b] = market.split('_');
                        acc[market] = {
                            curr_a,
                            curr_b,
                            pair: cur[0],
                            name: cur[1],
                            p_rate: cur[2],
                            rate: cur[3],
                            rate_percent: cur[4],
                            vol_b: cur[5],
                            enable_credit: cur[7],
                            symbol: curr_a ? curr_a.toUpperCase() : '',
                            multiple: cur[8],
                            trend: cur[4] > 0 ? 'up' : 'down'
                        };
                        return acc
                    }, {});
                    this.allMarketList ={
                        [category]: curMarketInfo,
                        ...this.allMarketList
                    }
                }
            }
            ).finally(() => {
                if (isLast) {
                    addDataToIndexDB('all_market', toJS(this.allMarketList));
                    this.loadingAllMarketListData = false
                }
            }
            )
        } catch (e) {
            console.error(`fetch ${category} market error`)
        }
    }
    @action
    setActiveChartMarket = market => {
        if (!this.mChartMode) {
            const marketLength = this.tabMarkets.length;
            if (this.tabMarkets.indexOf(market) === -1) {
                if (marketLength < 4) {
                    this.tabMarkets[marketLength] = market
                } else if (marketLength >= 4) {
                    const newTabMarkets = this.tabMarkets.filter((o, index) => {
                        return index !== 0
                    }
                    );
                    newTabMarkets.push(market);
                    this.tabMarkets = newTabMarkets
                }
                this.mChartActive = this.tabMarkets.length - 1
            } else {
                this.mChartActive = this.tabMarkets.indexOf(market)
            }
        } else {
            this.tabMarkets[this.mChartActive] = market
        }
    }
    @action
    setActiveChartIndex = (activeIndex, isDelete = false) => {
        localStorage.setItem('pro-trade-active-index', activeIndex);
        if (this.tabMarkets[activeIndex] && (isDelete || this.mChartActive !== activeIndex)) {
            this.history && this.history.push('/trade/' + this.tabMarkets[activeIndex] + window.location.search)
        }
        this.mChartActive = activeIndex
    }
    @action
    toggleChartMode = onOff => {
        $('.mode-switchicon-dropdown').hide();
        this.setChartShowMode(onOff);
        localStorage.setItem('pro-chartShowMode', Number(onOff))
    }
    @action
    setChartShowMode = on => {
        this.mChartMode = on;
        if (on) {
            if (this.tabMarkets.length < 4) {
                const length = this.tabMarkets.length;
                for (let i = 0; i < 4 - length; i++) {
                    this.tabMarkets.push('')
                }
            }
        } else {
            const _tabs = [...this.tabMarkets];
            this.tabMarkets = _tabs.filter(m => m)
        }
    }
    @action
    deleteChart = (e, index) => {
        e && e.stopPropagation();
        if (this.mChartMode) {
            this.tabMarkets[index] = ''
        } else {
            const _tabs = [...this.tabMarkets];
            _tabs[index] = '';
            this.tabMarkets = _tabs.filter(m => m)
        }
        const currentActiveIndex = this.tabMarkets.findIndex(val => val != '');
        this.setActiveChartIndex(currentActiveIndex, true);
        PubSub.publish('REMOVE_PRO_WIDGET', {
            index
        })
    }
    @action
    deleteNotSupportUnifiedAccountChart = () => {
        const { support, notSupport } = this.tabMarkets.reduce((acc, cur, idx) => {
            const config = this.marketsConfig[cur];
            if (config && config.is_cross_margin_market != 1) {
                acc.notSupport.push({
                    market: cur,
                    index: idx
                })
            } else {
                acc.support.push(cur)
            }
            return acc
        }
            , {
                support: [],
                notSupport: []
            });
        const curTabMarket = this.tabMarkets[this.mChartActive];
        notSupport.forEach(item => {
            const index = item.index;
            if (this.mChartMode) {
                this.tabMarkets[index] = ''
            }
            PubSub.publish('REMOVE_PRO_WIDGET', {
                index
            })
        }
        );
        if (!this.mChartMode) {
            this.tabMarkets = this.tabMarkets.filter(o => support.includes(o))
        }
        const newActiveIndex = support.findIndex(o => o === curTabMarket);
        this.setActiveChartIndex(newActiveIndex != -1 ? newActiveIndex : 0)
    }
    @action
    showBigPicture = index => {
        this.setActiveChartIndex(index);
        this.toggleChartMode(false)
    }
    @action
    currentClientWidth = containerWidth => {
        this.containerWidth = containerWidth;
        if (this.layoutMode == 'default_trade') {
            if (containerWidth <= 1440) {
                this.closeAllFold()
            } else {
                this.openAllFold()
            }
        }
    }
    @action
    setLayoutHandler = key => {
        this.showLayout[key] = !this.showLayout[key];
        localStorage.setItem(`custom_ ${this.layoutMode}_show_layout`, JSON.stringify(this.showLayout));
        if (this.showLayout[key]) {
            const LayoutOption = localStorage.getItem(`trade_layout_mode`) == 'standard_trade' ? defaultSimpleTradeLayoutOption : defaultLayoutOption;
            const currentShowLayout = JSON.parse(JSON.stringify(this.showLayout));
            const newLayout = {};
            for (let keyName in LayoutOption) {
                const layout = LayoutOption[keyName];
                const arr = [];
                layout.forEach(item => {
                    if (currentShowLayout[item.i]) {
                        arr.push(item)
                    }
                }
                );
                newLayout[keyName] = arr
            }
            if (this.layoutMode == 'default_trade') {
                const { w1366 } = WidthObj;
                const { w0Open } = w1366;
                const marketListIndex = newLayout.w1366.findIndex(o => o.i === 'marketList');
                const { w } = newLayout.w1366[marketListIndex];
                newLayout.w1366.forEach(o => {
                    if (o.i === 'chartHeader' || o.i === 'charts') {
                        o.x = w0Open;
                        o.w = o.w - (w0Open - w)
                    }
                }
                );
                newLayout.w1366[marketListIndex].w = w0Open
            }
            this.layoutOption = newLayout;
            if (key === 'marketList') {
                this.marketFoldMode = false;
                this.marketAllFoldMode = false
            }
        }
    }
    @action
    switchStratebotLayout = market => {
        const currentLayout = JSON.parse(JSON.stringify(this.layoutOption));
        this.showLayout['assets'] = market == 'trade';
        if (market == 'strategybot') {
            if ((globalStore === null || globalStore === void 0 ? void 0 : globalStore.layoutMode) == 'default_trade') {
                for (let key in currentLayout) {
                    const layout = currentLayout[key];
                    const tradingIndex = layout.findIndex(o => o.i === 'trading');
                    layout[tradingIndex].h = initLayoutH.h0 - initLayoutH.h2 + initLayoutH.h1;
                    layout[key] = layout
                }
            } else {
                for (let key in currentLayout) {
                    const layout = currentLayout[key];
                    const entrustInfoIndex = layout.findIndex(o => o.i === 'entrustInfo');
                    layout[entrustInfoIndex].h = initLayoutH.h3 + initLayoutH.h2 + initLayoutH.h4 - initLayoutH.h2 * 2;
                    layout[key] = layout
                }
            }
            this.layoutOption = currentLayout;
            PubSub.publish('AUTO_CACL_DEEP_ROW_NUMBER')
        } else {
            const LayoutOption = localStorage.getItem(`trade_layout_mode`) == 'standard_trade' ? defaultSimpleTradeLayoutOption : defaultLayoutOption;
            const currentShowLayout = JSON.parse(JSON.stringify(this.showLayout));
            const newLayout = {};
            for (let keyName in LayoutOption) {
                const layout = LayoutOption[keyName];
                const arr = [];
                layout.forEach(item => {
                    if (currentShowLayout[item.i]) {
                        arr.push(item)
                    }
                }
                );
                newLayout[keyName] = arr
            }
            this.layoutOption = newLayout;
            this.setFoldMarketListLayout(this.marketAllFoldMode, 'allFold')
        }
    }
    @action
    setFoldMarketListLayout = (foldMode, type) => {
        const currentLayout = JSON.parse(JSON.stringify(this.layoutOption));
        if (is_ar) {
            if (foldMode) {
                for (let key in currentLayout) {
                    const layout = currentLayout[key];
                    const marketListIndex = layout.findIndex(o => o.i === 'marketList');
                    const { x, w, h } = layout[marketListIndex];
                    const { w0AllFold, w0Fold } = WidthObj[key];
                    const fold = type == "fold" ? w0Fold : w0AllFold;
                    layout.forEach(o => {
                        if (o.i === 'chartHeader' || o.i === 'charts' || this.layoutMode === 'standard_trade' && o.i === 'trading') {
                            o.w = o.w + (w - fold)
                        }
                    }
                    );
                    layout[marketListIndex].w = fold;
                    layout[marketListIndex].x = x + (x - fold);
                    layout[key] = layout
                }
                this.layoutOption = currentLayout
            } else {
                for (let key in currentLayout) {
                    const layout = currentLayout[key];
                    const marketListIndex = layout.findIndex(o => o.i === 'marketList');
                    const { w, x } = layout[marketListIndex];
                    const { w0AllFold, w0Fold, w0: w01, w0Open } = WidthObj[key];
                    const fold = type == "fold" ? w0Fold : w0AllFold;
                    const currentW = w0Open ? w0Open : w01;
                    layout.forEach(o => {
                        if (o.i === 'chartHeader' || o.i === 'charts' || this.layoutMode === 'standard_trade' && o.i === 'trading') {
                            o.w = o.w - (currentW - fold)
                        }
                    }
                    );
                    layout[marketListIndex].w = currentW;
                    layout[marketListIndex].x = x + (x - fold);
                    layout[key] = layout
                }
                this.layoutOption = currentLayout
            }
        } else {
            if (foldMode) {
                for (let key in currentLayout) {
                    const layout = currentLayout[key];
                    const marketListIndex = layout.findIndex(o => o.i === 'marketList');
                    const { w } = layout[marketListIndex];
                    const { w0AllFold, w0Fold } = WidthObj[key];
                    const fold = type == "fold" ? w0Fold : w0AllFold;
                    layout.forEach(o => {
                        if (o.i === 'chartHeader' || o.i === 'charts' || this.layoutMode === 'standard_trade' && o.i === 'trading') {
                            o.x = fold;
                            o.w = o.w + (w - fold)
                        }
                    }
                    );
                    layout[marketListIndex].w = fold;
                    layout[marketListIndex].x = 0;
                    layout[key] = layout
                }
                this.layoutOption = currentLayout
            } else {
                for (let key in currentLayout) {
                    const layout = currentLayout[key];
                    const marketListIndex = layout.findIndex(o => o.i === 'marketList');
                    const { w0AllFold, w0Fold, w0: w01, w00, w0Open } = WidthObj[key];
                    const fold = type == "fold" ? w0Fold : w0AllFold;
                    const currentW = this.layoutMode === 'standard_trade' ? w00 : w0Open ? w0Open : w01;
                    layout.forEach(o => {
                        if (layout[marketListIndex].w != currentW) {
                            if (o.i === 'chartHeader' || o.i === 'charts' || this.layoutMode === 'standard_trade' && o.i === 'trading') {
                                o.x = currentW;
                                o.w = o.w - (currentW - fold)
                            }
                        }
                    }
                    );
                    layout[marketListIndex].w = currentW;
                    layout[marketListIndex].x = 0;
                    layout[key] = layout
                }
                this.layoutOption = currentLayout
            }
        }
    }
    @action
    changeAssetsLayout = (height = 52, simpleHight = 0) => { }
    @action
    resetToDefaultLayout = () => {
        let layoutOption = [];
        switch (this.layoutMode) {
            case LAYOUT_MODES.PRO_TRADE:
                this.showLayout = defaultShowLayout;
                layoutOption = defaultLayoutOption;
                this.marketFoldMode = false;
                this.marketAllFoldMode = this.containerWidth <= 1440 ? true : false;
                localStorage.setItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_all_fold_mode_ ${this.AllFoldModVersion}`, this.containerWidth <= 1440 ? '1' : '0');
                break;
            case LAYOUT_MODES.SIMPLE_TRADE:
                this.showLayout = defaultSimpleTradeShowLayout;
                layoutOption = defaultSimpleTradeLayoutOption;
                this.marketFoldMode = false;
                this.marketAllFoldMode = false;
                localStorage.setItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_all_fold_mode_ ${this.AllFoldModVersion}`, '0');
                break;
            default:
                break
        }
        this.layoutOption = layoutOption;
        localStorage.setItem('trade_button_setting', TRADE_BTN_SETTING.MERGE);
        localStorage.setItem(`custom_ ${this.layoutMode}_show_layout`, JSON.stringify(this.showLayout));
        localStorage.setItem(`${is_ar ? 'ar_' : ''}custom_ ${this.layoutMode}_all_layout_option_ ${this.layoutversion}`, JSON.stringify(this.layoutOption));
        localStorage.setItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_fold_mode`, '0');
        localStorage.removeItem('deep_list_layout_v1');
        PubSub.publish('TRADE_ORDERBOOK_LIST_RESET')
    }
    @action
    changeLayout = layout => {
        this.layoutOption = layout;
        localStorage.setItem(`${is_ar ? 'ar_' : ''}custom_ ${this.layoutMode}_all_layout_option_ ${this.layoutversion}`, JSON.stringify(layout))
    }
    @action
    changeLayoutMode = mode => {
        this.layoutMode = mode;
        this.marketFoldMode = localStorage.getItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_fold_mode`) === '1';
        this.marketAllFoldMode = localStorage.getItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_all_fold_mode_ ${this.AllFoldModVersion}`) === '1';
        localStorage.setItem(`trade_layout_mode`, mode);
        const layout = localStorage.getItem(`${is_ar ? 'ar_' : ''}custom_ ${mode}_all_layout_option_ ${this.layoutversion}`);
        if (layout) {
            this.layoutOption = JSON.parse(layout);
            const showLayout = localStorage.getItem(`custom_ ${mode}_show_layout`);
            this.showLayout = JSON.parse(showLayout)
        } else {
            if (mode === LAYOUT_MODES.SIMPLE_TRADE) {
                this.showLayout = defaultSimpleTradeShowLayout;
                this.layoutOption = defaultSimpleTradeLayoutOption
            } else {
                this.showLayout = defaultShowLayout;
                this.layoutOption = defaultLayoutOption
            }
            localStorage.setItem(`custom_ ${this.layoutMode}_show_layout`, JSON.stringify(this.showLayout));
            localStorage.setItem(`${is_ar ? 'ar_' : ''}custom_ ${this.layoutMode}_all_layout_option_ ${this.layoutversion}`, JSON.stringify(this.layoutOption))
        }
        this.initMarketAllFold();
        if (this.tradingType == 'strategybot') {
            this.switchStratebotLayout('strategybot')
        } else {
            this.switchStratebotLayout('trade')
        }
    }
    @action
    setKlineShowOrderLine = () => {
        this.klineShowOrderLine = !this.klineShowOrderLine;
        if (this.klineShowOrderLine) {
            localStorage.setItem('klineShowOrderLine', true)
        } else {
            PubSub.publish('TRADE_EVENT_ORDER_LINE', {
                orderList: []
            });
            localStorage.setItem('klineShowOrderLine', false)
        }
    }
    @action
    setIsFullScreen = isFullScreen => {
        this.isFullScreen = isFullScreen
    }
    @observable
    loopAccountSpot = true
    @observable
    getMarketAvailableIsLoading = false
    @action
    getMarketAvailable = (current_symbol = this.currSymbol) => {
        if (!this.loopAccountSpot || this.getMarketAvailableIsLoading)
            return;
        this.availableLoopFetch && clearTimeout(this.availableLoopFetch);
        if (!GLOBAL_PRO_TRADE.is_login)
            return false;
        const { unified_account_status, is_isolated_margin } = this;
        const curr_a = current_symbol.split('_')[0];
        const curr_b = current_symbol.split('_')[1];
        this.getMarketAvailableIsLoading = true;
        if (this.is_in_copy) {
            return proTradeApi.transfer_available({
                market: current_symbol
            }).then(res => {
                if (res.code === 0) {
                    if (res.data.sub_spot.length != 0) {
                        var ref28, ref29;
                        const symbol = current_symbol.toLowerCase();
                        var ref30;
                        const symbolAva = (ref30 = (ref28 = res.data.sub_spot.find(i => i.currency.toLowerCase() == symbol.split('_')[0])) === null || ref28 === void 0 ? void 0 : ref28.available) !== null && ref30 !== void 0 ? ref30 : 0;
                        var ref31;
                        const usdtAva = (ref31 = (ref29 = res.data.sub_spot.find(i => i.currency.toLowerCase() == 'usdt')) === null || ref29 === void 0 ? void 0 : ref29.available) !== null && ref31 !== void 0 ? ref31 : 0;
                        this.balances_mulcharts = {
                            [current_symbol.toLowerCase()]: [symbolAva, usdtAva],
                            ...this.balances_mulcharts
                        };
                        return {
                            list: [symbolAva, usdtAva],
                            type: 'spot_copy'
                        }
                    } else {
                        this.balances_mulcharts = {
                            [current_symbol.toLowerCase()]: [0, 0],
                            ...this.balances_mulcharts
                        };
                        return {
                            list: [0, 0],
                            type: 'spot_copy'
                        }
                    }
                }
            }
            ).catch(err => {
                console.error(err, 'fetch copy account error')
            }
            ).finally(() => {
                this.availableLoopFetch = setTimeout(() => this.getMarketAvailable(), 3e3);
                this.getMarketAvailableIsLoading = false
            }
            )
        } else if (unified_account_status.is_portfolio_margin_account) {
            return proTradeApi.getCrossMarginAvailable(current_symbol).then(res => {
                if (res.code === 0) {
                    var ref32, ref33, ref34, ref35;
                    this.cross_margin_balances = res.data;
                    const curr_a_available = ((ref32 = res.data.assets[curr_a.toUpperCase()]) === null || ref32 === void 0 ? void 0 : ref32.available) || 0;
                    const curr_b_available = ((ref33 = res.data.assets[curr_b.toUpperCase()]) === null || ref33 === void 0 ? void 0 : ref33.available) || 0;
                    const curr_a_borrow = ((ref34 = res.data.assets[curr_a.toUpperCase()]) === null || ref34 === void 0 ? void 0 : ref34.borrow_able) || 0;
                    const curr_b_borrow = ((ref35 = res.data.assets[curr_b.toUpperCase()]) === null || ref35 === void 0 ? void 0 : ref35.borrow_able) || 0;
                    this.balances_mulcharts = {
                        [current_symbol.toLowerCase()]: [curr_a_available, curr_b_available],
                        ...this.balances_mulcharts
                    };
                    this.maxLoanableNum = [curr_b_borrow, curr_a_borrow];
                    return {
                        list: [curr_a_available, curr_b_available],
                        maxLoanableNum: [curr_b_borrow, curr_a_borrow],
                        type: TRADE_MODE.CROSS_MARGIN
                    }
                }
            }
            ).catch(err => {
                console.error(err, 'fetch cross_margin account error')
            }
            ).finally(() => {
                this.availableLoopFetch = setTimeout(() => this.getMarketAvailable(), 3e3);
                this.getMarketAvailableIsLoading = false
            }
            )
        } else if (is_isolated_margin) {
            return proTradeApi.getIsolatedAvailable({
                market: current_symbol
            }).then(res => {
                if (res.code === 0) {
                    var ref36, ref37;
                    this.margin_balances = res.data;
                    const money_available = ((ref36 = res.data.money) === null || ref36 === void 0 ? void 0 : ref36.available) || 0;
                    const stock_available = ((ref37 = res.data.stock) === null || ref37 === void 0 ? void 0 : ref37.available) || 0;
                    this.balances_mulcharts ={
                        [current_symbol.toLowerCase()]: [stock_available, money_available],
                        ...this.balances_mulcharts
                    }
                    return {
                        margin_balances: res.data,
                        type: TRADE_MODE.MARGIN
                    }
                }
            }
            ).catch(err => {
                console.error(err, 'fetch isolated account error')
            }
            ).finally(() => {
                this.availableLoopFetch = setTimeout(() => this.getMarketAvailable(), 3e3);
                this.getMarketAvailableIsLoading = false
            }
            )
        } else {
            return proTradeApi.getSpotAvailable({
                market: current_symbol
            }).then(res => {
                if (res.code === 0) {
                    var ref38, ref39;
                    const list = [(ref38 = res.data[curr_a]) === null || ref38 === void 0 ? void 0 : ref38.available, (ref39 = res.data[curr_b]) === null || ref39 === void 0 ? void 0 : ref39.available];
                    this.balances_mulcharts = {
                        [current_symbol.toLowerCase()]: list,
                        ...this.balances_mulcharts
                    }
                    return {
                        list: list,
                        type: TRADE_MODE.SPOT
                    }
                }
            }
            ).catch(err => {
                console.error(err, 'fetch spot account error')
            }
            ).finally(() => {
                if (!this.wsIsConnecting) {
                    this.availableLoopFetch = setTimeout(() => this.getMarketAvailable(), 3e3)
                }
                this.getMarketAvailableIsLoading = false
            }
            )
        }
    }
    @action
    setAccountLoop = flag => {
        this.loopAccountSpot = flag
    }
    @action
    updateBalanceByWsData = (currency, available) => {
        if (this.is_in_copy) {
            return
        }
        const oldBalance = this.balances_mulcharts[this.currSymbol.toLowerCase()] || [0, 0];
        const newBalance = currency.toUpperCase() === this.curr_b.toUpperCase() ? [oldBalance[0], available] : [available, oldBalance[1]];
        this.balances_mulcharts =  {
            [this.currSymbol.toLowerCase()]: newBalance,
            ...this.balances_mulcharts
        }
    }
    @action
    fetchSpotGrid = async params => {
        const currMarketOnly = $.cookie('curr_market_only');
        params['market'] = !currMarketOnly || currMarketOnly && currMarketOnly == '0' ? '' : this.currSymbol;
        let str = '';
        Object.keys(params).forEach(item => {
            str += `&${item}=${params[item]}`
        }
        );
        str = '?' + str.substring(1, str.length);
        proTradeApi.spotGrid(str).then(res => {
            if (res.code === 200) {
                if (params.status && params.status === 'pending')
                    this.spot_grid_list =  {
                        pendingData: [],...this.spot_grid_list
                    };
                this.spot_grid_list.pendingData = res.data || [];
                this.spot_grid_list.pendingPage = res.totalcount || 1;
                if (params.status && params.status === 'finished') {
                    this.spot_grid_list = {
                        historyData: [],
                        ...this.spot_grid_list
                    };
                    this.spot_grid_list.historyData = res.data || [];
                    this.spot_grid_list.historyPage = res.totalcount || 1
                }
                if (this.tabIndex === TRADE_TABLE_TYPE.PENDING_ORDER) {
                    this.currentOrderNumber['spot_grid'] = res.totalcount
                }
            }
        }
        )
    }
    @action
    updateCurrentOrder = data => {
        this.order = data
    }
    @action
    updateTabIndex = data => {
        this.tabIndex = data
    }
    @action
    fetchDelegateData = (params, updateOrderTotal = false, init = false) => {
        const { currSymbol, unified_account_status, is_isolated_margin } = this;
        if (!GLOBAL_PRO_TRADE.is_login)
            return false;
        let new_params = {...params};
        new_params['engine_type'] = 'normal';
        new_params['symbol'] = currSymbol;
        new_params['limit'] = 50;
        if (is_isolated_margin) {
            new_params['engine_type'] = 'margin';
            new_params['margin_type'] = 'isolated_margin'
        }
        if (unified_account_status.is_portfolio_margin_account) {
            new_params['engine_type'] = 'cross_margin';
            new_params['margin_type'] = 'cross_margin'
        }
        if (params.type == 0) {
            const currMarketOnly = $.cookie('curr_market_only');
            new_params['all_orders'] = !currMarketOnly || currMarketOnly && currMarketOnly == '0' ? 1 : 0;
            delete new_params.type;
            proTradeApi.getNormalOrderList({...new_params}).then(res => {
                if (res && res.result) {
                    const list = res.order || [];
                    this.currentOrderNumber[orderTypeMap[params.type]] = list.length;
                    if (updateOrderTotal)
                        return;
                    this.order = [...list];
                    const markets = this.order.map(el => el.market.replace('/', '_'));
                    const symbols = Object.keys(GLOBAL_PRO_TRADE.precision);
                    const noSymbolInfoArr = markets.reduce((a, c) => {
                        if (!symbols.includes(c) && !a.includes(c)) {
                            a.push(c)
                        }
                        return a
                    }
                        , []);
                    if (noSymbolInfoArr.length > 0 && !init) {
                        try {
                            Promise.all(noSymbolInfoArr.map(el => this.getMarketConfig(el)))
                        } catch (e) {
                            console.log('Get symbol info error', e)
                        }
                    }
                }
            }
            )
        } else {
            new_params['auto_type'] = auto_order_type[params.type];
            new_params['status'] = 1;
            const currMarketOnly = $.cookie('curr_market_only');
            new_params['symbol'] = !currMarketOnly || currMarketOnly && currMarketOnly == '0' ? null : currSymbol;
            delete new_params.type;
            proTradeApi.getAutoOrderList({...new_params}).then(res => {
                if (res && res.result) {
                    const list = res.order || [];
                    this.currentOrderNumber[orderTypeMap[params.type]] = list.length;
                    if (updateOrderTotal)
                        return;
                    this.order = [...list]
                }
            }
            )
        }
    }
    @action
    fetchOrderHistory = params => {
        if (!GLOBAL_PRO_TRADE.is_login)
            return false;
        this.my_trade_list_table =  {
            data: [],
            ...this.my_trade_list_table
        };
        if (params.type === 0 || params.type === 6) {
            let paramsStr = this.assemblyParams(params, this.tabIndex);
            proTradeApi.getDelegateList(paramsStr).then(res => {
                if (res) {
                    this.my_trade_list_table = {
                        data: res.data || [],
                        page: params.page || 1
                    }
                }
            }
            )
        } else {
            const { currSymbol, unified_account_status, is_isolated_margin } = this;
            let new_params = {...params};
            let currMarketOnly = $.cookie('curr_market_only');
            new_params['all_orders'] = !currMarketOnly || currMarketOnly && currMarketOnly == '0' ? 1 : 0;
            new_params['symbol'] = !currMarketOnly || currMarketOnly && currMarketOnly == '0' ? null : this.currSymbol;
            new_params['engine_type'] = 'normal';
            new_params['status'] = 2;
            if (is_isolated_margin) {
                new_params['engine_type'] = 'margin';
                new_params['margin_type'] = 'margin'
            }
            if (unified_account_status.is_portfolio_margin_account) {
                new_params['engine_type'] = 'cross_margin';
                new_params['margin_type'] = 'cross_margin'
            }
            new_params['auto_type'] = auto_order_type[params.type];
            delete new_params.type;
            proTradeApi.getAutoOrderList({...new_params}).then(res => {
                if (res.result) {
                    this.my_trade_list_table = {
                        data: res.order || [],
                        page: params.page || 1
                    }
                }
            }
            )
        }
    }
    @action
    fetchHistoryDeal = params => {
        if (!GLOBAL_PRO_TRADE.is_login) {
            return false
        }
        this.my_history_trades = {
            data: [],
            ...this.my_history_trades
        };
        let paramsStr = this.assemblyParams(params, this.tabIndex);
        proTradeApi.getDelegateList(paramsStr).then(res => {
            if (res) {
                this.my_history_trades = {
                    data: res.data || [],
                    page: params.page || 1
                }
            }
        }
        )
    }
    @action
    fetchLoanManagement = (params, activeType = 0, loanDetailsSelection = '1') => {
        const { unified_account_status, is_isolated_margin, my_loan_management } = this;
        if (!GLOBAL_PRO_TRADE.is_login)
            return false;
        if (unified_account_status.is_portfolio_margin_account || is_isolated_margin) {
            this.my_loan_management = {
                activeTypeBtn: activeType,
                loanDetailsSelection,
                isLoading: true,
                data: [],
                ...my_loan_management
            }
        } else {
            return false
        }
        const paramsStr = this.LoanManageAssemblyParams(params);
        const request = activeType === 0 ? proTradeApi.getLoanManagementList : proTradeApi.getLoanDetailsList;
        request(paramsStr).then(res => {
            if (!res || this.my_loan_management.activeTypeBtn !== activeType)
                return false;
            const { list, total, count } = (res === null || res === void 0 ? void 0 : res.data) || {};
            this.my_loan_management =  {
                data: list || [],
                total: total || count || 0,
                page: (params === null || params === void 0 ? void 0 : params.page) || 1,
                ...this.my_loan_management
            }
        }
        ).catch(err => {
            console.warn(err)
        }
        ).finally(() => {
            this.my_loan_management = {
                isLoading: false,
                ...this.my_loan_management
            }
        }
        );
        const { page = 1 } = params || {};
        const nextPageParams = {
            page: page + 1,
            ...params
        };
        const nextPageParamsStr = this.LoanManageAssemblyParams(nextPageParams);
        const nextPageRequest = activeType === 0 ? proTradeApi.getLoanManagementList : proTradeApi.getLoanDetailsList;
        nextPageRequest(nextPageParamsStr).then(res => {
            if (!res || this.my_loan_management.activeTypeBtn !== activeType)
                return false;
            const { list = [] } = (res === null || res === void 0 ? void 0 : res.data) || {};
            if (list.length > 0) {
                this.my_loan_management =  {
                    showNextPage: true,
                    ...this.my_loan_management
                }
            } else {
                this.my_loan_management = {
                    showNextPage: false,
                    ...this.my_loan_management
                }
            }
        }
        )
    }
    @action
    updateCurrentOrderNumberMinus1 = type => {
        if (this.currentOrderNumber[orderTypeMap[type]]) {
            this.currentOrderNumber[orderTypeMap[type]] -= 1
        }
    }
    @action
    setTrustPrice = (market, rate) => {
        var ref40;
        const value = ((ref40 = this.multiPriceArr[market]) === null || ref40 === void 0 ? void 0 : ref40.priceStr) || rate;
        if (value) {
            PubSub.publish('EVENT_TRUST_PRICE', {
                value
            });
            this.last_price = value
        }
    }
    @action
    setTradeType = tradeType => {
        this.tradeType = tradeType;
        this.setTrustPrice(this.currSymbol)
    }

    @action
    changeMarketListMode = () => {
        this.marketSimpleMode = !this.marketSimpleMode;
        if (window.collectEvent) {
            window.collectEvent('beconEvent', 'trade_streamlin_click', {
                button_name: this.marketSimpleMode ? 'open' : 'close'
            })
        }
        localStorage.setItem('show_simple_mode', Number(this.marketSimpleMode) + '')
    }
    @action
    changeMarketFoldMode = () => {
        this.marketFoldMode = !this.marketFoldMode;
        if (!this.marketFoldMode) {
            const show = localStorage.getItem('show_simple_mode');
            this.marketSimpleMode = show && show * 1
        } else {
            this.marketSimpleMode = false
        }
        localStorage.setItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_fold_mode`, Number(this.marketFoldMode) + '');
        const { w2 } = initLayoutW;
        this.setFoldMarketListLayout(this.marketFoldMode, 'fold')
    }
    @action
    changeMarketAllFoldMode = () => {
        this.marketAllFoldMode = !this.marketAllFoldMode;
        localStorage.setItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_all_fold_mode_ ${this.AllFoldModVersion}`, Number(this.marketAllFoldMode) + '');
        this.setFoldMarketListLayout(this.marketAllFoldMode, 'allFold');
        PubSub.publish('CHARTS_MODE_RESIZE');
        if (window.collectEvent) {
            window.collectEvent('beconEvent', 'trade_future_list_market_click', {
                button_name: this.marketAllFoldMode ? '2-open' : 'close-full'
            })
        }
    }
    @action
    setUnifiedAccountStatus = data => {
        this.unified_account_status = data
    }
    @action
    switchToClassicAccount = data => {
        this.unified_account_status = {
            is_open_portfolio_margin: 0,
            is_portfolio_margin_account: 0,
            ...this.unified_account_status
        }
    }
    @action
    updateClassicAccountSpotSetting = key => {
        this.classic_account_spot_setting[key] = !this.classic_account_spot_setting[key];
        localStorage.setItem('classic_account_spot_setting', JSON.stringify(this.classic_account_spot_setting))
    }
    @action
    setShouldReCompute = shouldReCompute => {
        this.shouldReCompute = shouldReCompute
    }
    @action
    setStrategyChartResize = () => {
        this.strategyChartResize++
    }
    @action
    updatePollingData = (t, page = 1) => {
        const type = t || localStorage.getItem('openOrder_type_select') * 1 || 0;
        if (type === ORDER_TYPE.GRID) {
            const param = {
                strategy_type: 'spot_grid',
                status: 'running',
                page: page,
                limit: 20
            };
            this.fetchSpotGrid(param);
            return
        }
        let params = {
            type: type,
            int: 1
        };
        this.fetchDelegateData(params)
    }
    @action
    updateCurrOrderListType = val => {
        this.currOrderListType = val
    }
    @action
    updateCurrHistoryOrderListType = val => {
        this.currHistoryOrderListType = val
    }
    @action
    updateWsConnectStatus = isConnecting => {
        this.wsIsConnecting = isConnecting;
        if (!isConnecting) {
            this.getMarketAvailable()
        }
    }
    @action
    updateSearchedMarkets = val => {
        this.searchedMarkets = val
    }
    @action
    updateSearchText = val => {
        this.searchText = val || ''
    }
    @action
    clearSearchResult = () => {
        this.searchText = '';
        this.searchedMarkets = {
            spot: [],
            future: [],
            loan: []
        }
    }
    @action
    async getAllMarketList() {
        let leftbar_data = await getDataFromIndexedDB('all_market', 60);
        if (leftbar_data) {
            this.allMarketList = {...leftbar_data}
        }
        this.getMarketListByCategory(this.menuSubType.toUpperCase());
        if (this.hasLoanMenu) {
            this.fetchLoanList()
        }
        this.fetchOtherMarkets()
    }

    @computed
    get getMarketName() {
        const config = this.marketsConfig[this.currSymbol];
        const coin_name = is_cn ? config === null || config === void 0 ? void 0 : config.name_cn : config === null || config === void 0 ? void 0 : config.name;
        return coin_name || ''
    }
    @computed
    get marketTradeTypeCurrent() {
        const { is_isolated_margin, unified_account_status } = this;
        let type = TRADE_MODE.SPOT;
        if (is_isolated_margin)
            type = TRADE_MODE.MARGIN;
        if (unified_account_status.is_portfolio_margin_account)
            type = TRADE_MODE.CROSS_MARGIN;
        return type
    }
    @computed
    get curMarketList() {
        if (this.unified_account_status.is_portfolio_margin_account == 1) {
            const unifiedAccountMarketList = Object.keys(this.allMarketList).reduce((acc, cur) => {
                if (!this.allMarketList[cur] || Object.prototype.toString.call(this.allMarketList[cur]) !== '[object Object]') {
                    return acc
                }
                const markets = Object.keys(this.allMarketList[cur]).reduce((a, c) => {
                    const item = this.allMarketList[cur][c];
                    if (!item || Object.prototype.toString.call(item) !== '[object Object]') {
                        return a
                    }
                    if (item.enable_credit) {
                        a[c] = item
                    }
                    return a
                }
                    , {});
                if (markets && Object.keys(markets).length > 0) {
                    acc[cur] = markets
                }
                return acc
            }
                , {});
            return unifiedAccountMarketList
        } else {
            return this.allMarketList
        }
    }
    @computed
    get is_unified_account_disabled_coin() {
        const config = this.marketsConfig[this.currSymbol];
        return !!this.unified_account_status.is_portfolio_margin_account && (config === null || config === void 0 ? void 0 : config.is_cross_margin_market) == 1 && (config === null || config === void 0 ? void 0 : config.cross_margin_asset_status) == 0
    }
    @computed
    get userUseAble() {
        const { precision_vol, precision_total } = getPrecisionConfig(this.currSymbol);
        const [currAable, currBable] = this.balances_mulcharts[this.currSymbol.toLowerCase()] || [0, 0];
        let buyUseAble = currBable;
        let sellUseAble = currAable;
        if (this.marketTradeTypeCurrent === TRADE_MODE.CROSS_MARGIN && this.unified_account_status.is_open_portfolio_margin == 1) {
            const [currBMaxLoanableNum, currAMaxLoanableNum] = this.maxLoanableNum;
            buyUseAble = Big(buyUseAble || 0).plus(currBMaxLoanableNum || 0);
            sellUseAble = Big(sellUseAble || 0).plus(currAMaxLoanableNum || 0)
        }
        if (this.marketTradeTypeCurrent === TRADE_MODE.MARGIN) {
            var ref15, ref16;
            buyUseAble = ((ref15 = this.margin_balances.money) === null || ref15 === void 0 ? void 0 : ref15.available) || 0;
            sellUseAble = ((ref16 = this.margin_balances.stock) === null || ref16 === void 0 ? void 0 : ref16.available) || 0;
            if (this.spot_margin_auto_borrow_setting) {
                var ref17, ref18;
                const margin_borrow_buy = ((ref17 = this.margin_balances.money) === null || ref17 === void 0 ? void 0 : ref17.borrow) || 0;
                const margin_borrow_sell = ((ref18 = this.margin_balances.stock) === null || ref18 === void 0 ? void 0 : ref18.borrow) || 0;
                buyUseAble = Big(buyUseAble).plus(margin_borrow_buy);
                sellUseAble = Big(sellUseAble).plus(margin_borrow_sell)
            }
        }
        return {
            buy: tradeTools.dealNumPrecision(buyUseAble, precision_total),
            sell: tradeTools.dealNumPrecision(sellUseAble, precision_vol)
        }
    }
    @computed
    get hasLoanMenu() {
        const has = this.marketMenu.find(item => item.market === MENU_MARKET.LOAN);
        return !!has
    }

    @action
    initOrderListNumber = (orderType = undefined) => {
        if (!GLOBAL_PRO_TRADE.is_login) {
            return false
        }
        let params = [{
            type: ORDER_TYPE.LIMIT,
            int: 1
        }, {
            type: ORDER_TYPE.SLTP,
            int: 1
        }, {
            type: ORDER_TYPE.TIME,
            int: 1
        }, {
            type: ORDER_TYPE.LOOP,
            int: 1
        }, {
            type: ORDER_TYPE.TRAIL,
            int: 1
        },];
        if (orderType !== undefined) {
            params = params.filter(item => item.type === orderType)
        }
        params.forEach(param => {
            this.fetchDelegateData(param, true)
        }
        );
        if (orderType === undefined || orderType === ORDER_TYPE.GRID) {
            const param = {
                strategy_type: 'spot_grid',
                status: 'running',
                page: 1,
                limit: 20
            };
            this.fetchSpotGrid(param)
        }
        PubSub.publish('ORDER_LIST_REFRESH')
    }

    initMarketAllFold() {
        const allFoldMod = localStorage.getItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_all_fold_mode_ ${this.AllFoldModVersion}`);
        if (this.layoutMode == 'default_trade') {
            if (allFoldMod == null) {
                if (this.containerWidth <= 1440) {
                    this.marketAllFoldMode = true
                } else {
                    this.marketAllFoldMode = false
                }
            } else {
                this.marketAllFoldMode = allFoldMod === '1'
            }
        } else {
            this.marketAllFoldMode = allFoldMod === '1'
        }
    }

    deleteLocalStorage() {
        try {
            localStorage.removeItem('coin_name_list');
            localStorage.removeItem('coin_name_list_v1')
        } catch (error) {
            console.log(error, 'localStorage del error')
        }
    }

    initData() {
        const multiMarkets = localStorage.getItem('pro-trade-multiple-charts');
        const activeChartIndex = localStorage.getItem('pro-trade-active-index') || 0;
        this.mChartActive = Number(activeChartIndex);
        this.initOrderListNumber();
        if (multiMarkets) {
            try {
                if (Object.prototype.toString.call(JSON.parse(multiMarkets)) === '[object Array]') {
                    let tabMarkets = JSON.parse(multiMarkets);
                    const index = tabMarkets.indexOf(GLOBAL_PRO_TRADE.currSymbol.toUpperCase());
                    if (index !== -1) {
                        this.tabMarkets = tabMarkets;
                        this.setActiveChartIndex(index)
                    } else {
                        tabMarkets[this.mChartActive] = GLOBAL_PRO_TRADE.currSymbol;
                        this.tabMarkets = tabMarkets
                    }
                } else {
                    this.tabMarkets = [GLOBAL_PRO_TRADE.currSymbol, defaultMultiMarkets[1], defaultMultiMarkets[2], defaultMultiMarkets[3],]
                }
            } catch (error) {
                this.tabMarkets = [GLOBAL_PRO_TRADE.currSymbol, defaultMultiMarkets[1], defaultMultiMarkets[2], defaultMultiMarkets[3],]
            }
        } else {
            const index = defaultMultiMarkets.indexOf(GLOBAL_PRO_TRADE.currSymbol.toUpperCase());
            if (index !== -1) {
                this.tabMarkets = defaultMultiMarkets;
                this.setActiveChartIndex(index)
            } else {
                this.tabMarkets = [GLOBAL_PRO_TRADE.currSymbol, defaultMultiMarkets[1], defaultMultiMarkets[2], defaultMultiMarkets[3],]
            }
            localStorage.setItem('pro-trade-multiple-charts', JSON.stringify(this.tabMarkets))
        }
        this.mChartMode = !new_coin_start && localStorage.getItem('pro-chartShowMode') == 1;
        PubSub.subscribe('TRADE_EVENT_trades.update', this.updateTradesPrice);
        PubSub.subscribe('TRADE_EVENT_ticker.update', this.updateTickerPrice);
        PubSub.subscribe('TRADE_EVENT_depth.update', this.updateDepthData);
        const customProTradeShowLayout = localStorage.getItem(`custom_ ${this.layoutMode}_show_layout`);
        const customLayoutOption = localStorage.getItem(`${is_ar ? 'ar_' : ''}custom_ ${this.layoutMode}_all_layout_option_ ${this.layoutversion}`);
        let showLayout = defaultShowLayout;
        switch (this.layoutMode) {
            case LAYOUT_MODES.PRO_TRADE:
                showLayout = defaultShowLayout;
                break;
            case LAYOUT_MODES.SIMPLE_TRADE:
                showLayout = defaultSimpleTradeShowLayout;
                break;
            default:
                break
        }
        if (customProTradeShowLayout) {
            this.showLayout = { ...showLayout, ...JSON.parse(customProTradeShowLayout) };
        }
        if (customLayoutOption) {
            this.layoutOption = JSON.parse(customLayoutOption)
        }
        this.getMarketConfig(GLOBAL_PRO_TRADE.currSymbol);
        localStorage.setItem(`custom_ ${this.layoutMode}_show_layout`, JSON.stringify(this.showLayout));
        if (getQueryVariable('tradModel') == 'strategybot') {
            this.showLayout['assets'] = false
        }
        localStorage.setItem(`${is_ar ? 'ar_' : ''}custom_ ${this.layoutMode}_all_layout_option_ ${this.layoutversion}`, JSON.stringify(this.layoutOption));
        this.UpdateInfoCoins();
        this.initMarketAllFold();
        this.getUserMigrateStatus();
        this.getMarketAvailable();
        this.updateMarginRate();
        this.deleteLocalStorage();
        if (getQueryVariable('tradModel') == 'strategybot' && show_strategy_bots_tab) {
            this.tabIndex = TRADE_TABLE_TYPE.STRATEGY_BOTS
        } else if (localStorage.getItem('order-panel-tab') == TRADE_TABLE_TYPE.STRATEGY_BOTS) {
            if (show_strategy_bots_tab) {
                this.tabIndex = TRADE_TABLE_TYPE.STRATEGY_BOTS
            } else {
                this.tabIndex = TRADE_TABLE_TYPE.PENDING_ORDER
            }
        } else {
            this.tabIndex = localStorage.getItem('order-panel-tab') || TRADE_TABLE_TYPE.PENDING_ORDER
        }
    }
}

const useStore = () => {
    return new GlobalStore()
}
export {
    useStore
}

