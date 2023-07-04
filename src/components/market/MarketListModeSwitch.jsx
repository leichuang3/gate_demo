import React from 'react'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { SwitchComponent } from '../common';
import { inject, observer } from 'mobx-react';

const MarketListModeSwitch = function ({ store }) {
    const { marketSimpleMode, changeMarketListMode } = store;
    return <Popup 
    position="top"
    className="popup-tooltips"
    on="hover"
    trigger={
        <div className="market-list-mode-switch-container">
            <SwitchComponent checked={marketSimpleMode} onChange={e => changeMarketListMode()} styles={{
                input: {
                    transform: 'scale(0.66667)'
                }
            }}></SwitchComponent>
        </div>
    }>
        <div style={{
            minWidth: is_cn ? '' : 75,
            textAlign: 'center',
            lineHeight: '12px'
        }}>{marketSimpleMode ? lang_string('Standard') : lang_string('精简模式')}</div>
    </Popup>
}
export default inject('store')(observer(MarketListModeSwitch))