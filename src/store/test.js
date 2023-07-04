let GlobalStore = ((_class = class GlobalStore1 {
    async getAllMarketList() {
        let leftbar_data = await getDataFromIndexedDB('all_market', 60);
        if (leftbar_data) {
            this.allMarketList = _objectSpread({}, leftbar_data)
        }
        this.getMarketListByCategory(this.menuSubType.toUpperCase());
        if (this.hasLoanMenu) {
            this.fetchLoanList()
        }
        this.fetchOtherMarkets()
    }
    get getMarketName() {
        const config = this.marketsConfig[this.currSymbol];
        const coin_name = is_cn ? config === null || config === void 0 ? void 0 : config.name_cn : config === null || config === void 0 ? void 0 : config.name;
        return coin_name || ''
    }
    get marketTradeTypeCurrent() {
        const {is_isolated_margin, unified_account_status} = this;
        let type = TRADE_MODE.SPOT;
        if (is_isolated_margin)
            type = TRADE_MODE.MARGIN;
        if (unified_account_status.is_portfolio_margin_account)
            type = TRADE_MODE.CROSS_MARGIN;
        return type
    }
    get curMarketList() {
        if (this.unified_account_status.is_portfolio_margin_account == 1) {
            const unifiedAccountMarketList = Object.keys(this.allMarketList).reduce((acc,cur)=>{
                if (!this.allMarketList[cur] || Object.prototype.toString.call(this.allMarketList[cur]) !== '[object Object]') {
                    return acc
                }
                const markets = Object.keys(this.allMarketList[cur]).reduce((a,c)=>{
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
    get is_unified_account_disabled_coin() {
        const config = this.marketsConfig[this.currSymbol];
        return !!this.unified_account_status.is_portfolio_margin_account && (config === null || config === void 0 ? void 0 : config.is_cross_margin_market) == 1 && (config === null || config === void 0 ? void 0 : config.cross_margin_asset_status) == 0
    }
    get userUseAble() {
        const {precision_vol, precision_total} = getPrecisionConfig(this.currSymbol);
        const [currAable,currBable] = this.balances_mulcharts[this.currSymbol.toLowerCase()] || [0, 0];
        let buyUseAble = currBable;
        let sellUseAble = currAable;
        if (this.marketTradeTypeCurrent === TRADE_MODE.CROSS_MARGIN && this.unified_account_status.is_open_portfolio_margin == 1) {
            const [currBMaxLoanableNum,currAMaxLoanableNum] = this.maxLoanableNum;
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
    get hasLoanMenu() {
        const has = this.marketMenu.find(item=>item.market === MENU_MARKET.LOAN);
        return !!has
    }
    constructor() {
        _defineProperty(this, "initData", ()=>{
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
                        this.tabMarkets = [GLOBAL_PRO_TRADE.currSymbol, defaultMultiMarkets[1], defaultMultiMarkets[2], defaultMultiMarkets[3], ]
                    }
                } catch (error) {
                    this.tabMarkets = [GLOBAL_PRO_TRADE.currSymbol, defaultMultiMarkets[1], defaultMultiMarkets[2], defaultMultiMarkets[3], ]
                }
            } else {
                const index = defaultMultiMarkets.indexOf(GLOBAL_PRO_TRADE.currSymbol.toUpperCase());
                if (index !== -1) {
                    this.tabMarkets = defaultMultiMarkets;
                    this.setActiveChartIndex(index)
                } else {
                    this.tabMarkets = [GLOBAL_PRO_TRADE.currSymbol, defaultMultiMarkets[1], defaultMultiMarkets[2], defaultMultiMarkets[3], ]
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
                this.showLayout = _objectSpread({}, showLayout, JSON.parse(customProTradeShowLayout))
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
        );
        _defineProperty(this, "deleteLocalStorage", ()=>{
            try {
                localStorage.removeItem('coin_name_list');
                localStorage.removeItem('coin_name_list_v1')
            } catch (error) {
                console.log(error, 'localStorage del error')
            }
        }
        );
        _defineProperty(this, "initMarketAllFold", ()=>{
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
        );
        _defineProperty(this, "updateTickerPrice", (key,arr)=>{
            this.PRO_TRADE_WS_TIME = new Date().getTime();
            if (arr[0]) {
                if (this.tabMarkets.indexOf(arr[0]) === -1) {
                    return false
                }
                let tickerObj = arr[1]
                  , tickerPrice = tickerObj['last']
                  , tickerMarket = arr[0].toLowerCase()
                  , tickerMarketbase = tickerMarket.split('_')[1]
                  , tickerChangePercent = tickerObj['change'] || 0
                  , pair = arr[0].toLowerCase()
                  , priceStrNumber = Number(tickerPrice).toFixed(getPrecisionConfig(arr[0]).precision_rate);
                let c = pair.split('_')
                  , price = Number(tickerPrice)
                  , curr_fiat = GLOBAL_PRO_TRADE.curr_fiat
                  , curr_a = c[0]
                  , curr_b = c[1]
                  , percent = Number(tickerChangePercent).toFixed(2)
                  , decimals_fiatRate = tradeTools.get_bid_or_ask_decimals(price, curr_b, true)
                  , currPriceToLocal = tradeTools.num_fix(price * decimals_fiatRate.fiat_rate, decimals_fiatRate.fiat_rate_decimals);
                if (this.marketType !== 'contract' && arr[0] === this.currSymbol) {
                    this.last_price = Number(arr[1]['last']);
                    tradeTools.setPageTitle(Number(arr[1]['last']), curr_a, curr_b)
                }
                if (pair == tickerMarket) {
                    let unitSymbol = decimals_fiatRate.unitSymbol
                      , coinbaseSymbol = GLOBAL_PRO_TRADE.fiat_rates[curr_fiat]['symbol']
                      , priceUp = percent >= 0;
                    let baseVolume = this.updateVolume(tickerObj.baseVolume);
                    let quoteVolume = this.updateVolume(tickerObj.quoteVolume);
                    this.multiPriceArr = _objectSpread({}, this.multiPriceArr, {
                        [arr[0]]: {
                            coinbaseSymbol: coinbaseSymbol,
                            currPriceToLocal: currPriceToLocal,
                            unitSymbol: unitSymbol,
                            percent: percent,
                            priceStr: priceStrNumber,
                            priceUp: priceUp,
                            high: tickerObj.high,
                            low: tickerObj.low,
                            baseVolume: baseVolume,
                            quoteVolume
                        }
                    })
                }
            }
        }
        );
        _defineProperty(this, "updateVolume", volume=>{
            let baseVolume = volume;
            if (is_cn) {
                if (baseVolume > 1e8)
                    baseVolume = (baseVolume / 1e8).toFixed(2) + '亿';
                else if (baseVolume > 1e4)
                    baseVolume = (baseVolume / 1e4).toFixed(2) + '万';
                else
                    baseVolume = (baseVolume * 1).toFixed(2)
            } else {
                if (baseVolume > 1e6)
                    baseVolume = (baseVolume / 1e6).toFixed(2) + 'M';
                else if (baseVolume > 1e3)
                    baseVolume = (baseVolume / 1e3).toFixed(2) + 'K'
            }
            return baseVolume
        }
        );
        _defineProperty(this, "updateTradesPrice", (key,arr)=>{
            this.PRO_TRADE_WS_TIME = new Date().getTime();
            if (arr[0]) {
                if (this.tabMarkets.indexOf(arr[0]) === -1) {
                    return false
                }
            }
            let tempList = arr[1];
            if (!tempList || tempList.length <= 0) {
                return false
            }
            var rows = arr[1];
            const row = rows[0];
            var rate = row['price']
              , rate = Number(rate).toFixed(getPrecisionConfig(arr[0]).precision_rate);
            if (!this.multiPriceArr[arr[0]] && arr[0].toUpperCase() === this.currSymbol.toUpperCase()) {
                this.setTrustPrice(this.currSymbol, row['price'])
            }
            this.multiPriceArr = _objectSpread({}, this.multiPriceArr, {
                [arr[0]]: _objectSpread({}, this.multiPriceArr[arr[0]], {
                    priceStr: rate
                })
            })
        }
        );
        _defineProperty(this, "updateDepthData", (key,arr)=>{
            this.PRO_TRADE_WS_TIME = new Date().getTime();
            const {currSymbol} = this;
            const {precision_rate} = getPrecisionConfig(currSymbol);
            let asks = arr[1]['asks'];
            let bids = arr[1]['bids'];
            if (arr[2] && arr[2] !== currSymbol) {
                this.askOnePrice = 0;
                this.bidOnePrice = 0;
                return false
            }
            if (asks && asks[0]) {
                this.askOnePrice = Number(asks[0][0]).toFixed(precision_rate)
            } else {
                this.askOnePrice = 0
            }
            if (bids && bids[0]) {
                this.bidOnePrice = Number(bids[0][0]).toFixed(precision_rate)
            } else {
                this.bidOnePrice = 0
            }
        }
        );
        _defineProperty(this, "availableLoopFetch", null);
        _defineProperty(this, "assemblyParams", (params,tabIndex)=>{
            const {currSymbol, unified_account_status, is_isolated_margin} = this;
            params['tempOrderType'] = params['type'];
            params['type'] = orderTypeMap[params.type];
            let currMarketOnly = $.cookie('curr_market_only');
            params['all_orders'] = !currMarketOnly || currMarketOnly && currMarketOnly == '0' ? 1 : 0;
            if (tabIndex == TRADE_TABLE_TYPE.ORDER_HISTORY) {
                params['type'] = 'history_order';
                params['page'] = (params['page'] && params['page']) > 1 ? params['page'] : 1;
                delete params.tempOrderType
            }
            if (tabIndex === TRADE_TABLE_TYPE.HISTORY_DEAL) {
                params['type'] = 'history_deal'
            }
            params['symbol'] = currSymbol.toLowerCase();
            params['u'] = 13;
            params['c'] = tradeTools.rand(0, 1e6);
            if (unified_account_status.is_portfolio_margin_account) {
                params['engine_type'] = 'cross_margin';
                params['is_margin'] = 1;
                params['margin_type'] = 'cross_margin'
            }
            if (is_isolated_margin && tabIndex === TRADE_TABLE_TYPE.ORDER_HISTORY) {
                params['type'] = 'margin_history_order';
                params['engine_type'] = 'margin'
            }
            if (is_isolated_margin && tabIndex === TRADE_TABLE_TYPE.HISTORY_DEAL) {
                params['type'] = 'margin_history_deal'
            }
            return tradeTools.joinParams(params)
        }
        );
        _defineProperty(this, "LoanManageAssemblyParams", (params={})=>{
            const {unified_account_status, is_isolated_margin} = this;
            const {activeTypeBtn, loanDetailsSelection} = this.my_loan_management;
            params['limit'] = 10;
            params['page'] = (params['page'] && params['page']) > 1 ? params['page'] : 1;
            if (activeTypeBtn === 1)
                params[is_isolated_margin ? 'type' : 'tab'] = loanDetailsSelection;
            if (is_isolated_margin) {
                params['business'] = 'margin'
            }
            return tradeTools.joinParams(params)
        }
        );
        _initializerDefineProperty(this, "strategyChartResize", _descriptor, this);
        _initializerDefineProperty(this, "PRO_TRADE_WS_TIME", _descriptor1, this);
        _initializerDefineProperty(this, "history", _descriptor2, this);
        _initializerDefineProperty(this, "balances_mulcharts", _descriptor3, this);
        _initializerDefineProperty(this, "margin_balances", _descriptor4, this);
        _initializerDefineProperty(this, "pendingNum", _descriptor5, this);
        _initializerDefineProperty(this, "coinInfo", _descriptor6, this);
        _initializerDefineProperty(this, "marketType", _descriptor7, this);
        _initializerDefineProperty(this, "tabMarketType", _descriptor8, this);
        _initializerDefineProperty(this, "tabMarketTypeBeforeSearch", _descriptor9, this);
        _initializerDefineProperty(this, "showLoanBorrowModal", _descriptor10, this);
        _initializerDefineProperty(this, "allMarketList", _descriptor11, this);
        _initializerDefineProperty(this, "marketMenu", _descriptor12, this);
        _initializerDefineProperty(this, "currSymbol", _descriptor13, this);
        _initializerDefineProperty(this, "curr_a", _descriptor14, this);
        _initializerDefineProperty(this, "curr_b", _descriptor15, this);
        _initializerDefineProperty(this, "netETF", _descriptor16, this);
        _initializerDefineProperty(this, "loadingAllMarketListData", _descriptor17, this);
        _initializerDefineProperty(this, "frequency_value", _descriptor18, this);
        _initializerDefineProperty(this, "last_price", _descriptor19, this);
        _initializerDefineProperty(this, "bidOnePrice", _descriptor20, this);
        _initializerDefineProperty(this, "askOnePrice", _descriptor21, this);
        _initializerDefineProperty(this, "depthAsks", _descriptor22, this);
        _initializerDefineProperty(this, "depthBids", _descriptor23, this);
        _initializerDefineProperty(this, "currTradePanelMode", _descriptor24, this);
        _initializerDefineProperty(this, "klineShowOrderLine", _descriptor25, this);
        _initializerDefineProperty(this, "mChartMode", _descriptor26, this);
        _initializerDefineProperty(this, "mChartActive", _descriptor27, this);
        _initializerDefineProperty(this, "tabMarkets", _descriptor28, this);
        _initializerDefineProperty(this, "multiPriceArr", _descriptor29, this);
        _initializerDefineProperty(this, "layoutMode", _descriptor30, this);
        _initializerDefineProperty(this, "showLayout", _descriptor31, this);
        _initializerDefineProperty(this, "layoutOption", _descriptor32, this);
        _initializerDefineProperty(this, "marketSimpleMode", _descriptor33, this);
        _initializerDefineProperty(this, "marketFoldMode", _descriptor34, this);
        _initializerDefineProperty(this, "AllFoldModVersion", _descriptor35, this);
        _initializerDefineProperty(this, "marketAllFoldMode", _descriptor36, this);
        _initializerDefineProperty(this, "isFullScreen", _descriptor37, this);
        _initializerDefineProperty(this, "showTradeEditPopup", _descriptor38, this);
        _initializerDefineProperty(this, "TradeEditPanelObj", _descriptor39, this);
        _initializerDefineProperty(this, "tabIndex", _descriptor40, this);
        _initializerDefineProperty(this, "currOrderListType", _descriptor41, this);
        _initializerDefineProperty(this, "currHistoryOrderListType", _descriptor42, this);
        _initializerDefineProperty(this, "orderBookTradeTabType", _descriptor43, this);
        _initializerDefineProperty(this, "order", _descriptor44, this);
        _initializerDefineProperty(this, "loanList", _descriptor45, this);
        _initializerDefineProperty(this, "currentOrderNumber", _descriptor46, this);
        _initializerDefineProperty(this, "my_trade_list_table", _descriptor47, this);
        _initializerDefineProperty(this, "my_history_trades", _descriptor48, this);
        _initializerDefineProperty(this, "my_loan_management", _descriptor49, this);
        _initializerDefineProperty(this, "tradeType", _descriptor50, this);
        _initializerDefineProperty(this, "theme", _descriptor51, this);
        _initializerDefineProperty(this, "showProfitCalculator", _descriptor52, this);
        _initializerDefineProperty(this, "coinInfoExist", _descriptor53, this);
        _initializerDefineProperty(this, "coinInfo", _descriptor54, this);
        _initializerDefineProperty(this, "spot_grid_list", _descriptor55, this);
        _initializerDefineProperty(this, "marketsConfig", _descriptor56, this);
        _initializerDefineProperty(this, "wsTime", _descriptor57, this);
        _initializerDefineProperty(this, "wsIsConnecting", _descriptor58, this);
        _initializerDefineProperty(this, "initCartSwitch", _descriptor59, this);
        _initializerDefineProperty(this, "unified_account_status", _descriptor60, this);
        _initializerDefineProperty(this, "classic_account_spot_setting", _descriptor61, this);
        _initializerDefineProperty(this, "maxLoanableNum", _descriptor62, this);
        _initializerDefineProperty(this, "spot_lerverage", _descriptor63, this);
        _initializerDefineProperty(this, "cross_margin_balances", _descriptor64, this);
        _initializerDefineProperty(this, "menuSubType", _descriptor65, this);
        _initializerDefineProperty(this, "layoutversion", _descriptor66, this);
        _initializerDefineProperty(this, "containerWidth", _descriptor67, this);
        _initializerDefineProperty(this, "is_isolated_margin", _descriptor68, this);
        _initializerDefineProperty(this, "dailyMarginRate", _descriptor69, this);
        _initializerDefineProperty(this, "classic_margin_order_confirm", _descriptor70, this);
        _initializerDefineProperty(this, "user_migrate_status", _descriptor71, this);
        _initializerDefineProperty(this, "spot_margin_auto_borrow_setting", _descriptor72, this);
        _initializerDefineProperty(this, "spot_margin_auto_repay_setting", _descriptor73, this);
        _initializerDefineProperty(this, "show_unified_account_trade_guide_modal", _descriptor74, this);
        _initializerDefineProperty(this, "tradingType", _descriptor75, this);
        _initializerDefineProperty(this, "showOldUserFirstUsingBotTab", _descriptor76, this);
        _initializerDefineProperty(this, "setShowOldUserFirstUsingBotTab", _descriptor77, this);
        _initializerDefineProperty(this, "set_tradingType", _descriptor78, this);
        _initializerDefineProperty(this, "is_copy_trader", _descriptor79, this);
        _initializerDefineProperty(this, "searchText", _descriptor80, this);
        _initializerDefineProperty(this, "searchedMarkets", _descriptor81, this);
        _initializerDefineProperty(this, "set_is_copy_trader", _descriptor82, this);
        _initializerDefineProperty(this, "is_in_copy", _descriptor83, this);
        _initializerDefineProperty(this, "leftMarkets", _descriptor84, this);
        _initializerDefineProperty(this, "updateLeftMarkets", _descriptor85, this);
        _initializerDefineProperty(this, "set_is_in_copy", _descriptor86, this);
        _initializerDefineProperty(this, "is_support_copy", _descriptor87, this);
        _initializerDefineProperty(this, "set_is_support_copy", _descriptor88, this);
        _initializerDefineProperty(this, "support_follow_list", _descriptor89, this);
        _initializerDefineProperty(this, "set_orderBookTradeTabType", _descriptor90, this);
        _initializerDefineProperty(this, "set_support_follow_list", _descriptor91, this);
        _initializerDefineProperty(this, "subAvailable", _descriptor92, this);
        _initializerDefineProperty(this, "set_subAvailable", _descriptor93, this);
        _initializerDefineProperty(this, "getSpotCopyUserAmount", _descriptor94, this);
        _initializerDefineProperty(this, "setUnifiedAccountTradeGuideModal", _descriptor95, this);
        _initializerDefineProperty(this, "setMarginOrderConfirm", _descriptor96, this);
        _initializerDefineProperty(this, "setIsolatedMargin", _descriptor97, this);
        _initializerDefineProperty(this, "setAutoMargin", _descriptor98, this);
        _initializerDefineProperty(this, "deepValue", _descriptor99, this);
        _initializerDefineProperty(this, "tradeButtonSetting", _descriptor100, this);
        _initializerDefineProperty(this, "set_deepValue", _descriptor101, this);
        _initializerDefineProperty(this, "updateMenuSubType", _descriptor102, this);
        _initializerDefineProperty(this, "set_menuSubType", _descriptor103, this);
        _initializerDefineProperty(this, "set_loan_marketType", _descriptor104, this);
        _initializerDefineProperty(this, "setTabMarketType", _descriptor105, this);
        _initializerDefineProperty(this, "setTabMarketTypeBeforeSearch", _descriptor106, this);
        _initializerDefineProperty(this, "set_showLoanBorrowModal", _descriptor107, this);
        _initializerDefineProperty(this, "change_spot_lerverage", _descriptor108, this);
        _initializerDefineProperty(this, "shouldReCompute", _descriptor109, this);
        _initializerDefineProperty(this, "setTime", _descriptor110, this);
        _initializerDefineProperty(this, "setNet", _descriptor111, this);
        _initializerDefineProperty(this, "setFrequencyValue", _descriptor112, this);
        _initializerDefineProperty(this, "setInitCart", _descriptor113, this);
        _initializerDefineProperty(this, "getUserMigrateStatus", _descriptor114, this);
        _initializerDefineProperty(this, "userMigrate", _descriptor115, this);
        _initializerDefineProperty(this, "closeAllFold", _descriptor116, this);
        _initializerDefineProperty(this, "openAllFold", _descriptor117, this);
        _initializerDefineProperty(this, "updateSymbol", _descriptor118, this);
        _initializerDefineProperty(this, "updateMarginRate", _descriptor119, this);
        _initializerDefineProperty(this, "UpdateInfoCoins", _descriptor120, this);
        _initializerDefineProperty(this, "getTabMarketsPrecision", _descriptor121, this);
        _initializerDefineProperty(this, "getMarketConfig", _descriptor122, this);
        _initializerDefineProperty(this, "fetchOtherMarkets", _descriptor123, this);
        _initializerDefineProperty(this, "fetchLoanList", _descriptor124, this);
        _initializerDefineProperty(this, "getMarketListByCategory", _descriptor125, this);
        _initializerDefineProperty(this, "setActiveChartMarket", _descriptor126, this);
        _initializerDefineProperty(this, "setActiveChartIndex", _descriptor127, this);
        _initializerDefineProperty(this, "toggleChartMode", _descriptor128, this);
        _initializerDefineProperty(this, "setChartShowMode", _descriptor129, this);
        _initializerDefineProperty(this, "deleteChart", _descriptor130, this);
        _initializerDefineProperty(this, "deleteNotSupportUnifiedAccountChart", _descriptor131, this);
        _initializerDefineProperty(this, "showBigPicture", _descriptor132, this);
        _initializerDefineProperty(this, "currentClientWidth", _descriptor133, this);
        _initializerDefineProperty(this, "setLayoutHandler", _descriptor134, this);
        _initializerDefineProperty(this, "switchStratebotLayout", _descriptor135, this);
        _initializerDefineProperty(this, "setFoldMarketListLayout", _descriptor136, this);
        _initializerDefineProperty(this, "changeAssetsLayout", _descriptor137, this);
        _initializerDefineProperty(this, "resetToDefaultLayout", _descriptor138, this);
        _initializerDefineProperty(this, "changeLayout", _descriptor139, this);
        _initializerDefineProperty(this, "changeLayoutMode", _descriptor140, this);
        _initializerDefineProperty(this, "setKlineShowOrderLine", _descriptor141, this);
        _initializerDefineProperty(this, "setIsFullScreen", _descriptor142, this);
        _initializerDefineProperty(this, "loopAccountSpot", _descriptor143, this);
        _initializerDefineProperty(this, "getMarketAvailableIsLoading", _descriptor144, this);
        _initializerDefineProperty(this, "getMarketAvailable", _descriptor145, this);
        _initializerDefineProperty(this, "setAccountLoop", _descriptor146, this);
        _initializerDefineProperty(this, "updateBalanceByWsData", _descriptor147, this);
        _initializerDefineProperty(this, "fetchSpotGrid", _descriptor148, this);
        _initializerDefineProperty(this, "updateCurrentOrder", _descriptor149, this);
        _initializerDefineProperty(this, "updateTabIndex", _descriptor150, this);
        _initializerDefineProperty(this, "fetchDelegateData", _descriptor151, this);
        _initializerDefineProperty(this, "fetchOrderHistory", _descriptor152, this);
        _initializerDefineProperty(this, "fetchHistoryDeal", _descriptor153, this);
        _initializerDefineProperty(this, "fetchLoanManagement", _descriptor154, this);
        _initializerDefineProperty(this, "updateCurrentOrderNumberMinus1", _descriptor155, this);
        _initializerDefineProperty(this, "setTrustPrice", _descriptor156, this);
        _initializerDefineProperty(this, "setTradeType", _descriptor157, this);
        _initializerDefineProperty(this, "initOrderListNumber", _descriptor158, this);
        _initializerDefineProperty(this, "changeMarketListMode", _descriptor159, this);
        _initializerDefineProperty(this, "changeMarketFoldMode", _descriptor160, this);
        _initializerDefineProperty(this, "changeMarketAllFoldMode", _descriptor161, this);
        _initializerDefineProperty(this, "setUnifiedAccountStatus", _descriptor162, this);
        _initializerDefineProperty(this, "switchToClassicAccount", _descriptor163, this);
        _initializerDefineProperty(this, "updateClassicAccountSpotSetting", _descriptor164, this);
        _initializerDefineProperty(this, "setShouldReCompute", _descriptor165, this);
        _initializerDefineProperty(this, "setStrategyChartResize", _descriptor166, this);
        _initializerDefineProperty(this, "updatePollingData", _descriptor167, this);
        _initializerDefineProperty(this, "setLimitOrderTradeButtonSetting", _descriptor168, this);
        _initializerDefineProperty(this, "updateCurrOrderListType", _descriptor169, this);
        _initializerDefineProperty(this, "updateCurrHistoryOrderListType", _descriptor170, this);
        _initializerDefineProperty(this, "updateWsConnectStatus", _descriptor171, this);
        _initializerDefineProperty(this, "updateSearchedMarkets", _descriptor172, this);
        _initializerDefineProperty(this, "updateSearchText", _descriptor173, this);
        _initializerDefineProperty(this, "clearSearchResult", _descriptor174, this);
        this.initData();
        setInterval(()=>{
            const cur = new Date().getTime();
            if (+cur - +this.PRO_TRADE_WS_TIME > 5e3) {
                try {
                    this.orderBookTradeTabType !== ORDERBOOK_TRADE.TRADE && globalStore.marketType == 'spot' && window.froceUpdateSpotOrderBook()
                } catch (error) {}
                try {
                    this.orderBookTradeTabType !== ORDERBOOK_TRADE.ORDER_BOOK && globalStore.marketType == 'spot' && window.froceUpdateSpotLatestDeal()
                } catch (error) {}
            }
            this.PRO_TRADE_WS_TIME = cur
        }
        , 5e3)
    }
}
) || _class,
_shallow = observable.shallow,
_shallow1 = observable.shallow,
_shallow2 = observable.shallow,
_descriptor = _applyDecoratedDescriptor(_class.prototype, "strategyChartResize", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return 0
    }
}),
_descriptor1 = _applyDecoratedDescriptor(_class.prototype, "PRO_TRADE_WS_TIME", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return 0
    }
}),
_descriptor2 = _applyDecoratedDescriptor(_class.prototype, "history", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return null
    }
}),
_descriptor3 = _applyDecoratedDescriptor(_class.prototype, "balances_mulcharts", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {}
    }
}),
_descriptor4 = _applyDecoratedDescriptor(_class.prototype, "margin_balances", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return marginBalance || {
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
    }
}),
_descriptor5 = _applyDecoratedDescriptor(_class.prototype, "pendingNum", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return 0
    }
}),
_descriptor6 = _applyDecoratedDescriptor(_class.prototype, "coinInfo", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {}
    }
}),
_descriptor7 = _applyDecoratedDescriptor(_class.prototype, "marketType", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return window.location.href.indexOf('trade') !== -1 ? 'spot' : window.location.href.indexOf('futures') !== -1 ? 'contract' : 'spot'
    }
}),
_descriptor8 = _applyDecoratedDescriptor(_class.prototype, "tabMarketType", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return MENU_MARKET.SPOT
    }
}),
_descriptor9 = _applyDecoratedDescriptor(_class.prototype, "tabMarketTypeBeforeSearch", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return window.location.href.indexOf('trade') !== -1 ? MENU_MARKET.SPOT : MENU_MARKET.CONTRACT
    }
}),
_descriptor10 = _applyDecoratedDescriptor(_class.prototype, "showLoanBorrowModal", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor11 = _applyDecoratedDescriptor(_class.prototype, "allMarketList", [_shallow], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return all_currency_list_json || {}
    }
}),
_descriptor12 = _applyDecoratedDescriptor(_class.prototype, "marketMenu", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return market_menu_config_json || []
    }
}),
_descriptor13 = _applyDecoratedDescriptor(_class.prototype, "currSymbol", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return GLOBAL_PRO_TRADE.currSymbol
    }
}),
_descriptor14 = _applyDecoratedDescriptor(_class.prototype, "curr_a", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return currA.toUpperCase()
    }
}),
_descriptor15 = _applyDecoratedDescriptor(_class.prototype, "curr_b", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return currB.toUpperCase()
    }
}),
_descriptor16 = _applyDecoratedDescriptor(_class.prototype, "netETF", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {}
    }
}),
_descriptor17 = _applyDecoratedDescriptor(_class.prototype, "loadingAllMarketListData", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor18 = _applyDecoratedDescriptor(_class.prototype, "frequency_value", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return frequencyDefaultValue || 1
    }
}),
_descriptor19 = _applyDecoratedDescriptor(_class.prototype, "last_price", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return GLOBAL_PRO_TRADE.last_price
    }
}),
_descriptor20 = _applyDecoratedDescriptor(_class.prototype, "bidOnePrice", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return 0
    }
}),
_descriptor21 = _applyDecoratedDescriptor(_class.prototype, "askOnePrice", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return 0
    }
}),
_descriptor22 = _applyDecoratedDescriptor(_class.prototype, "depthAsks", [_shallow1], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return []
    }
}),
_descriptor23 = _applyDecoratedDescriptor(_class.prototype, "depthBids", [_shallow2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return []
    }
}),
_descriptor24 = _applyDecoratedDescriptor(_class.prototype, "currTradePanelMode", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return 0
    }
}),
_descriptor25 = _applyDecoratedDescriptor(_class.prototype, "klineShowOrderLine", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor26 = _applyDecoratedDescriptor(_class.prototype, "mChartMode", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor27 = _applyDecoratedDescriptor(_class.prototype, "mChartActive", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: void 0
}),
_descriptor28 = _applyDecoratedDescriptor(_class.prototype, "tabMarkets", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: void 0
}),
_descriptor29 = _applyDecoratedDescriptor(_class.prototype, "multiPriceArr", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {}
    }
}),
_descriptor30 = _applyDecoratedDescriptor(_class.prototype, "layoutMode", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return localStorage.getItem(`trade_layout_mode`) || LAYOUT_MODES.PRO_TRADE
    }
}),
_descriptor31 = _applyDecoratedDescriptor(_class.prototype, "showLayout", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return defaultShowLayout
    }
}),
_descriptor32 = _applyDecoratedDescriptor(_class.prototype, "layoutOption", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return localStorage.getItem(`trade_layout_mode`) == 'standard_trade' ? defaultSimpleTradeLayoutOption : defaultLayoutOption
    }
}),
_descriptor33 = _applyDecoratedDescriptor(_class.prototype, "marketSimpleMode", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return localStorage.getItem('show_simple_mode') !== '0'
    }
}),
_descriptor34 = _applyDecoratedDescriptor(_class.prototype, "marketFoldMode", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return localStorage.getItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_fold_mode`) === '1'
    }
}),
_descriptor35 = _applyDecoratedDescriptor(_class.prototype, "AllFoldModVersion", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return '0.0.22'
    }
}),
_descriptor36 = _applyDecoratedDescriptor(_class.prototype, "marketAllFoldMode", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (localStorage.getItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_all_fold_mode_ ${this.AllFoldModVersion}`) || '0') === (document.body.clientWidth <= 1440 ? '0' : '1')
    }
}),
_descriptor37 = _applyDecoratedDescriptor(_class.prototype, "isFullScreen", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor38 = _applyDecoratedDescriptor(_class.prototype, "showTradeEditPopup", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor39 = _applyDecoratedDescriptor(_class.prototype, "TradeEditPanelObj", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {}
    }
}),
_descriptor40 = _applyDecoratedDescriptor(_class.prototype, "tabIndex", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return TRADE_TABLE_TYPE.PENDING_ORDER
    }
}),
_descriptor41 = _applyDecoratedDescriptor(_class.prototype, "currOrderListType", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return localStorage.getItem('openOrder_type_select') * 1 || 0
    }
}),
_descriptor42 = _applyDecoratedDescriptor(_class.prototype, "currHistoryOrderListType", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return localStorage.getItem('orderHistory_type') * 1 || 0
    }
}),
_descriptor43 = _applyDecoratedDescriptor(_class.prototype, "orderBookTradeTabType", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ORDERBOOK_TRADE.ORDER_BOOK
    }
}),
_descriptor44 = _applyDecoratedDescriptor(_class.prototype, "order", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return []
    }
}),
_descriptor45 = _applyDecoratedDescriptor(_class.prototype, "loanList", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return []
    }
}),
_descriptor46 = _applyDecoratedDescriptor(_class.prototype, "currentOrderNumber", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {}
    }
}),
_descriptor47 = _applyDecoratedDescriptor(_class.prototype, "my_trade_list_table", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {
            data: [],
            page: 1
        }
    }
}),
_descriptor48 = _applyDecoratedDescriptor(_class.prototype, "my_history_trades", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {
            data: [],
            page: 1
        }
    }
}),
_descriptor49 = _applyDecoratedDescriptor(_class.prototype, "my_loan_management", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {
            data: [],
            page: 1,
            total: 0,
            activeTypeBtn: 0,
            loanDetailsSelection: '1',
            isLoading: true
        }
    }
}),
_descriptor50 = _applyDecoratedDescriptor(_class.prototype, "tradeType", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return 'buy'
    }
}),
_descriptor51 = _applyDecoratedDescriptor(_class.prototype, "theme", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return tradeTools.getTheme()
    }
}),
_descriptor52 = _applyDecoratedDescriptor(_class.prototype, "showProfitCalculator", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor53 = _applyDecoratedDescriptor(_class.prototype, "coinInfoExist", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return true
    }
}),
_descriptor54 = _applyDecoratedDescriptor(_class.prototype, "coinInfo", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {
            list: [],
            name: ''
        }
    }
}),
_descriptor55 = _applyDecoratedDescriptor(_class.prototype, "spot_grid_list", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {
            pedingPage: 1,
            pendingData: [],
            historyPage: 1,
            historyData: []
        }
    }
}),
_descriptor56 = _applyDecoratedDescriptor(_class.prototype, "marketsConfig", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {}
    }
}),
_descriptor57 = _applyDecoratedDescriptor(_class.prototype, "wsTime", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return 0
    }
}),
_descriptor58 = _applyDecoratedDescriptor(_class.prototype, "wsIsConnecting", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor59 = _applyDecoratedDescriptor(_class.prototype, "initCartSwitch", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor60 = _applyDecoratedDescriptor(_class.prototype, "unified_account_status", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {
            notLoaded: true,
            is_open_portfolio_margin: 0,
            is_open_portfolio_margin_cross_margin: 0,
            is_open_portfolio_margin_futures_usd: 0,
            is_open_portfolio_margin_futures_usdt: 0,
            is_open_portfolio_margin_futures_btc: 0,
            portfolio_margin_account_uid: '',
            is_portfolio_margin_account: is_portfolio_margin_account ? 1 : 0
        }
    }
}),
_descriptor61 = _applyDecoratedDescriptor(_class.prototype, "classic_account_spot_setting", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return localStorage.getItem('classic_account_spot_setting') ? JSON.parse(localStorage.getItem('classic_account_spot_setting')) : {
            limit_price: true,
            market_price: true,
            sl_and_tp: true,
            alg_order: true,
            cancel_all_pending_orders: true
        }
    }
}),
_descriptor62 = _applyDecoratedDescriptor(_class.prototype, "maxLoanableNum", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return [0, 0]
    }
}),
_descriptor63 = _applyDecoratedDescriptor(_class.prototype, "spot_lerverage", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return localStorage.getItem('spot_leverage') === '1'
    }
}),
_descriptor64 = _applyDecoratedDescriptor(_class.prototype, "cross_margin_balances", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return null
    }
}),
_descriptor65 = _applyDecoratedDescriptor(_class.prototype, "menuSubType", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return localStorage.getItem('SPOT_TRADE_MARKET_MENU') || 'USDT'
    }
}),
_descriptor66 = _applyDecoratedDescriptor(_class.prototype, "layoutversion", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return '1.4.05'
    }
}),
_descriptor67 = _applyDecoratedDescriptor(_class.prototype, "containerWidth", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return document.body.clientWidth
    }
}),
_descriptor68 = _applyDecoratedDescriptor(_class.prototype, "is_isolated_margin", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor69 = _applyDecoratedDescriptor(_class.prototype, "dailyMarginRate", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {
            curr_a: '0.00000',
            curr_b: '0.00000',
            year_a: '0.00',
            year_b: '0.00'
        }
    }
}),
_descriptor70 = _applyDecoratedDescriptor(_class.prototype, "classic_margin_order_confirm", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return localStorage.getItem('isolate_margin_remind') === '1'
    }
}),
_descriptor71 = _applyDecoratedDescriptor(_class.prototype, "user_migrate_status", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return 1
    }
}),
_descriptor72 = _applyDecoratedDescriptor(_class.prototype, "spot_margin_auto_borrow_setting", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return margin_auto_borrow_setting === '1'
    }
}),
_descriptor73 = _applyDecoratedDescriptor(_class.prototype, "spot_margin_auto_repay_setting", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return margin_auto_repay_setting === '1'
    }
}),
_descriptor74 = _applyDecoratedDescriptor(_class.prototype, "show_unified_account_trade_guide_modal", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor75 = _applyDecoratedDescriptor(_class.prototype, "tradingType", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return getQueryVariable('tradModel') == 'strategybot' && show_strategy_bots_tab ? 'strategybot' : 'trade'
    }
}),
_descriptor76 = _applyDecoratedDescriptor(_class.prototype, "showOldUserFirstUsingBotTab", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor77 = _applyDecoratedDescriptor(_class.prototype, "setShowOldUserFirstUsingBotTab", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return value=>{
            this.showOldUserFirstUsingBotTab = value
        }
    }
}),
_descriptor78 = _applyDecoratedDescriptor(_class.prototype, "set_tradingType", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return tradingType=>{
            this.tradingType = tradingType
        }
    }
}),
_descriptor79 = _applyDecoratedDescriptor(_class.prototype, "is_copy_trader", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor80 = _applyDecoratedDescriptor(_class.prototype, "searchText", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ''
    }
}),
_descriptor81 = _applyDecoratedDescriptor(_class.prototype, "searchedMarkets", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return {
            spot: [],
            future: [],
            loan: []
        }
    }
}),
_descriptor82 = _applyDecoratedDescriptor(_class.prototype, "set_is_copy_trader", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return e=>{
            this.is_copy_trader = e
        }
    }
}),
_descriptor83 = _applyDecoratedDescriptor(_class.prototype, "is_in_copy", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor84 = _applyDecoratedDescriptor(_class.prototype, "leftMarkets", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return []
    }
}),
_descriptor85 = _applyDecoratedDescriptor(_class.prototype, "updateLeftMarkets", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return data=>{
            this.leftMarkets = data || []
        }
    }
}),
_descriptor86 = _applyDecoratedDescriptor(_class.prototype, "set_is_in_copy", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return e=>{
            this.is_in_copy = e;
            if (e) {
                this.getSpotCopyUserAmount(e)
            } else {
                this.getMarketAvailable()
            }
        }
    }
}),
_descriptor87 = _applyDecoratedDescriptor(_class.prototype, "is_support_copy", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return true
    }
}),
_descriptor88 = _applyDecoratedDescriptor(_class.prototype, "set_is_support_copy", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return e=>{
            this.is_support_copy = e
        }
    }
}),
_descriptor89 = _applyDecoratedDescriptor(_class.prototype, "support_follow_list", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return []
    }
}),
_descriptor90 = _applyDecoratedDescriptor(_class.prototype, "set_orderBookTradeTabType", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return e=>{
            this.orderBookTradeTabType = e
        }
    }
}),
_descriptor91 = _applyDecoratedDescriptor(_class.prototype, "set_support_follow_list", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return e=>{
            this.support_follow_list = e
        }
    }
}),
_descriptor92 = _applyDecoratedDescriptor(_class.prototype, "subAvailable", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return 0
    }
}),
_descriptor93 = _applyDecoratedDescriptor(_class.prototype, "set_subAvailable", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return e=>{
            this.subAvailable = e
        }
    }
}),
_descriptor94 = _applyDecoratedDescriptor(_class.prototype, "getSpotCopyUserAmount", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (is_in_copy=this.is_in_copy)=>{
            if (!is_in_copy) {
                return
            }
            const that = this;
            proTradeApi.transfer_available({
                market: that.currSymbol
            }).then(res=>{
                if (res.code == 0) {
                    if (res.data.sub_spot.length != 0) {
                        var ref19, ref20;
                        const symbol = that.currSymbol.toLowerCase();
                        var ref21;
                        const symbolAva = (ref21 = (ref19 = res.data.sub_spot.find(i=>i.currency.toLowerCase() == symbol.split('_')[0])) === null || ref19 === void 0 ? void 0 : ref19.available) !== null && ref21 !== void 0 ? ref21 : 0;
                        var ref22;
                        const usdtAva = (ref22 = (ref20 = res.data.sub_spot.find(i=>i.currency.toLowerCase() == 'usdt')) === null || ref20 === void 0 ? void 0 : ref20.available) !== null && ref22 !== void 0 ? ref22 : 0;
                        that.balances_mulcharts[symbol] = [symbolAva, usdtAva]
                    } else {
                        that.balances_mulcharts[that.currSymbol.toLowerCase()] = [0, 0]
                    }
                }
            }
            , error=>{}
            )
        }
    }
}),
_descriptor95 = _applyDecoratedDescriptor(_class.prototype, "setUnifiedAccountTradeGuideModal", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return flag=>{
            this.show_unified_account_trade_guide_modal = flag
        }
    }
}),
_descriptor96 = _applyDecoratedDescriptor(_class.prototype, "setMarginOrderConfirm", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            this.classic_margin_order_confirm = !this.classic_margin_order_confirm;
            localStorage.setItem('isolate_margin_remind', this.classic_margin_order_confirm ? '1' : '2')
        }
    }
}),
_descriptor97 = _applyDecoratedDescriptor(_class.prototype, "setIsolatedMargin", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return flag=>{
            this.is_isolated_margin = flag
        }
    }
}),
_descriptor98 = _applyDecoratedDescriptor(_class.prototype, "setAutoMargin", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (type,flag,tips=false)=>{
            const params = {
                k: type,
                v: Number(flag)
            };
            proTradeApi.setMarginUserSetting(params).then(res=>{
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
    }
}),
_descriptor99 = _applyDecoratedDescriptor(_class.prototype, "deepValue", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ''
    }
}),
_descriptor100 = _applyDecoratedDescriptor(_class.prototype, "tradeButtonSetting", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return localStorage.getItem('trade_button_setting') || TRADE_BTN_SETTING.MERGE
    }
}),
_descriptor101 = _applyDecoratedDescriptor(_class.prototype, "set_deepValue", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return value=>{
            this.deepValue = value
        }
    }
}),
_descriptor102 = _applyDecoratedDescriptor(_class.prototype, "updateMenuSubType", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            const supportMarkets = Object.keys(this.curMarketList);
            if (!supportMarkets.includes(this.menuSubType)) {
                this.menuSubType = 'USDT'
            }
        }
    }
}),
_descriptor103 = _applyDecoratedDescriptor(_class.prototype, "set_menuSubType", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return menuSubType=>{
            this.menuSubType = menuSubType;
            const curMarket = this.allMarketList[menuSubType];
            if (menuSubType !== 'FAVRT' && Object.keys(curMarket).length === 0) {
                this.getMarketListByCategory(menuSubType)
            }
        }
    }
}),
_descriptor104 = _applyDecoratedDescriptor(_class.prototype, "set_loan_marketType", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            this.marketType = 'loan';
            this.tabMarketType = MENU_MARKET.LOAN;
            this.showLoanBorrowModal = true
        }
    }
}),
_descriptor105 = _applyDecoratedDescriptor(_class.prototype, "setTabMarketType", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return type=>{
            this.tabMarketType = type
        }
    }
}),
_descriptor106 = _applyDecoratedDescriptor(_class.prototype, "setTabMarketTypeBeforeSearch", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return type=>{
            this.tabMarketTypeBeforeSearch = type
        }
    }
}),
_descriptor107 = _applyDecoratedDescriptor(_class.prototype, "set_showLoanBorrowModal", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return val=>{
            this.showLoanBorrowModal = val
        }
    }
}),
_descriptor108 = _applyDecoratedDescriptor(_class.prototype, "change_spot_lerverage", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            this.spot_lerverage = !this.spot_lerverage;
            localStorage.setItem('spot_leverage', this.spot_lerverage ? '1' : '0')
        }
    }
}),
_descriptor109 = _applyDecoratedDescriptor(_class.prototype, "shouldReCompute", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor110 = _applyDecoratedDescriptor(_class.prototype, "setTime", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return time=>{
            this.wsTime = time
        }
    }
}),
_descriptor111 = _applyDecoratedDescriptor(_class.prototype, "setNet", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return value=>{
            this.netETF = _objectSpread({}, value)
        }
    }
}),
_descriptor112 = _applyDecoratedDescriptor(_class.prototype, "setFrequencyValue", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return value=>{
            this.frequency_value = value
        }
    }
}),
_descriptor113 = _applyDecoratedDescriptor(_class.prototype, "setInitCart", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return flag=>{
            this.initCartSwitch = flag
        }
    }
}),
_descriptor114 = _applyDecoratedDescriptor(_class.prototype, "getUserMigrateStatus", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            proTradeApi.userMigrateStatus().then(res=>{
                if (res.code === 0) {
                    this.user_migrate_status = res.data.status
                }
            }
            )
        }
    }
}),
_descriptor115 = _applyDecoratedDescriptor(_class.prototype, "userMigrate", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            return new Promise((resolve,reject)=>{
                proTradeApi.userMigrate().then(res=>{
                    if (res.code === 0) {
                        NotySuccess(res.message)
                    } else {
                        resolve(res)
                    }
                    setTimeout(()=>this.getUserMigrateStatus(), 500)
                }
                )
            }
            )
        }
    }
}),
_descriptor116 = _applyDecoratedDescriptor(_class.prototype, "closeAllFold", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            if (!this.marketAllFoldMode && !this.marketFoldMode) {
                this.changeMarketAllFoldMode()
            }
        }
    }
}),
_descriptor117 = _applyDecoratedDescriptor(_class.prototype, "openAllFold", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            if (this.marketAllFoldMode && !this.marketFoldMode) {
                this.changeMarketAllFoldMode()
            }
        }
    }
}),
_descriptor118 = _applyDecoratedDescriptor(_class.prototype, "updateSymbol", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return async marketName=>{
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
                }).then(res=>{
                    if (!res || !res.last_price)
                        return;
                    const price = res.last_price && Number(res.last_price);
                    this.multiPriceArr = _objectSpread({}, this.multiPriceArr, {
                        [this.currSymbol]: _objectSpread({}, this.multiPriceArr[this.currSymbol], {
                            priceStr: price
                        })
                    })
                }
                );
                PubSub.publish('TRADE_EVENT_SWITCH_MARKET', {
                    currSymbol: this.currSymbol
                })
            }
        }
    }
}),
_descriptor119 = _applyDecoratedDescriptor(_class.prototype, "updateMarginRate", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            proTradeApi.dailyRate({
                curr_a: this.curr_a,
                curr_b: this.curr_b
            }).then(res=>{
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
    }
}),
_descriptor120 = _applyDecoratedDescriptor(_class.prototype, "UpdateInfoCoins", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            proTradeApi.getCoinInfo({
                curr_type: this.curr_a.toLowerCase()
            }).then(res=>{
                if (res && res.datas && res.datas.coininfo) {
                    const info = res.datas.coininfo;
                    this.coinInfo.name = is_cn ? info.name_cn : info.name;
                    this.coinInfo.coin_name = info.coin_name;
                    this.coinInfo.symbolName = info.name;
                    const price = info.ticker_last && Number(info.ticker_last);
                    const decimals_fiatRate = tradeTools.get_bid_or_ask_decimals(price, this.curr_b, true);
                    const currPriceToLocal = tradeTools.num_fix(price * decimals_fiatRate.fiat_rate, decimals_fiatRate.fiat_rate_decimals);
                    this.multiPriceArr = _objectSpread({}, this.multiPriceArr, {
                        [this.currSymbol]: _objectSpread({}, this.multiPriceArr[this.currSymbol], {
                            percent: info.change && Number(info.change).toFixed(2),
                            priceStr: price,
                            high: info.ticker_high,
                            low: info.ticker_low,
                            currPriceToLocal: currPriceToLocal,
                            baseVolume: conversionUnit(info.trade_amount),
                            quoteVolume: conversionUnit(info.trade_volume)
                        })
                    })
                }
            }
            )
        }
    }
}),
_descriptor121 = _applyDecoratedDescriptor(_class.prototype, "getTabMarketsPrecision", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            this.tabMarkets.map(async market=>{
                if (market && !this.marketsConfig[market] && market !== this.currSymbol) {
                    try {
                        const result = await proTradeApi.getMarketConfig(market);
                        if (result.code === 200) {
                            const {prec_v, prec_t, prec_r} = result.data;
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
    }
}),
_descriptor122 = _applyDecoratedDescriptor(_class.prototype, "getMarketConfig", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return async market=>{
            if (!this.marketsConfig[market]) {
                let result = await proTradeApi.getMarketConfig(market);
                if (result.code === 200) {
                    var ref27;
                    const {prec_v, prec_t, prec_r} = result.data;
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
    }
}),
_applyDecoratedDescriptor(_class.prototype, "getAllMarketList", [action], Object.getOwnPropertyDescriptor(_class.prototype, "getAllMarketList"), _class.prototype),
_descriptor123 = _applyDecoratedDescriptor(_class.prototype, "fetchOtherMarkets", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            this.loadingAllMarketListData = true;
            const spotInfo = this.marketMenu.find(o=>o.market === MENU_MARKET.SPOT);
            let spotCategories = spotInfo ? spotInfo.sub.map(o=>o.market.toUpperCase()) : [];
            spotCategories = spotCategories.filter(o=>!['FAVRT', 'LOAN'].includes(o));
            let index = 0;
            const intervalId = setInterval(()=>{
                this.getMarketListByCategory(spotCategories[index] === 'USD_S' ? 'USDT' : spotCategories[index], index === spotCategories.length - 1);
                index++;
                if (index === spotCategories.length) {
                    clearInterval(intervalId)
                }
            }
            , 100)
        }
    }
}),
_descriptor124 = _applyDecoratedDescriptor(_class.prototype, "fetchLoanList", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            proTradeApi.getMarketList('LOAN').then(res=>{
                if (res) {
                    const list = res.map(item=>{
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
    }
}),
_descriptor125 = _applyDecoratedDescriptor(_class.prototype, "getMarketListByCategory", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (category,isLast=false)=>{
            try {
                proTradeApi.getMarketList(category).then(res=>{
                    if (res) {
                        const curMarketInfo = res.reduce((acc,cur)=>{
                            const market = cur[0].toLowerCase();
                            const [curr_a,curr_b] = market.split('_');
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
                        }
                        , {});
                        this.allMarketList = _objectSpread({}, this.allMarketList, {
                            [category]: curMarketInfo
                        })
                    }
                }
                ).finally(()=>{
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
    }
}),
_applyDecoratedDescriptor(_class.prototype, "getMarketName", [computed], Object.getOwnPropertyDescriptor(_class.prototype, "getMarketName"), _class.prototype),
_descriptor126 = _applyDecoratedDescriptor(_class.prototype, "setActiveChartMarket", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return market=>{
            if (!this.mChartMode) {
                const marketLength = this.tabMarkets.length;
                if (this.tabMarkets.indexOf(market) === -1) {
                    if (marketLength < 4) {
                        this.tabMarkets[marketLength] = market
                    } else if (marketLength >= 4) {
                        const newTabMarkets = this.tabMarkets.filter((o,index)=>{
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
    }
}),
_descriptor127 = _applyDecoratedDescriptor(_class.prototype, "setActiveChartIndex", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (activeIndex,isDelete=false)=>{
            localStorage.setItem('pro-trade-active-index', activeIndex);
            if (this.tabMarkets[activeIndex] && (isDelete || this.mChartActive !== activeIndex)) {
                this.history && this.history.push('/trade/' + this.tabMarkets[activeIndex] + window.location.search)
            }
            this.mChartActive = activeIndex
        }
    }
}),
_descriptor128 = _applyDecoratedDescriptor(_class.prototype, "toggleChartMode", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return onOff=>{
            $('.mode-switchicon-dropdown').hide();
            this.setChartShowMode(onOff);
            localStorage.setItem('pro-chartShowMode', Number(onOff))
        }
    }
}),
_descriptor129 = _applyDecoratedDescriptor(_class.prototype, "setChartShowMode", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return on=>{
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
                this.tabMarkets = _tabs.filter(m=>m)
            }
        }
    }
}),
_descriptor130 = _applyDecoratedDescriptor(_class.prototype, "deleteChart", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (e,index)=>{
            e && e.stopPropagation();
            if (this.mChartMode) {
                this.tabMarkets[index] = ''
            } else {
                const _tabs = [...this.tabMarkets];
                _tabs[index] = '';
                this.tabMarkets = _tabs.filter(m=>m)
            }
            const currentActiveIndex = this.tabMarkets.findIndex(val=>val != '');
            this.setActiveChartIndex(currentActiveIndex, true);
            PubSub.publish('REMOVE_PRO_WIDGET', {
                index
            })
        }
    }
}),
_descriptor131 = _applyDecoratedDescriptor(_class.prototype, "deleteNotSupportUnifiedAccountChart", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            const {support, notSupport} = this.tabMarkets.reduce((acc,cur,idx)=>{
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
            notSupport.forEach(item=>{
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
                this.tabMarkets = this.tabMarkets.filter(o=>support.includes(o))
            }
            const newActiveIndex = support.findIndex(o=>o === curTabMarket);
            this.setActiveChartIndex(newActiveIndex != -1 ? newActiveIndex : 0)
        }
    }
}),
_descriptor132 = _applyDecoratedDescriptor(_class.prototype, "showBigPicture", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return index=>{
            this.setActiveChartIndex(index);
            this.toggleChartMode(false)
        }
    }
}),
_descriptor133 = _applyDecoratedDescriptor(_class.prototype, "currentClientWidth", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return containerWidth=>{
            this.containerWidth = containerWidth;
            if (this.layoutMode == 'default_trade') {
                if (containerWidth <= 1440) {
                    this.closeAllFold()
                } else {
                    this.openAllFold()
                }
            }
        }
    }
}),
_descriptor134 = _applyDecoratedDescriptor(_class.prototype, "setLayoutHandler", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return key=>{
            this.showLayout[key] = !this.showLayout[key];
            localStorage.setItem(`custom_ ${this.layoutMode}_show_layout`, JSON.stringify(this.showLayout));
            if (this.showLayout[key]) {
                const LayoutOption = localStorage.getItem(`trade_layout_mode`) == 'standard_trade' ? defaultSimpleTradeLayoutOption : defaultLayoutOption;
                const currentShowLayout = JSON.parse(JSON.stringify(this.showLayout));
                const newLayout = {};
                for (let keyName in LayoutOption) {
                    const layout = LayoutOption[keyName];
                    const arr = [];
                    layout.forEach(item=>{
                        if (currentShowLayout[item.i]) {
                            arr.push(item)
                        }
                    }
                    );
                    newLayout[keyName] = arr
                }
                if (this.layoutMode == 'default_trade') {
                    const {w1366} = WidthObj;
                    const {w0Open} = w1366;
                    const marketListIndex = newLayout.w1366.findIndex(o=>o.i === 'marketList');
                    const {w} = newLayout.w1366[marketListIndex];
                    newLayout.w1366.forEach(o=>{
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
    }
}),
_descriptor135 = _applyDecoratedDescriptor(_class.prototype, "switchStratebotLayout", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return market=>{
            const currentLayout = JSON.parse(JSON.stringify(this.layoutOption));
            this.showLayout['assets'] = market == 'trade';
            if (market == 'strategybot') {
                if ((globalStore === null || globalStore === void 0 ? void 0 : globalStore.layoutMode) == 'default_trade') {
                    for (let key in currentLayout) {
                        const layout = currentLayout[key];
                        const tradingIndex = layout.findIndex(o=>o.i === 'trading');
                        layout[tradingIndex].h = initLayoutH.h0 - initLayoutH.h2 + initLayoutH.h1;
                        layout[key] = layout
                    }
                } else {
                    for (let key in currentLayout) {
                        const layout = currentLayout[key];
                        const entrustInfoIndex = layout.findIndex(o=>o.i === 'entrustInfo');
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
                    layout.forEach(item=>{
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
    }
}),
_descriptor136 = _applyDecoratedDescriptor(_class.prototype, "setFoldMarketListLayout", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (foldMode,type)=>{
            const currentLayout = JSON.parse(JSON.stringify(this.layoutOption));
            if (is_ar) {
                if (foldMode) {
                    for (let key in currentLayout) {
                        const layout = currentLayout[key];
                        const marketListIndex = layout.findIndex(o=>o.i === 'marketList');
                        const {x, w, h} = layout[marketListIndex];
                        const {w0AllFold, w0Fold} = WidthObj[key];
                        const fold = type == "fold" ? w0Fold : w0AllFold;
                        layout.forEach(o=>{
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
                        const marketListIndex = layout.findIndex(o=>o.i === 'marketList');
                        const {w, x} = layout[marketListIndex];
                        const {w0AllFold, w0Fold, w0: w01, w0Open} = WidthObj[key];
                        const fold = type == "fold" ? w0Fold : w0AllFold;
                        const currentW = w0Open ? w0Open : w01;
                        layout.forEach(o=>{
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
                        const marketListIndex = layout.findIndex(o=>o.i === 'marketList');
                        const {w} = layout[marketListIndex];
                        const {w0AllFold, w0Fold} = WidthObj[key];
                        const fold = type == "fold" ? w0Fold : w0AllFold;
                        layout.forEach(o=>{
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
                        const marketListIndex = layout.findIndex(o=>o.i === 'marketList');
                        const {w0AllFold, w0Fold, w0: w01, w00, w0Open} = WidthObj[key];
                        const fold = type == "fold" ? w0Fold : w0AllFold;
                        const currentW = this.layoutMode === 'standard_trade' ? w00 : w0Open ? w0Open : w01;
                        layout.forEach(o=>{
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
    }
}),
_descriptor137 = _applyDecoratedDescriptor(_class.prototype, "changeAssetsLayout", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (height=52,simpleHight=0)=>{}
    }
}),
_descriptor138 = _applyDecoratedDescriptor(_class.prototype, "resetToDefaultLayout", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
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
    }
}),
_descriptor139 = _applyDecoratedDescriptor(_class.prototype, "changeLayout", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return layout=>{
            this.layoutOption = layout;
            localStorage.setItem(`${is_ar ? 'ar_' : ''}custom_ ${this.layoutMode}_all_layout_option_ ${this.layoutversion}`, JSON.stringify(layout))
        }
    }
}),
_descriptor140 = _applyDecoratedDescriptor(_class.prototype, "changeLayoutMode", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return mode=>{
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
    }
}),
_descriptor141 = _applyDecoratedDescriptor(_class.prototype, "setKlineShowOrderLine", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
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
    }
}),
_descriptor142 = _applyDecoratedDescriptor(_class.prototype, "setIsFullScreen", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return isFullScreen=>{
            this.isFullScreen = isFullScreen
        }
    }
}),
_descriptor143 = _applyDecoratedDescriptor(_class.prototype, "loopAccountSpot", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return true
    }
}),
_descriptor144 = _applyDecoratedDescriptor(_class.prototype, "getMarketAvailableIsLoading", [observable], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return false
    }
}),
_descriptor145 = _applyDecoratedDescriptor(_class.prototype, "getMarketAvailable", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (current_symbol=this.currSymbol)=>{
            if (!this.loopAccountSpot || this.getMarketAvailableIsLoading)
                return;
            this.availableLoopFetch && clearTimeout(this.availableLoopFetch);
            if (!GLOBAL_PRO_TRADE.is_login)
                return false;
            const {unified_account_status, is_isolated_margin} = this;
            const curr_a = current_symbol.split('_')[0];
            const curr_b = current_symbol.split('_')[1];
            this.getMarketAvailableIsLoading = true;
            if (this.is_in_copy) {
                return proTradeApi.transfer_available({
                    market: current_symbol
                }).then(res=>{
                    if (res.code === 0) {
                        if (res.data.sub_spot.length != 0) {
                            var ref28, ref29;
                            const symbol = current_symbol.toLowerCase();
                            var ref30;
                            const symbolAva = (ref30 = (ref28 = res.data.sub_spot.find(i=>i.currency.toLowerCase() == symbol.split('_')[0])) === null || ref28 === void 0 ? void 0 : ref28.available) !== null && ref30 !== void 0 ? ref30 : 0;
                            var ref31;
                            const usdtAva = (ref31 = (ref29 = res.data.sub_spot.find(i=>i.currency.toLowerCase() == 'usdt')) === null || ref29 === void 0 ? void 0 : ref29.available) !== null && ref31 !== void 0 ? ref31 : 0;
                            this.balances_mulcharts = _objectSpread({}, this.balances_mulcharts, {
                                [current_symbol.toLowerCase()]: [symbolAva, usdtAva]
                            });
                            return {
                                list: [symbolAva, usdtAva],
                                type: 'spot_copy'
                            }
                        } else {
                            this.balances_mulcharts = _objectSpread({}, this.balances_mulcharts, {
                                [current_symbol.toLowerCase()]: [0, 0]
                            });
                            return {
                                list: [0, 0],
                                type: 'spot_copy'
                            }
                        }
                    }
                }
                ).catch(err=>{
                    console.error(err, 'fetch copy account error')
                }
                ).finally(()=>{
                    this.availableLoopFetch = setTimeout(()=>this.getMarketAvailable(), 3e3);
                    this.getMarketAvailableIsLoading = false
                }
                )
            } else if (unified_account_status.is_portfolio_margin_account) {
                return proTradeApi.getCrossMarginAvailable(current_symbol).then(res=>{
                    if (res.code === 0) {
                        var ref32, ref33, ref34, ref35;
                        this.cross_margin_balances = res.data;
                        const curr_a_available = ((ref32 = res.data.assets[curr_a.toUpperCase()]) === null || ref32 === void 0 ? void 0 : ref32.available) || 0;
                        const curr_b_available = ((ref33 = res.data.assets[curr_b.toUpperCase()]) === null || ref33 === void 0 ? void 0 : ref33.available) || 0;
                        const curr_a_borrow = ((ref34 = res.data.assets[curr_a.toUpperCase()]) === null || ref34 === void 0 ? void 0 : ref34.borrow_able) || 0;
                        const curr_b_borrow = ((ref35 = res.data.assets[curr_b.toUpperCase()]) === null || ref35 === void 0 ? void 0 : ref35.borrow_able) || 0;
                        this.balances_mulcharts = _objectSpread({}, this.balances_mulcharts, {
                            [current_symbol.toLowerCase()]: [curr_a_available, curr_b_available]
                        });
                        this.maxLoanableNum = [curr_b_borrow, curr_a_borrow];
                        return {
                            list: [curr_a_available, curr_b_available],
                            maxLoanableNum: [curr_b_borrow, curr_a_borrow],
                            type: TRADE_MODE.CROSS_MARGIN
                        }
                    }
                }
                ).catch(err=>{
                    console.error(err, 'fetch cross_margin account error')
                }
                ).finally(()=>{
                    this.availableLoopFetch = setTimeout(()=>this.getMarketAvailable(), 3e3);
                    this.getMarketAvailableIsLoading = false
                }
                )
            } else if (is_isolated_margin) {
                return proTradeApi.getIsolatedAvailable({
                    market: current_symbol
                }).then(res=>{
                    if (res.code === 0) {
                        var ref36, ref37;
                        this.margin_balances = res.data;
                        const money_available = ((ref36 = res.data.money) === null || ref36 === void 0 ? void 0 : ref36.available) || 0;
                        const stock_available = ((ref37 = res.data.stock) === null || ref37 === void 0 ? void 0 : ref37.available) || 0;
                        this.balances_mulcharts = _objectSpread({}, this.balances_mulcharts, {
                            [current_symbol.toLowerCase()]: [stock_available, money_available]
                        });
                        return {
                            margin_balances: res.data,
                            type: TRADE_MODE.MARGIN
                        }
                    }
                }
                ).catch(err=>{
                    console.error(err, 'fetch isolated account error')
                }
                ).finally(()=>{
                    this.availableLoopFetch = setTimeout(()=>this.getMarketAvailable(), 3e3);
                    this.getMarketAvailableIsLoading = false
                }
                )
            } else {
                return proTradeApi.getSpotAvailable({
                    market: current_symbol
                }).then(res=>{
                    if (res.code === 0) {
                        var ref38, ref39;
                        const list = [(ref38 = res.data[curr_a]) === null || ref38 === void 0 ? void 0 : ref38.available, (ref39 = res.data[curr_b]) === null || ref39 === void 0 ? void 0 : ref39.available];
                        this.balances_mulcharts = _objectSpread({}, this.balances_mulcharts, {
                            [current_symbol.toLowerCase()]: list
                        });
                        return {
                            list: list,
                            type: TRADE_MODE.SPOT
                        }
                    }
                }
                ).catch(err=>{
                    console.error(err, 'fetch spot account error')
                }
                ).finally(()=>{
                    if (!this.wsIsConnecting) {
                        this.availableLoopFetch = setTimeout(()=>this.getMarketAvailable(), 3e3)
                    }
                    this.getMarketAvailableIsLoading = false
                }
                )
            }
        }
    }
}),
_descriptor146 = _applyDecoratedDescriptor(_class.prototype, "setAccountLoop", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return flag=>{
            this.loopAccountSpot = flag
        }
    }
}),
_descriptor147 = _applyDecoratedDescriptor(_class.prototype, "updateBalanceByWsData", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (currency,available)=>{
            if (this.is_in_copy) {
                return
            }
            const oldBalance = this.balances_mulcharts[this.currSymbol.toLowerCase()] || [0, 0];
            const newBalance = currency.toUpperCase() === this.curr_b.toUpperCase() ? [oldBalance[0], available] : [available, oldBalance[1]];
            this.balances_mulcharts = _objectSpread({}, this.balances_mulcharts, {
                [this.currSymbol.toLowerCase()]: newBalance
            })
        }
    }
}),
_descriptor148 = _applyDecoratedDescriptor(_class.prototype, "fetchSpotGrid", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return async params=>{
            const currMarketOnly = $.cookie('curr_market_only');
            params['market'] = !currMarketOnly || currMarketOnly && currMarketOnly == '0' ? '' : this.currSymbol;
            let str = '';
            Object.keys(params).forEach(item=>{
                str += `&${item}=${params[item]}`
            }
            );
            str = '?' + str.substring(1, str.length);
            proTradeApi.spotGrid(str).then(res=>{
                if (res.code === 200) {
                    if (params.status && params.status === 'pending')
                        this.spot_grid_list = _objectSpread({}, this.spot_grid_list, {
                            pendingData: []
                        });
                    this.spot_grid_list.pendingData = res.data || [];
                    this.spot_grid_list.pendingPage = res.totalcount || 1;
                    if (params.status && params.status === 'finished') {
                        this.spot_grid_list = _objectSpread({}, this.spot_grid_list, {
                            historyData: []
                        });
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
    }
}),
_descriptor149 = _applyDecoratedDescriptor(_class.prototype, "updateCurrentOrder", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return data=>{
            this.order = data
        }
    }
}),
_descriptor150 = _applyDecoratedDescriptor(_class.prototype, "updateTabIndex", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return data=>{
            this.tabIndex = data
        }
    }
}),
_descriptor151 = _applyDecoratedDescriptor(_class.prototype, "fetchDelegateData", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (params,updateOrderTotal=false,init=false)=>{
            const {currSymbol, unified_account_status, is_isolated_margin} = this;
            if (!GLOBAL_PRO_TRADE.is_login)
                return false;
            let new_params = _objectSpread({}, params);
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
                proTradeApi.getNormalOrderList(_objectSpread({}, new_params)).then(res=>{
                    if (res && res.result) {
                        const list = res.order || [];
                        this.currentOrderNumber[orderTypeMap[params.type]] = list.length;
                        if (updateOrderTotal)
                            return;
                        this.order = [...list];
                        const markets = this.order.map(el=>el.market.replace('/', '_'));
                        const symbols = Object.keys(GLOBAL_PRO_TRADE.precision);
                        const noSymbolInfoArr = markets.reduce((a,c)=>{
                            if (!symbols.includes(c) && !a.includes(c)) {
                                a.push(c)
                            }
                            return a
                        }
                        , []);
                        if (noSymbolInfoArr.length > 0 && !init) {
                            try {
                                Promise.all(noSymbolInfoArr.map(el=>this.getMarketConfig(el)))
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
                proTradeApi.getAutoOrderList(_objectSpread({}, new_params)).then(res=>{
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
    }
}),
_descriptor152 = _applyDecoratedDescriptor(_class.prototype, "fetchOrderHistory", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return params=>{
            if (!GLOBAL_PRO_TRADE.is_login)
                return false;
            this.my_trade_list_table = _objectSpread({}, this.my_trade_list_table, {
                data: []
            });
            if (params.type === 0 || params.type === 6) {
                let paramsStr = this.assemblyParams(params, this.tabIndex);
                proTradeApi.getDelegateList(paramsStr).then(res=>{
                    if (res) {
                        this.my_trade_list_table = {
                            data: res.data || [],
                            page: params.page || 1
                        }
                    }
                }
                )
            } else {
                const {currSymbol, unified_account_status, is_isolated_margin} = this;
                let new_params = _objectSpread({}, params);
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
                proTradeApi.getAutoOrderList(_objectSpread({}, new_params)).then(res=>{
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
    }
}),
_descriptor153 = _applyDecoratedDescriptor(_class.prototype, "fetchHistoryDeal", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return params=>{
            if (!GLOBAL_PRO_TRADE.is_login) {
                return false
            }
            this.my_history_trades = _objectSpread({}, this.my_history_trades, {
                data: []
            });
            let paramsStr = this.assemblyParams(params, this.tabIndex);
            proTradeApi.getDelegateList(paramsStr).then(res=>{
                if (res) {
                    this.my_history_trades = {
                        data: res.data || [],
                        page: params.page || 1
                    }
                }
            }
            )
        }
    }
}),
_descriptor154 = _applyDecoratedDescriptor(_class.prototype, "fetchLoanManagement", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (params,activeType=0,loanDetailsSelection='1')=>{
            const {unified_account_status, is_isolated_margin, my_loan_management} = this;
            if (!GLOBAL_PRO_TRADE.is_login)
                return false;
            if (unified_account_status.is_portfolio_margin_account || is_isolated_margin) {
                this.my_loan_management = _objectSpread({}, my_loan_management, {
                    activeTypeBtn: activeType,
                    loanDetailsSelection,
                    isLoading: true,
                    data: []
                })
            } else {
                return false
            }
            const paramsStr = this.LoanManageAssemblyParams(params);
            const request = activeType === 0 ? proTradeApi.getLoanManagementList : proTradeApi.getLoanDetailsList;
            request(paramsStr).then(res=>{
                if (!res || this.my_loan_management.activeTypeBtn !== activeType)
                    return false;
                const {list, total, count} = (res === null || res === void 0 ? void 0 : res.data) || {};
                this.my_loan_management = _objectSpread({}, this.my_loan_management, {
                    data: list || [],
                    total: total || count || 0,
                    page: (params === null || params === void 0 ? void 0 : params.page) || 1
                })
            }
            ).catch(err=>{
                console.warn(err)
            }
            ).finally(()=>{
                this.my_loan_management = _objectSpread({}, this.my_loan_management, {
                    isLoading: false
                })
            }
            );
            const {page=1} = params || {};
            const nextPageParams = _objectSpread({}, params, {
                page: page + 1
            });
            const nextPageParamsStr = this.LoanManageAssemblyParams(nextPageParams);
            const nextPageRequest = activeType === 0 ? proTradeApi.getLoanManagementList : proTradeApi.getLoanDetailsList;
            nextPageRequest(nextPageParamsStr).then(res=>{
                if (!res || this.my_loan_management.activeTypeBtn !== activeType)
                    return false;
                const {list=[]} = (res === null || res === void 0 ? void 0 : res.data) || {};
                if (list.length > 0) {
                    this.my_loan_management = _objectSpread({}, this.my_loan_management, {
                        showNextPage: true
                    })
                } else {
                    this.my_loan_management = _objectSpread({}, this.my_loan_management, {
                        showNextPage: false
                    })
                }
            }
            )
        }
    }
}),
_descriptor155 = _applyDecoratedDescriptor(_class.prototype, "updateCurrentOrderNumberMinus1", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return type=>{
            if (this.currentOrderNumber[orderTypeMap[type]]) {
                this.currentOrderNumber[orderTypeMap[type]] -= 1
            }
        }
    }
}),
_descriptor156 = _applyDecoratedDescriptor(_class.prototype, "setTrustPrice", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (market,rate)=>{
            var ref40;
            const value = ((ref40 = this.multiPriceArr[market]) === null || ref40 === void 0 ? void 0 : ref40.priceStr) || rate;
            if (value) {
                PubSub.publish('EVENT_TRUST_PRICE', {
                    value
                });
                this.last_price = value
            }
        }
    }
}),
_descriptor157 = _applyDecoratedDescriptor(_class.prototype, "setTradeType", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return tradeType=>{
            this.tradeType = tradeType;
            this.setTrustPrice(this.currSymbol)
        }
    }
}),
_descriptor158 = _applyDecoratedDescriptor(_class.prototype, "initOrderListNumber", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (orderType=undefined)=>{
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
            }, ];
            if (orderType !== undefined) {
                params = params.filter(item=>item.type === orderType)
            }
            params.forEach(param=>{
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
    }
}),
_descriptor159 = _applyDecoratedDescriptor(_class.prototype, "changeMarketListMode", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            this.marketSimpleMode = !this.marketSimpleMode;
            if (window.collectEvent) {
                window.collectEvent('beconEvent', 'trade_streamlin_click', {
                    button_name: this.marketSimpleMode ? 'open' : 'close'
                })
            }
            localStorage.setItem('show_simple_mode', Number(this.marketSimpleMode) + '')
        }
    }
}),
_descriptor160 = _applyDecoratedDescriptor(_class.prototype, "changeMarketFoldMode", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            this.marketFoldMode = !this.marketFoldMode;
            if (!this.marketFoldMode) {
                const show = localStorage.getItem('show_simple_mode');
                this.marketSimpleMode = show && show * 1
            } else {
                this.marketSimpleMode = false
            }
            localStorage.setItem(`${is_ar ? 'ar_' : ''}${this.layoutMode}_show_fold_mode`, Number(this.marketFoldMode) + '');
            const {w2} = initLayoutW;
            this.setFoldMarketListLayout(this.marketFoldMode, 'fold')
        }
    }
}),
_descriptor161 = _applyDecoratedDescriptor(_class.prototype, "changeMarketAllFoldMode", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
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
    }
}),
_descriptor162 = _applyDecoratedDescriptor(_class.prototype, "setUnifiedAccountStatus", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return data=>{
            this.unified_account_status = data
        }
    }
}),
_descriptor163 = _applyDecoratedDescriptor(_class.prototype, "switchToClassicAccount", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return data=>{
            this.unified_account_status = _objectSpread({}, this.unified_account_status, {
                is_open_portfolio_margin: 0,
                is_portfolio_margin_account: 0
            })
        }
    }
}),
_descriptor164 = _applyDecoratedDescriptor(_class.prototype, "updateClassicAccountSpotSetting", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return key=>{
            this.classic_account_spot_setting[key] = !this.classic_account_spot_setting[key];
            localStorage.setItem('classic_account_spot_setting', JSON.stringify(this.classic_account_spot_setting))
        }
    }
}),
_descriptor165 = _applyDecoratedDescriptor(_class.prototype, "setShouldReCompute", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return shouldReCompute=>{
            this.shouldReCompute = shouldReCompute
        }
    }
}),
_descriptor166 = _applyDecoratedDescriptor(_class.prototype, "setStrategyChartResize", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            this.strategyChartResize++
        }
    }
}),
_descriptor167 = _applyDecoratedDescriptor(_class.prototype, "updatePollingData", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return (t,page=1)=>{
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
    }
}),
_applyDecoratedDescriptor(_class.prototype, "marketTradeTypeCurrent", [computed], Object.getOwnPropertyDescriptor(_class.prototype, "marketTradeTypeCurrent"), _class.prototype),
_descriptor168 = _applyDecoratedDescriptor(_class.prototype, "setLimitOrderTradeButtonSetting", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return val=>{
            this.tradeButtonSetting = val;
            localStorage.setItem('trade_button_setting', val)
        }
    }
}),
_applyDecoratedDescriptor(_class.prototype, "curMarketList", [computed], Object.getOwnPropertyDescriptor(_class.prototype, "curMarketList"), _class.prototype),
_descriptor169 = _applyDecoratedDescriptor(_class.prototype, "updateCurrOrderListType", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return val=>{
            this.currOrderListType = val
        }
    }
}),
_descriptor170 = _applyDecoratedDescriptor(_class.prototype, "updateCurrHistoryOrderListType", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return val=>{
            this.currHistoryOrderListType = val
        }
    }
}),
_descriptor171 = _applyDecoratedDescriptor(_class.prototype, "updateWsConnectStatus", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return isConnecting=>{
            this.wsIsConnecting = isConnecting;
            if (!isConnecting) {
                this.getMarketAvailable()
            }
        }
    }
}),
_applyDecoratedDescriptor(_class.prototype, "is_unified_account_disabled_coin", [computed], Object.getOwnPropertyDescriptor(_class.prototype, "is_unified_account_disabled_coin"), _class.prototype),
_applyDecoratedDescriptor(_class.prototype, "userUseAble", [computed], Object.getOwnPropertyDescriptor(_class.prototype, "userUseAble"), _class.prototype),
_descriptor172 = _applyDecoratedDescriptor(_class.prototype, "updateSearchedMarkets", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return val=>{
            this.searchedMarkets = val
        }
    }
}),
_descriptor173 = _applyDecoratedDescriptor(_class.prototype, "updateSearchText", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return val=>{
            this.searchText = val || ''
        }
    }
}),
_descriptor174 = _applyDecoratedDescriptor(_class.prototype, "clearSearchResult", [action], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function() {
        return ()=>{
            this.searchText = '';
            this.searchedMarkets = {
                spot: [],
                future: [],
                loan: []
            }
        }
    }
}),
_applyDecoratedDescriptor(_class.prototype, "hasLoanMenu", [computed], Object.getOwnPropertyDescriptor(_class.prototype, "hasLoanMenu"), _class.prototype),
_class);