import React, { forwardRef } from 'react'
import { WithDefaultImg } from '../index';
import { Tooltips } from '../common';
import { inject, observer } from 'mobx-react';
import tradeTools from '@/utils/tradeTools';

const SpotMarketItem = (props, ref145) => {
    var { store, item, index, style, isMarketInfoHover = false, isFav, changeFav, switchMarket, switch_sort, ...others } = props
    const { marketFoldMode, marketSimpleMode, setTrustPrice, spot_lerverage } = store;
    const P_DOM = (
        <p className='coin_en_name'>
            {item.curr_a.toUpperCase()}
            <em className='special_symbol'>{`/${item.curr_b.toUpperCase()}`}</em>
        </p>
    );

    const getUnitSymbol = curr_b => {
        let symbol = '$';
        if (curr_b === 'CNYX' || curr_b === 'CNY') {
            symbol = '￥'
        } else if (curr_b === 'USD') {
            symbol = '$'
        } else {
            symbol = tradeTools.get_currency_unitSymbol(curr_b)
        }
        return symbol
    }
        ;
    const changePriceToLocal = (price, curr_b) => {
        let decimals_fiatRate = tradeTools.get_bid_or_ask_decimals(price, curr_b);
        const currPriceToLocal = price * decimals_fiatRate.fiat_rate;
        let localPrice = currPriceToLocal.toFixed(2);
        if (localPrice === '0.00')
            localPrice = currPriceToLocal.toFixed(6);
        if (Math.abs(tradeTools.transferToNumber(currPriceToLocal).split('.')[0]) < 1) {
            var ref146;
            let localDecimalDigit = currPriceToLocal ? (ref146 = tradeTools.transferToNumber(currPriceToLocal).split('.')[1]) === null || ref146 === void 0 ? void 0 : ref146.length : '';
            localPrice = tradeTools.transferToNumber(currPriceToLocal.toFixed(localDecimalDigit > 12 ? 12 : localDecimalDigit))
        }
        return localPrice
    }
        ;
    const localPrice = changePriceToLocal(item.rate, item.curr_b);
    const showHoverCoinName = !marketSimpleMode && window.innerWidth <= 1441 && item.symbol.length >= 4;
    const handleMarketItemClick = tradeTools.throttle(item1 => {
        switchMarket(item1.pair.toUpperCase());
        setTrustPrice(item1.pair, item1.rate);
        tradeTools.setPageTitle(item1.rate, item1.curr_a.toUpperCase(), item1.curr_b.toUpperCase())
    }
        , 500);
    return (
        <div
            style={style}
            ref={ref145}
            key={index}
            onClick={() => handleMarketItemClick(item)}
            className="marketlist_view_item"
            data-pair={item.pair.toUpperCase()}
            {...others}
        >
            {
                marketFoldMode && !isMarketInfoHover ?
                    <div className='marketlist_fold_item'>
                        <div className='marketlist_view_item_coin'>{P_DOM}</div>
                        <p className={`marketlist_view_item_percent ${item.trend === 'up' ? 'font-add-color' : 'font-dec-color'}`}>
                            {item.trend === 'up' ? '+' : null}{item.rate_percent}%
                        </p>
                    </div> :
                    <>
                        <div className='marketlist_view_item_coin'>
                            <div className={`icon tradeiconfont icona-20px-Star-fill fav-icon hover-brand ${isFav ? 'active' : ''}`}
                                data-click-event="trade_list_select_click"
                                data-collect-params={`{"button_name":"${!isFav ? 'remove' : 'add'}"}`}
                                onClick={
                                    e => {
                                        e.stopPropagation();
                                        e.preventDefault && e.preventDefault();
                                        changeFav(isFav, item.pair)
                                    }
                                }
                            ></div>
                            <WithDefaultImg
                                className="icon_img"
                                src={`/images/coin_icon/64/${item.curr_a.toLowerCase()}.png`}
                                alt={`${item.curr_a}`}
                                defaultImg="/images/coin_icon/64/0.png"
                            ></WithDefaultImg>
                            <div className='coin-name-container'>
                                {showHoverCoinName ? <Tooltips
                                    position="top"
                                    label={`${item.symbol.toUpperCase()}/${item.curr_b.toUpperCase()}`}
                                >
                                    {P_DOM}
                                </Tooltips> : P_DOM}
                                <span className='coin-full-name-container'>
                                    {
                                        item.multiple && Number(item.multiple) !== 0 && spot_lerverage ?
                                            <span className='margin_multiple_show'>
                                                {item.multiple} <i>X</i>
                                            </span> : null
                                    }
                                    <span className='coin-full-name'>
                                        {item.name}
                                    </span>
                                </span>
                            </div>
                        </div>
                        <div className='marketlist_view_price fw400'>
                            <p className={`${CommonFormatPrice(item.rate).length > 9 ? `spot_scale_price` : ''}`}>
                                {CommonFormatPrice(item.rate)}
                            </p>
                            {GLOBAL_PRO_TRADE.curr_fiat == 'USD' && (item.curr_b.toUpperCase() == 'USD' || item.curr_b.toUpperCase() == 'USDT') ? '' :
                                <span className={`fiat-price ${CommonFormatPrice(item.rate).length > 9 ? `fiat_price_spot` : ''}`}>
                                    {GLOBAL_PRO_TRADE.fiat_rates[GLOBAL_PRO_TRADE.curr_fiat]['symbol']}{localPrice}
                                </span>
                            }
                        </div>
                        {
                            switch_sort == 2 ?
                                <div className='marketlist_view_percent fw400'>
                                    <p className={`marketlist_view_item_percent ${item.trend === 'up' ? 'font-add-color' : 'font-dec-color'}`}>
                                        {item.trend === 'up' ? '+' : null}{item.rate_percent}%
                                    </p>
                                    <span className='trade-volume'>{getUnitSymbol(item.curr_b)}{tradeTools.conversionUnit(item.vol_b)}</span>
                                </div>
                                :
                                <div className='marketlist_view_percent fw400'>
                                    <span className='trade-volume'>{getUnitSymbol(item.curr_b)}{tradeTools.conversionUnit(item.vol_b)}</span>
                                    <p className={`marketlist_view_item_percent ${item.trend === 'up' ? 'font-add-color' : 'font-dec-color'}`}>
                                        {item.trend === 'up' ? '+' : null}{item.rate_percent}%
                                    </p>
                                </div>
                        }

                    </>
            }

        </div>
    )
}

export default inject('store')(observer(forwardRef(SpotMarketItem)))