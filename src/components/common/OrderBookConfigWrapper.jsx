import React, { useState } from "react";
import { Checkbox } from '@mantine/core';
import { inject, observer } from "mobx-react";
import Popup from 'reactjs-popup'
import { useTradeStyles } from '@/utils/useStyles';
import CheckboxIcon from '@/assets/images/CheckboxIcon.svg';

const OrderBookConfigWrapper = inject('store')(observer(function ({store, type }) {
    const { classes } = useTradeStyles();
    const [sumChecked, setSumChecked] = useState(type === 'spot' ? localStorage.getItem('trade_order_config_sum') !== 'false' : localStorage.getItem('future_order_config_sum') !== 'false');
    const [quickChecked, setQuickChecked] = useState(type === 'spot' ? localStorage.getItem('trade_order_config_quick') === 'true' : false);
    const onChangeSum = () => {
        setSumChecked(!sumChecked);
        type === 'spot' ? localStorage.setItem('trade_order_config_sum', !sumChecked) : localStorage.setItem('future_order_config_sum', !sumChecked)
    }
        ;
    const onChangeQuick = () => {
        debugger
        setQuickChecked(!quickChecked);
        type === 'spot' && localStorage.setItem('trade_order_config_quick', !quickChecked)
    }
        ;
    return <Popup
        trigger={
            <div className="order_book_hover_icon">
                <span className="icon iconfont icon-a-20px-gengduo"></span>
            </div>
        }
        className="popup-orderbook"
        position="bottom right"
        overlayStyle={{
            background: 'transparent'
        }}
        on="click"
        arrow={false}
    >
        <div className="order_book_config">
            <div className="order_book_config_checked">
                <Checkbox
                    icon={({className})=>(<CheckboxIcon className={`icon trading_checkbox_icon ${className}`}/>)}
                    checked={sumChecked}
                    onChange={onChangeSum}
                    classNames={
                        {
                            root: classes.checkboxRoot,
                            label: classes.checkboxLabel,
                            icon: classes.checkboxIcon,
                            input: classes.checkboxInput
                        }
                    }
                    label={t('future.orderbook.total')}
                >

                </Checkbox>
            </div>

            {
                type === 'spot' && store.tradeButtonSetting === 'merge' && store.layoutMode !== LAYOUT_MODES.SIMPLE_TRADE ?
                    <div className="order_book_config_checked">
                        <Checkbox
                            icon={({className})=>(<CheckboxIcon className={`icon trading_checkbox_icon ${className}`}/>)}
                            checked={quickChecked}
                            onChange={onChangeQuick}
                            classNames={
                                {
                                    root: classes.checkboxRoot,
                                    label: classes.checkboxLabel,
                                    icon: classes.checkboxIcon,
                                    input: classes.checkboxInput
                                }
                            }
                            label={t('future.orderbook.buysell')}
                        >

                        </Checkbox>
                    </div> : null
            }
        </div>
    </Popup>

}));

export default OrderBookConfigWrapper