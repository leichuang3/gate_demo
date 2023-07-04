import { useRouter } from "next/router"
import React, { useEffect } from 'react'
import PubSub from 'pubsub-js'
// import Script from "next/script";
import dynamic from "next/dynamic";
const TradePage = dynamic(() => import('../../components/trade/TradePage'), { ssr: false })
const TRADE_MODE = {
    SPOT: 'spot',
    MARGIN: 'margin',
    CROSS_MARGIN: 'cross_margin'
};
export default function Trade({ store }) {
    const router = useRouter();
    const { market: market2 } = router.query;
    const updateBalance = (key, data) => {
        // const {updateBalanceByWsData, marketTradeTypeCurrent} = store;
        // if (marketTradeTypeCurrent === TRADE_MODE.MARGIN)
        //     return;
        // if (data && data.length > 0) {
        //     const {available, currency} = data[0];
        //     updateBalanceByWsData(currency, available)
        // }
    }
    useEffect(() => {
        // globalStore.setAccountLoop(true);
        PubSub.subscribe('TRADE_EVENT_webandmobilebalance.update', updateBalance);
        return () => {
            PubSub.unsubscribe('TRADE_EVENT_webandmobilebalance.update', updateBalance)
        }
    }, [])
    return (
        <div id="trade-panel">
            {/* <Script src="/jquery.min.js"></Script>
            <Script src="/globalTrade.js"></Script>
            <Script src="/jquery.lazyload.js"></Script>
            <Script src="/jquery.common.tools.js"></Script> */}
            <TradePage></TradePage>
        </div>
    )
}