import React from 'react'
import { NoRecord } from '../common';
import { SpotMarketList, FutureMarketList, LoanMarketList } from '../market';
import { inject, observer } from 'mobx-react';

const SearchResult = inject('store')(observer(function ({ store, isMarketInfoHover = false }) {
    const { searchedMarkets, setTabMarketType, setTabMarketTypeBeforeSearch } = store;
    const handleClickTitle = val => {
        setTabMarketType(val);
        setTabMarketTypeBeforeSearch(val)
    }
        ;
    if (searchedMarkets.spot.length === 0 && searchedMarkets.future.length === 0 && searchedMarkets.loan.length === 0) {
        return <NoRecord style={{ marginTop: 46 }} />
    }
    return <>
        {
            searchedMarkets.spot.length > 0 ?
                <div className="market_list_search_result_wrap">
                    <div className="market_list_search_result_title" onClick={() => handleClickTitle(MENU_MARKET.SPOT)}>
                        <span>{lang_string('现货')}({searchedMarkets.spot.length})</span>
                        <span className="icon iconfont icon-a-12px-jiantou-you"></span>
                    </div>
                    <SpotMarketList isMarketInfoHover={isMarketInfoHover}></SpotMarketList>
                </div> : null
        }
        {
            searchedMarkets.future.length > 0 ?
                <div className="market_list_search_result_wrap">
                    <div className="market_list_search_result_title" onClick={() => handleClickTitle(MENU_MARKET.CONTRACT)}>
                        <span>{lang_string('合约')}({searchedMarkets.future.length})</span>
                        <span className="icon iconfont icon-a-12px-jiantou-you"></span>
                    </div>
                    <FutureMarketList isMarketInfoHover={isMarketInfoHover}></FutureMarketList>
                </div> : null
        }
        {
            searchedMarkets.loan.length > 0 ?
                <div className="market_list_search_result_wrap">
                    <div className="market_list_search_result_title" onClick={() => handleClickTitle(MENU_MARKET.LOAN)}>
                        <span>{lang_string('借贷')}({searchedMarkets.loan.length})</span>
                        <span className="icon iconfont icon-a-12px-jiantou-you"></span>
                    </div>
                    <LoanMarketList isMarketInfoHover={isMarketInfoHover}></LoanMarketList>
                </div> : null
        }

    </>

}));

export default SearchResult