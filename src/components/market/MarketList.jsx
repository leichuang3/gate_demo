import React from 'react'
import { MarketTabs, SpotMarketList, FutureMarketList, LoanMarketList } from './index';
import { WarningInfo, SearchResult } from '../common';
import { inject, observer } from 'mobx-react';
const MENU_MARKET = {
    SEARCHING: 'SEARCHING',
    SPOT: 'SPOT',
    CONTRACT: 'CONTRACT',
    LOAN: 'LOAN'
};

const MarketList = function ({store, isMarketInfoHover=false}) {
    const {marketSimpleMode, marketFoldMode, marketAllFoldMode, tabMarketType, unified_account_status, searchText} = store;
    return (
        <div className={`
        market-list-container
        ${isMarketInfoHover ? 'hover-show-marketList' : ''}
        ${searchText != '' ? 'marketList_in_search' : ''}
        ${isMarketInfoHover || marketSimpleMode || searchText != '' ? 'simple-market-list-mode' : ''}
        ${!isMarketInfoHover && marketFoldMode ? 'fold-market-list-mode' : ''}
        ${!isMarketInfoHover && marketAllFoldMode ? 'fold-all-market-list-mode' : ''}`}>
            <MarketTabs isMarketInfoHover={isMarketInfoHover} />
            <div className='marketlist_content'>
                {
                    !!unified_account_status.is_portfolio_margin_account && tabMarketType === 'SPOT' &&
                    <WarningInfo style={{ marginBottom: 16, marginTop: 8 }}
                        html={
                            <p dangerouslySetInnerHTML={{
                                __html: lang_string('spot.unified.account.swicth.tip', {
                                    account: `<a onclick="switchAccountMode(0)">${lang_string('经典账户')}</a>`
                                })
                            }}></p>
                        }
                    >

                    </WarningInfo>
                }
                {
                    tabMarketType === MENU_MARKET.SEARCHING && !marketFoldMode ?
                        <SearchResult isMarketInfoHover={isMarketInfoHover}></SearchResult> : null
                }
                {
                    tabMarketType === MENU_MARKET.SPOT && <SpotMarketList isMarketInfoHover={isMarketInfoHover}></SpotMarketList>
                }
                {

                    tabMarketType === MENU_MARKET.CONTRACT && <FutureMarketList isMarketInfoHover={isMarketInfoHover}></FutureMarketList>
                }
                {
                    tabMarketType === MENU_MARKET.LOAN && <LoanMarketList isMarketInfoHover={isMarketInfoHover}></LoanMarketList>
                }
            </div>
        </div>
    )
}

export default inject('store')(observer(MarketList))
