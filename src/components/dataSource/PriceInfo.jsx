import React from 'react';
import { inject, observer } from "mobx-react";
import { Tooltips, ComNetValue } from '@/components/common';
import JiantouFill from '@/assets/images/jiantou_fill.svg';

@inject('store')
@observer
class PriceInfo extends React.Component {
    render() {
        const { curIsETF, percent, tempPrice, tempCurrFiat, currPriceToLocal } = this.props;
        return <div className={`order_price ${curIsETF ? 'order_price_etf' : ''}`}>
            <div>
                <div className='entrust_price'>
                    <div className={`bid ${percent > 0 ? 'trade_up' : 'trade_down'}`}>
                        {tempPrice}
                    </div>
                    <span className={`${percent > 0 ? 'icon_up' : 'icon_down'}`}>
                        <JiantouFill
                            className={`icon-12 ${percent > 0 ? 'font-add-color' : 'font-dec-color'}`}
                        />
                    </span>
                </div>
                {
                    curIsETF && <ComNetValue
                        symbol={GLOBAL_PRO_TRADE.currSymbol}
                        className="order_book_net"
                    >
                    </ComNetValue>
                }
            </div>
            <div className='cny-usd'>
            </div>
            <div className='cny-usd'>
                {
                    currPriceToLocal && currPriceToLocal < 0.00001 ? <Tooltips
                        label={currPriceToLocal}
                        position="bottom"
                    >
                        <span className='cny-usd-price'>{tempCurrFiat}</span>
                    </Tooltips> : <span>{tempCurrFiat}</span>
                }
            </div>
        </div>

    }
    constructor(props) {
        super(props)
    }
}
export default PriceInfo