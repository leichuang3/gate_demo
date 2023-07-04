import React, { useRef, memo, useEffect, useState } from 'react';
import Popup from 'reactjs-popup'

const ComNetValue = ({ symbol, className }) => {
    const [netInfo, setNetInfo] = useState({
        base_timestamp: 0,
        net: 0,
        etf_leverage: 0
    });
    const timer = useRef(null);
    const curIsETF = symbol.match(/3S|3L|5S|5L/g);
    useEffect(() => {
        init();
        loopInit();
        return () => {
            clearTimeout(timer.current)
        }
    }
        , [symbol]);
    const init = () => {
        if (!curIsETF)
            return;
        timer.current = setTimeout(() => {
            loopInit();
            init()
        }
            , 6e4)
    }
        ;
    const loopInit = () => {
        if (!curIsETF)
            return;
        proTradeApi.getNet(symbol).then(res => {
            if (res && res.data) {
                setNetInfo(_objectSpread({}, res.data))
            }
        }
        )
    };
    return (
        <Popup
            trigger={
                <div className={className}>
                    <span className='etf_underline'>{i18n_trade.netValue}:</span>
                    <span>{netInfo.net || '-'}</span>
                </div>
            }
            position='right center'
            on={['hover', 'focus']}
            className="popup-tooltips"
        >
            <div className='left_market_list_hover'>
                <div className='list_hover_tips_coin'>{g_init_netvalueTips}</div>
                <ul className='list_hover_tips_name'>
                    <li>
                        <span>{g_i18_rebalance_time}</span>
                        <span>{FormatTime(netInfo.base_timestamp * 1e3)}</span>
                    </li>
                    <li>
                        <span>{g_i18_rebalance_val}</span>
                        <span>{netInfo.base_price}</span>
                    </li>
                    <li>
                        <span>{lang_string('当前杠杆率')}</span>
                        <span>{netInfo.etf_leverage}</span>
                    </li>
                </ul>
            </div>
        </Popup >
    )
}

export default memo(ComNetValue)