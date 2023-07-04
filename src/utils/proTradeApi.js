import axios from 'axios'
import Cookies from 'js-cookie';
import Qs from 'qs';

const gateAxios = function() {
    var instance = axios.create({
        baseURL: "https://www.gate.io",
        timeout: 60000,
        withCredentials: true
    });
    instance.interceptors.request.use(config=>{
        let tempData = config.method.toLowerCase() === 'get' ? config.params : config.data;
        config.data = Qs.stringify(config.data);
        if (Cookies.get('is_on')) {
            let token = Cookies.get('csrftoken');
            token && (config.headers.csrftoken = token)
        }
        return config
    }
    , error=>Promise.error(error));
    instance.interceptors.response.use(res=>{
        if (res.status === 200) {
            if (typeof res.data.resMsg != 'undefined' && Number(res.data.resMsg.code) === 0) {
                return Promise.resolve(res.data)
            } else {
                return Promise.resolve(res.data)
            }
        } else {
            return Promise.reject(res.data)
        }
    }
    , error=>{
        const {response} = error;
        if (response) {
            return Promise.reject(response)
        } else {}
    }
    );
    return instance
}();

const proTradeApi = function(){
    function exchangesFundflow(params) {
        return gateAxios.post(`/apiwap/exchangesFundflow `, params)
    }
    function globalBigTrades(params) {
        return gateAxios.post(`/apiwap/globalBigTrades `, params)
    }
    function largeTransactions(params) {
        return gateAxios.post(`/apiwap/largeTransactions `, params)
    }
    function coinTopHolders(params) {
        return gateAxios.post(`/apiwap/coinTopHolders `, params)
    }
    function getNewList(params) {
        return gateAxios.post(`/json_svr/query/?u=15&type=get_news&lang=${GLOBAL_PRO_TRADE.lang}&lastid=0`, params)
    }
    function getCoinInfo(params) {
        return gateAxios.post(`/apiwap/getCoinInfo`, params)
    }
    function getCoinTips(params) {
        return gateAxios.post(`/json_svr/query?type=get_coininfo_tip`, params)
    }
    function globalMarkets(params) {
        return gateAxios.post(`/apiwap/globalMarkets`, params)
    }
    function getTradeHistory(params) {
        return gateAxios.get(`/api2/1/tradeHistory/${params.curr_a}_ ${params.curr_b}`, params)
    }
    function getAllMarketList(params) {
        return gateAxios.post('/json_svr/get_leftbar/?u=128&c=' + tradeTools.rand(0, 1e6), {
            is_futures_return: 0
        })
    }
    function getMarketList(category) {
        return gateAxios.post('/json_svr/get_leftbar_v2', {
            category
        })
    }
    function getMarketMenuConfig(params) {
        return gateAxios.get(`/json_svr/get_market_menu_config`)
    }
    function getDelegateList(paramsStr) {
        return gateAxios.get('/json_svr/query/' + paramsStr)
    }
    function getBorrowRecords(params) {
        const paramsStr = tradeTools.joinParams(params);
        return gateAxios.get('/uni_loan/borrow/record' + paramsStr)
    }
    function getBorrowCoins(params) {
        const paramsStr = tradeTools.joinParams(params);
        return gateAxios.get('/cross_margin/get_borrow_coins' + paramsStr)
    }
    function getLoanManagementList(paramsStr) {
        let apiUrl = globalStore.is_isolated_margin ? `/uni_loan/borrow/record/` : `/cross_margin/get_borrow_coins/`;
        return gateAxios.get(apiUrl + paramsStr)
    }
    function getLoanDetailsList(paramsStr) {
        let apiUrl = globalStore.is_isolated_margin ? `/uni_loan/borrow/record` : `/cross_margin/get_borrow_records/`;
        return gateAxios.get(apiUrl + paramsStr)
    }
    function getMarketConfig(market) {
        return gateAxios.get(`/symbol_info?symbol=${market}`)
    }
    function spotGrid(paramsStr) {
        return gateAxios.get('/strategybot/get_all_strategy_profit/' + paramsStr)
    }
    function stopGrid(paramsStr) {
        return gateAxios.delete('/grid_trading/' + paramsStr)
    }
    function addFav(params) {
        return gateAxios.post('/json_svr/query?u=29&c=' + tradeTools.rand(0, 1e6), params)
    }
    function getLastRates(params) {
        return gateAxios.post(`/apiwap/getLastRates`, params)
    }
    function getDepthGateData(params) {
        return gateAxios.post('/global_depth', params)
    }
    function getTvklineData(params) {
        return gateAxios.get('/json_svr/query/?u=10&c=' + Math.floor(Math.random() * Math.floor(1e7)) + '&type=tvkline&symbol=' + params.symbol.toLowerCase() + '&from=' + params.from + '&to=' + params.to + '&interval=' + params.interval)
    }
    function spotExchange(type, params) {
        return gateAxios.post('/json_svr/' + type + '/?u=1&c=' + tradeTools.rand(0, 1e6), params)
    }
    function cancelExchange(params) {
        return gateAxios.post('/json_svr/exchange/?u=1&c=' + tradeTools.rand(0, 1e6), params)
    }
    function cancelAllExchange(params) {
        return gateAxios.post('/json_svr/exchange/?u=1&c=' + tradeTools.rand(0, 1e6), params)
    }
    function cancelAutoOrder(type, params) {
        return gateAxios.post('/json_svr/' + type + '/?u=1&c=' + tradeTools.rand(0, 1e6), params)
    }
    function cancelAllAutoOrder(params) {
        return gateAxios.post('/json_svr/cancel_all_auto_order' + '/?u=1&c=' + tradeTools.rand(0, 1e6), params)
    }
    function setMarginUserSetting(params) {
        return gateAxios.post('/json_svr/set_margin_user_setting', params)
    }
    function logOut(params) {
        return gateAxios.get('/logout', params)
    }
    function getServerTime(params) {
        return gateAxios.post('/server_time?c=' + tradeTools.rand(0, 1e6) + '&type=sv_time')
    }
    function getMarketinfo(params) {
        return gateAxios.get('/api2/1/marketinfo?c=' + tradeTools.rand(0, 1e6))
    }
    function quickModifyOrder(params) {
        return gateAxios.post('/json_svr/exchange/?u=1&c=' + tradeTools.rand(0, 1e6), params)
    }
    function getMulMarketPriceAndOrder(params) {
        return gateAxios.post('/json_svr/query/?u=13&c=' + tradeTools.rand(0, 1e6), params)
    }
    function stopOrderTrade(params) {
        return gateAxios.post(`/json_svr/stop_order_trade?c=${tradeTools.rand(0, 1e6)}`, params)
    }
    function getRestoration(name) {
        return gateAxios.get(`/app/trade_tv/${name.toLowerCase()}`)
    }
    function loopOrderDetail(name, id) {
        return gateAxios.get(`/json_svr/loop_order_detail/${name}/${id}`)
    }
    function conInfoExist(name) {
        const params = {
            type: 'check_coin_exist_form_bigdata',
            symbol: name + '_usdt'
        };
        return gateAxios.post(`/json_svr/query`, params)
    }
    function getRunningAutoOrder(data) {
        return gateAxios.get('/json_svr/get_running_auto_order', data)
    }
    function unifiedAccountStatus(params) {
        return gateAxios.get('/cross_margin/portfolio_margin_enable')
    }
    function switchUnifiedAccountStatus(params) {
        return gateAxios.post('/user_settings/set_portfolio_margin_switch', params)
    }
    function enablePortfolioMarginAccount(params) {
        return gateAxios.post('/cross_margin/portfolio_margin_enable', params)
    }
    function getEstimatedInterestRate(params) {
        return gateAxios.get('/cross_margin/get_estimated_interest_rate', {
            params
        })
    }
    function getUnifiedAccountAssetInfo(params) {
        return gateAxios.get('/cross_margin/balance', {
            params
        })
    }
    function getUnifiedAccountOpenConditions() {
        return gateAxios.get('/cross_margin/get_cross_margin_configs')
    }
    function switchAccountMode(params) {
        return gateAxios.post('/user_settings/set_portfolio_margin_account_status', params)
    }
    function getUnifiedMarginRate() {
        return gateAxios.get(`${futures_testnet_url_prefix}/${baseUrlPrefix}/${globalStoreProFuture.settle_coin}/funds`)
    }
    function getOrderBookList(symbol, interval) {
        let url = `/json_svr/query?u=11&c=260136&type=ask_bid_list_table&limit=30&symbol=${symbol}`;
        if (interval)
            url = `${url}&depth_interval=${interval}`;
        return gateAxios.get(url)
    }
    function getNet(market) {
        return gateAxios.post(`/get_etf_net`, {
            market
        })
    }
    function marginOrder(params) {
        return gateAxios.post(`/json_svr/exchange/?u=1` + tradeTools.rand(0, 1e6), {
            params
        })
    }
    function dailyRate(params) {
        return gateAxios.get(`/uni_loan/day/estimation/rate`, {
            params
        })
    }
    function userMigrateStatus() {
        return gateAxios.get(`/uni_loan/user/migrate/status?isRefresh=1`)
    }
    function userMigrate(params) {
        return gateAxios.post(`/uni_loan/user/migrate`, params)
    }
    function marginMaxLimit(params) {
        return gateAxios.post(`/uni_loan/borrowable/limit`, params)
    }
    function get_copy_account_exists(params) {
        return gateAxios.get(`/account/appoint_type_sub_account_exists?type=${params.type}`)
    }
    function get_follow_order_status(params) {
        return gateAxios.get(`/user_setting/get_follow_order_status`, params)
    }
    function set_follow_order_status(params) {
        return gateAxios.post(`/user_setting/set_follow_order_status`, params)
    }
    function follow_order_market_list(params) {
        return gateAxios.get(`/spot_copy_trading/follow_order_market_list`, params)
    }
    function transfer_available(params) {
        return gateAxios.post(`/spot_copy_trading/transfer_available`, params)
    }
    function transfer_handle(params) {
        return gateAxios.post(`/spot_copy_trading/transfer_handle`, params)
    }
    function getOrderDetail(id) {
        return gateAxios.get(` /json_svr/query?type=get_history_deal_by_orderid&order_id=${id}`)
    }
    function getCrossMarginAvailable(market) {
        return gateAxios.get(`/cross_margin/balance?market=${market}`)
    }
    function setCrossMarginLeverage(params) {
        return gateAxios.post(`/cross_margin/set_leverage`, params)
    }
    function getSpotAvailable(market) {
        return gateAxios.post(`/account_funds/spot/get_market_available`, market)
    }
    function getCurrentSpotTicker({type, pair}) {
        return gateAxios.get(`/json_svr/currency/price?type=${type}&pair=${pair}`)
    }
    function getIsolatedAvailable(params) {
        return gateAxios.post(`/json_svr/get_margin_account`, params)
    }
    function getNormalOrderList(params) {
        return gateAxios.get(`/json_svr/query?type=limit_price_v2`, {
            params
        })
    }
    function getAutoOrderList(params) {
        return gateAxios.get(`/json_svr/query?type=get_auto_order`, {
            params
        })
    }
    return {
        getBorrowCoins,
        getBorrowRecords,
        globalBigTrades,
        exchangesFundflow,
        largeTransactions,
        coinTopHolders,
        getNewList,
        getCoinInfo,
        globalMarkets,
        getTradeHistory,
        getAllMarketList,
        getMarketList,
        getMarketMenuConfig,
        getDelegateList,
        getLoanManagementList,
        getLoanDetailsList,
        addFav,
        getLastRates,
        getDepthGateData,
        getTvklineData,
        spotExchange,
        cancelExchange,
        cancelAllExchange,
        cancelAutoOrder,
        cancelAllAutoOrder,
        setMarginUserSetting,
        logOut,
        getServerTime,
        getMarketinfo,
        quickModifyOrder,
        getMulMarketPriceAndOrder,
        getCoinTips,
        stopOrderTrade,
        getRestoration,
        loopOrderDetail,
        conInfoExist,
        spotGrid,
        stopGrid,
        getMarketConfig,
        getRunningAutoOrder,
        unifiedAccountStatus,
        switchUnifiedAccountStatus,
        enablePortfolioMarginAccount,
        getEstimatedInterestRate,
        getUnifiedAccountAssetInfo,
        getUnifiedAccountOpenConditions,
        switchAccountMode,
        getUnifiedMarginRate,
        getOrderBookList,
        getNet,
        marginOrder,
        dailyRate,
        userMigrateStatus,
        userMigrate,
        marginMaxLimit,
        get_copy_account_exists,
        get_follow_order_status,
        set_follow_order_status,
        follow_order_market_list,
        transfer_available,
        transfer_handle,
        getOrderDetail,
        getCrossMarginAvailable,
        getSpotAvailable,
        getIsolatedAvailable,
        getNormalOrderList,
        getAutoOrderList,
        setCrossMarginLeverage,
        getCurrentSpotTicker
    }
}

export default  proTradeApi()