import tradeTools from "./tradeTools";

window.websiteConfig = websiteConfigJson, 
window.currentWebsiteConfig = websiteConfigJson[sub_website_id];
window.contactUsConfig = {};
for (let a in websiteConfig)
    contactUsConfig[a] = {
        support: websiteConfig[a].support,
        business: websiteConfig[a].business
    };
window.getWebSiteConfig = (a) => {
    return a ? currentWebsiteConfig[a] : currentWebsiteConfig
}
window.website = websiteConfig[sub_website_id].key
window.subsite = "index" == website ? "" : website;
window.filterSubsiteMap = {
    turkey: [["Gate.io", getWebSiteConfig("name")]],
    malta: [["Gate.io", getWebSiteConfig("name")]],
    hongkong: [["Gate.io", getWebSiteConfig("name")]]
};
window.filterSubstationString = (a, b) => {
    if ("" == a || !filterSubsiteMap[a])
        return b;
    var c = b;
    return filterSubsiteMap[a].forEach(function (a) {
        c = b.replace(new RegExp(a[0], "g"), a[1])
    }),
        c
}


window.proTradeSocket = function() {
    let socket, pingTimer, lockReconnect = false, pollingLock = false, connectTimes = 0, reTimer = null, pingTimeOut, wss_url = getSpotWs(), market_name = GLOBAL_PRO_TRADE.currSymbol.toUpperCase(), is_portfolio_margin_account = GLOBAL_PRO_TRADE.is_portfolio_margin_account, precision_rate = tradeTools.getPrecisionConfig(GLOBAL_PRO_TRADE.currSymbol).precision_rate, proTvMode = spotAndFutureTvData.defaultResolution, tabMarkets = getMultiMarkets();
    if (/478|488|443|458|547/.test(window.location.host)) {
        wss_url = `wss://${window.location.host}/websocket`
    }
    window.currLineMode = proTvMode;
    let lineModeStore = window.currLineMode;
    let startTime;
    let _search = location.search == "" ? null : location.search.replace("?", "");
    function start_websocket() {
        socket = new WebSocket(wss_url);
        socket.onopen = function() {
            ping();
            const lsRefTime = $.cookie('change-reftime');
            if (lsRefTime) {
                socket_send_cmd(socket, 'ticker.set_subscription_change_timezone', [lsRefTime]);
                socket_send_cmd(socket, 'price.set_subscription_change_timezone', [lsRefTime])
            }
            if (window.location.href.indexOf('/trade') !== -1) {
                startSpotWebSocket();
                globalStore.updateWsConnectStatus(true)
            }
        }
        ;
        socket.onerror = function(error) {
            console.log('ws Error ');
            reconnect(window.currLineMode);
            clearPingTimer()
        }
        ;
        socket.onclose = function(error) {
            console.log('pro trade ws Closed ');
            reconnect(window.currLineMode);
            clearPingTimer()
        }
        ;
        socket.onmessage = function(e) {
            let obj = JSON.parse(e.data);
            if (obj.result === 'pong') {
                pong();
                return false
            }
            if (_search) {
                if (obj && obj.method && obj.method == _search) {
                    console.log('[指定消息(' + _search + ')查询]--->：', obj)
                }
            }
            if (window.currLineMode.toString() != lineModeStore.toString()) {
                lineModeStore = window.currLineMode;
                socket_send_cmd(socket, 'kline.subscribe', [market_name, currLineMode])
            }
            if (typeof obj.method !== 'undefined' && (obj.params || obj.result)) {
                PubSub.publish('TRADE_EVENT_' + obj.method, obj.params)
            }
        }
    }
    function startSpotWebSocket() {
        var depthPrecision = globalStore.deepValue || tradeTools.genDecimals(precision_rate);
        if (globalStore.orderBookTradeTabType !== ORDERBOOK_TRADE.TRADE) {
            getDefaultSpotChangeDecimals(market_name).then(res=>{
                depthPrecision = res.decimals || depthPrecision;
                socket_send_cmd(socket, 'depth.subscribe', [market_name, 30, depthPrecision])
            }
            )
        }
        if (globalStore.orderBookTradeTabType !== ORDERBOOK_TRADE.ORDER_BOOK) {
            socket_send_cmd(socket, 'trades.subscribe', [market_name])
        }
        socket_send_cmd(socket, 'ticker.subscribe', tabMarkets);
        socket_send_auth_cmd(socket, 'webandmobilebalance.subscribe', market_name.split('_'));
        switchSpotOrderWebsocket(localStorage.getItem('openOrder_type_select') * 1 || 0, is_portfolio_margin_account);
        socket_send_cmd(socket, 'kline.subscribe', [market_name, currLineMode])
    }
    const updatePriceSubscribe = debounceFn(markets=>{
        socket_send_cmd(socket, 'price.unsubscribe', []);
        if (markets && markets.length != 0) {
            socket_send_cmd(socket, 'price.subscribe', markets)
        }
    }
    , 1e3);
    function switchSpotOrderWebsocket(type, isUnifiedAccount, updateUID=false) {
        const OrderMap = {
            0: 'webandmobileorder',
            1: 'priceorders',
            2: 'timerorders',
            3: 'looporders',
            4: 'trailorders'
        };
        Object.values(OrderMap).forEach(item=>{
            unsubscribeByType(item)
        }
        );
        if (updateUID) {
            socket_send_cmd(socket, 'server.out_sign', []);
            socket_send_auth_cmd(socket, 'webandmobilebalance.subscribe', market_name.split('_'), isUnifiedAccount)
        }
        socket_send_auth_cmd(socket, `${OrderMap[type]}.subscribe`, [], isUnifiedAccount)
    }
    function socket_send_auth_cmd(socket1, cmd, params=[], isUnifiedAccount=is_portfolio_margin_account) {
        const mode_type = typeof isUnifiedAccount === 'number' && !!isUnifiedAccount || typeof isUnifiedAccount === 'string' && isUnifiedAccount === TRADE_MODE.CROSS_MARGIN;
        const auth = {
            method: "web",
            cookie: {
                pver_ws: pver_ws,
                uid,
                nickname: nickNameF,
                mode: mode_type ? 2 : 1
            }
        };
        if (socket1.readyState == 1) {
            let trade_type = TRADE_MODE.SPOT;
            if (mode_type) {
                trade_type = TRADE_MODE.CROSS_MARGIN
            }
            if (typeof isUnifiedAccount === 'string' && isUnifiedAccount === TRADE_MODE.MARGIN) {
                trade_type = TRADE_MODE.MARGIN
            }
            let msg = {
                id: get_rand_int(1e7),
                method: cmd,
                params: params,
                auth,
                type: trade_type
            };
            socket1 && socket1.send(JSON.stringify(msg))
        }
    }
    function socket_send_cmd(skt, cmd, params, id) {
        if (!skt) {
            skt = socket
        }
        if (skt && skt.readyState == 1) {
            if (!params)
                params = [];
            var msg = {
                id: id || get_rand_int(1e7),
                method: cmd,
                params: params
            };
            skt && skt.send(JSON.stringify(msg))
        }
    }
    function reconnect(kline_mode, connectFromReact) {
        globalStore.updateWsConnectStatus(false);
        if (connectFromReact)
            pollingLock = false;
        if (lockReconnect || pollingLock)
            return;
        lockReconnect = true;
        console.log('重连增加http请求');
        try {
            globalStore.orderBookTradeTabType !== ORDERBOOK_TRADE.TRADE && window.froceUpdateSpotOrderBook()
        } catch (error) {}
        try {
            globalStore.orderBookTradeTabType !== ORDERBOOK_TRADE.ORDER_BOOK && window.froceUpdateSpotLatestDeal()
        } catch (error) {}
        if (typeof reTimer != 'undefined')
            clearTimeout(reTimer);
        reTimer = setTimeout(function() {
            start_websocket(wss_url);
            if (window.location.href.indexOf('/trade') !== -1) {
                startSpotWebSocket()
            }
            lockReconnect = false
        }, 5e3)
    }
    function unsubscribeByType(type) {
        try {
            if (socket && socket.send) {
                socket.send('{"method":"' + type + '.unsubscribe", "params":[]}')
            }
        } catch (error) {
            console.log('unsubscribe err:' + type)
        }
    }
    function unsubscribeAll() {
        try {
            if (socket && socket.send && socket.readyState == 1) {
                socket.send('{"method":"depth.unsubscribe", "params":[]}');
                socket.send('{"method":"trades.unsubscribe", "params":[]}');
                socket.send('{"method":"ticker.unsubscribe", "params":[]}');
                socket.send('{"method":"price.unsubscribe", "params":[]}');
                socket.send('{"method":"kline.unsubscribe", "params":[]}');
                socket.send('{"method":"webandmobilebalance.unsubscribe", "params":[]}');
                socket.send('{"method":"webandmobileorder.unsubscribe", "params":[]}');
                socket.send('{"method":"priceorders.unsubscribe", "params":[]}');
                socket.send('{"method":"timerorders.unsubscribe", "params":[]}');
                socket.send('{"method":"looporders.unsubscribe", "params":[]}');
                socket.send('{"method":"trailorders.unsubscribe", "params":[]}')
            }
        } catch (error) {}
    }
    function closeSpotWebSocket() {
        try {
            if (socket && socket.send && socket.readyState == 1) {
                socket.send('{"method":"depth.unsubscribe", "params":[]}');
                socket.send('{"method":"trades.unsubscribe", "params":[]}');
                socket.send('{"method":"ticker.unsubscribe", "params":[]}');
                socket.send('{"method":"kline.unsubscribe", "params":[]}');
                socket.send('{"method":"webandmobilebalance.unsubscribe", "params":[]}');
                socket.send('{"method":"webandmobileorder.unsubscribe", "params":[]}');
                socket.send('{"method":"priceorders.unsubscribe", "params":[]}');
                socket.send('{"method":"timerorders.unsubscribe", "params":[]}');
                socket.send('{"method":"looporders.unsubscribe", "params":[]}');
                socket.send('{"method":"trailorders.unsubscribe", "params":[]}')
            }
        } catch (error) {}
    }
    function ping() {
        proTradeSocket.startTime = new Date();
        socket_send_cmd(socket, 'server.ping');
        pingTimeOut = setTimeout(()=>{
            clearPingTimer();
            if (socket.readyState === 1) {
                globalStore.setTime(2e3);
                console.log('pong too late, close connection...');
                socket.close();
                reconnect(window.currLineMode)
            } else if ([2, 3].includes(socket.readyState)) {
                globalStore.setTime(900);
                console.log('pong too late, reconnect....');
                reconnect(window.currLineMode)
            }
        }
        , 1e4)
    }
    function pong() {
        let now = new Date() - proTradeSocket.startTime;
        globalStore.setTime(now);
        clearTimeout(pingTimeOut);
        pingTimer = setTimeout(ping, 1e4)
    }
    function clearPingTimer() {
        if (pingTimer) {
            clearTimeout(pingTimer);
            pingTimer = null
        }
    }
    function get_rand_int(max) {
        return Math.floor(Math.random() * Math.floor(max))
    }
    function switchMarketHandler(key, obj) {
        tabMarkets = getMultiMarkets();
        market_name = obj.currSymbol;
        precision_rate = tradeTools.getPrecisionConfig(market_name).precision_rate;
        var depthPrecision = tradeTools.genDecimals(precision_rate);
        if (globalStore.orderBookTradeTabType !== ORDERBOOK_TRADE.TRADE) {
            getDefaultSpotChangeDecimals(market_name).then(res=>{
                depthPrecision = res.decimals || depthPrecision;
                socket_send_cmd(socket, 'depth.subscribe', [market_name, 30, depthPrecision])
            }
            )
        }
        if (globalStore.orderBookTradeTabType !== ORDERBOOK_TRADE.ORDER_BOOK) {
            socket_send_cmd(socket, 'trades.subscribe', [market_name])
        }
        socket_send_cmd(socket, 'ticker.subscribe', tabMarkets);
        socket_send_auth_cmd(socket, 'webandmobilebalance.subscribe', market_name.split('_'));
        socket_send_cmd(socket, 'kline.subscribe', [market_name, currLineMode]);
        const lsRefTime = $.cookie('change-reftime');
        if (lsRefTime) {
            socket_send_cmd(socket, 'ticker.set_subscription_change_timezone', [lsRefTime]);
            socket_send_cmd(socket, 'price.set_subscription_change_timezone', [lsRefTime])
        }
    }
    function switchOrderBookAndTrade({type, symbol}) {
        const market_name1 = symbol.toUpperCase();
        let precision_rate1 = tradeTools.getPrecisionConfig(market_name1).precision_rate;
        var depthPrecision = globalStore.deepValue || tradeTools.genDecimals(precision_rate1);
        if (type == ORDERBOOK_TRADE.ORDER_BOOK) {
            getDefaultSpotChangeDecimals(market_name1).then(res=>{
                depthPrecision = res.decimals || depthPrecision;
                socket_send_cmd(socket, 'depth.subscribe', [market_name1, 30, depthPrecision])
            }
            );
            socket_send_cmd(socket, 'trades.unsubscribe', [])
        } else if (type == ORDERBOOK_TRADE.TRADE) {
            socket_send_cmd(socket, 'trades.subscribe', [market_name1]);
            socket_send_cmd(socket, 'depth.unsubscribe', [])
        } else {
            getDefaultSpotChangeDecimals(market_name1).then(res=>{
                depthPrecision = res.decimals || depthPrecision;
                socket_send_cmd(socket, 'depth.subscribe', [market_name1, 30, depthPrecision])
            }
            );
            socket_send_cmd(socket, 'trades.subscribe', [market_name1])
        }
    }
    return {
        start_websocket,
        socket_send_cmd,
        unsubscribeByType,
        switchMarketHandler,
        unsubscribeAll,
        closeSpotWebSocket,
        startSpotWebSocket,
        socket,
        switchSpotOrderWebsocket,
        updatePriceSubscribe,
        switchOrderBookAndTrade
    }
}();