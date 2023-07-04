import React from 'react'
import { MarketTypeItem, MarketListModeSwitch } from './index';
import { SearchInput, OverFlowDom } from '../common';
import { inject, observer } from 'mobx-react';

const MarketTabs = function ({store, isMarketInfoHover=false}) {
    const { curMarketList, loanList, searchText, updateSearchText, changeMarketFoldMode, marketFoldMode, marketAllFoldMode, tabMarketType, changeMarketAllFoldMode, marketMenu, setTabMarketType, updateSearchedMarkets, searchedMarkets, clearSearchResult, tabMarketTypeBeforeSearch, setTabMarketTypeBeforeSearch } = store;
    const changeTabs = type => {
        setTabMarketType(type);
        if (!(searchText != '' && type === MENU_MARKET.SEARCHING)) {
            setTabMarketTypeBeforeSearch(type)
        }
        if (searchText == '' && type !== MENU_MARKET.CONTRACT) {
            futureTickersSubscribe()
        }
        if (window.collectEvent) {
            const name_string = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
            window.collectEvent('beconEvent', 'trade_list_market_choose_click', {
                button_name: name_string
            })
        }
    }
        ;
    const handleChangeMarketFoldMode = type => {
        setTabMarketType(tabMarketTypeBeforeSearch);
        changeMarketFoldMode(type)
    }
        ;
    let foldIconName = '';
    switch (marketFoldMode) {
        case true:
            foldIconName = is_ar ? 'icona-20px-shouqicebian-fill c-8D93A6' : 'icona-20px-zhankaicebian-fill c-8D93A6';
            break;
        default:
            foldIconName = is_ar ? 'icona-20px-zhankaicebian-fill c-8D93A6' : 'icona-20px-shouqicebian-fill c-8D93A6';
            break
    }
    const selectedTab = marketMenu.find(o => {
        return o.market === tabMarketType
    }
    );
    const getSpotSearchedMarkets = value => {
        const spotTab = marketMenu.find(o => {
            return o.market === MENU_MARKET.SPOT
        }
        );
        if (!spotTab) {
            return []
        }
        const subMenu = spotTab.sub.map(o => {
            if (o.market.toUpperCase() === 'USD_S') {
                return 'USDT'
            }
            return o.market
        }
        );
        let sortData = {
            arr0: [],
            arr1: [],
            arr2: [],
            arr3: [],
            arr4: [],
            arr5: []
        };
        let searchText1 = value.toLowerCase();
        let marketListData = JSON.parse(JSON.stringify(curMarketList));
        function searchItem(item, sort) {
            var ref141, ref142, ref143;
            let c_a = item.curr_a.toLowerCase();
            let c_b = item.curr_b.toLowerCase();
            const fullName = `${c_a}/${c_b}`;
            if (sort === 0 && c_a.startsWith(searchText1)) {
                sortData.arr0.push(item)
            } else if (sort === 1 && c_a === searchText1) {
                sortData.arr1.push(item)
            } else if (sort === 2 && c_b === searchText1) {
                sortData.arr2.push(item)
            } else if (sort === 3 && c_a.indexOf(searchText1) > -1) {
                sortData.arr3.push(item)
            } else if (sort === 4 && c_b.indexOf(searchText1) > -1) {
                sortData.arr4.push(item)
            } else if (sort === 5 && (((ref141 = item.name) === null || ref141 === void 0 ? void 0 : ref141.toLowerCase().indexOf(searchText1)) > -1 || is_cn && ((ref142 = item.name_cn) === null || ref142 === void 0 ? void 0 : ref142.toLowerCase().indexOf(searchText1)) > -1 || ((ref143 = item.name_en) === null || ref143 === void 0 ? void 0 : ref143.toLowerCase().indexOf(searchText1)) > -1 || fullName.indexOf(searchText1) > -1)) {
                sortData.arr5.push(item)
            }
        }
        Object.keys(sortData).forEach((sortKey, index) => {
            Object.keys(marketListData).forEach(key => {
                const findSubIndex = subMenu.concat(['TRY']).indexOf(key.toUpperCase()) !== -1;
                if (findSubIndex) {
                    let data = marketListData[key];
                    if (data) {
                        if (Array.isArray(data)) {
                            for (let i = 0; i < data.length; i++) {
                                let item = data[i];
                                searchItem(item, index)
                            }
                        } else {
                            Object.keys(data).forEach(dataKey => {
                                const item = data[dataKey];
                                searchItem(item, index)
                            }
                            )
                        }
                    }
                }
            }
            )
        }
        );
        let searchArr = [...sortData.arr0, ...sortData.arr1, ...sortData.arr2, ...sortData.arr3, ...sortData.arr4, ...sortData.arr5];
        let obj = {};
        searchArr = searchArr.reduce((item, next) => {
            if (!obj[`${next.curr_a}_ ${next.curr_b}`]) {
                obj[`${next.curr_a}_ ${next.curr_b}`] = true;
                item.push(next)
            }
            return item
        }
            , []);
        return searchArr
    }
        ;
    const getLoanSearchedMarkets = value => {
        let sortData = {
            arr0: [],
            arr1: [],
            arr3: [],
            arr5: []
        };
        let searchText1 = value.toLowerCase();
        let data = loanList;
        function searchItem(item) {
            var ref141;
            let c_a = item.name.toLowerCase();
            if (c_a.startsWith(searchText1)) {
                sortData.arr0.push(item)
            } else if (c_a === searchText1) {
                sortData.arr1.push(item)
            } else if (c_a.indexOf(searchText1) > -1) {
                sortData.arr3.push(item)
            } else if (((ref141 = item.fullName) === null || ref141 === void 0 ? void 0 : ref141.toLowerCase().indexOf(searchText1)) > -1) {
                sortData.arr5.push(item)
            }
        }
        if (data) {
            if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                    let item = data[i];
                    searchItem(item)
                }
            } else {
                for (var i = 0; i < Object.values(data).length; i++) {
                    let item = Object.values(data)[i];
                    searchItem(item)
                }
            }
        }
        let searchArr = [...sortData.arr0, ...sortData.arr1, ...sortData.arr3, ...sortData.arr5];
        return searchArr
    }
        ;
    const getFutureSearchedMarkets = searchKey => {
        var ref141, ref142;
        var ref143;
        let usdt = (ref143 = (ref141 = globalStoreProFuture.allFutureContracts) === null || ref141 === void 0 ? void 0 : ref141.CONTRACT_USDT) !== null && ref143 !== void 0 ? ref143 : [];
        if (globalStoreProFuture.markte_black_list.usdt && globalStoreProFuture.markte_black_list.usdt.length != 0) {
            usdt = usdt.filter(i => globalStoreProFuture.markte_black_list.usdt.indexOf(i.name) == -1)
        }
        var ref144;
        let btc = (ref144 = (ref142 = globalStoreProFuture.allFutureContracts) === null || ref142 === void 0 ? void 0 : ref142.CONTRACT_BTC) !== null && ref144 !== void 0 ? ref144 : [];
        if (globalStoreProFuture.markte_black_list.btc && globalStoreProFuture.markte_black_list.btc.length != 0) {
            btc = btc.filter(i => globalStoreProFuture.markte_black_list.btc.indexOf(i.name) == -1)
        }
        let futureList = [...usdt, ...btc];
        const [sortArr0, sortArr1] = futureList.reduce((acc, cur) => {
            const fullName = cur.full_name.toLowerCase();
            const searchText1 = searchKey.toLowerCase();
            if (fullName.startsWith(searchText1)) {
                acc[0].push(cur)
            } else if (fullName.match(searchText1)) {
                acc[1].push(cur)
            }
            return acc
        }
            , [[], []]);
        return [...sortArr0, ...sortArr1]
    }
        ;
    const searchingFeature = searchText1 => {
        if (searchText1 == '') {
            setTabMarketType(tabMarketTypeBeforeSearch);
            clearSearchResult()
        }
        if (searchText1 && searchText1 != '') {
            if (!marketFoldMode) {
                setTabMarketType(MENU_MARKET.SEARCHING)
            }
            const spotMarkets = getSpotSearchedMarkets(searchText1);
            const futureMarkets = getFutureSearchedMarkets(searchText1);
            const loanMarkets = getLoanSearchedMarkets(searchText1);
            updateSearchedMarkets({
                spot: spotMarkets || [],
                future: futureMarkets || [],
                loan: loanMarkets || []
            })
        }
        updateSearchText(searchText1)
    };

    return (
        <div className="market_list_tabs_wrap">
            <div className={`market-list-tabs-container ${isMarketInfoHover ? 'market-list-tabs-container-hover' : ''}`}>
                {!marketFoldMode && <SearchInput isMarketInfoHover={isMarketInfoHover} onSearchTextChange={searchingFeature} tabMarketType={tabMarketType}></SearchInput>}
                <div className={`fold-market-list-button-container ${marketFoldMode ? 'marketFoldMode_tab' : ''}`}>
                    {
                        !marketAllFoldMode &&
                        <div
                            className="fold-market-list-button"
                            onClick={handleChangeMarketFoldMode}
                            data-click-event="trade_future_list_market_click"
                            data-collect-params={`{"button_name":"${marketFoldMode ? "1-open" : "close-half"}"}`}>
                            <span className={`icon tradeiconfont ${foldIconName}`}>
                            </span>
                        </div>
                    }
                    {
                        !marketFoldMode &&
                        <div
                            className="fold-market-list-button toggle"
                            onClick={changeMarketAllFoldMode}
                            style={{ transform: marketAllFoldMode ? is_ar ? 'rotate(0)' : 'rotate(180deg)' : is_ar ? 'rotate(180deg)' : 'rotate(0)' }}
                        >
                            <span className="icon tradeiconfont icona-20px-shouqiquanbu-fill c-8D93A6"></span>
                        </div>
                    }
                </div>
            </div>
            {/* {
                v &&
                <div className="fold_mode_search_input_container">
                    <SearchInput isMarketInfoHover={isMarketInfoHover} onSearchTextChange={searchingFeature} tabMarketType={tabMarketType}></SearchInput>
                </div>
            } */}
            {
                marketFoldMode && selectedTab &&
                <div className="selected-market-type">
                    {selectedTab.title[window.GLOBAL_PRO_TRADE.lang] ? selectedTab.title[window.GLOBAL_PRO_TRADE.lang] : selectedTab.title.en}
                </div>
            }
            <div className={`market_list_menu_mode_wrap ${searchText !== '' ? 'market_list_menu_mode_wrap_searching' : ''}`}>
                {
                    (!marketAllFoldMode || isMarketInfoHover) && <OverFlowDom len={marketMenu.length} step={30}>
                        <div className="market_list_menu_tabs">
                            {
                                searchText != '' && (searchedMarkets.spot.length !== 0 || searchedMarkets.future.length !== 0 || searchedMarkets.loan.length !== 0) && !marketFoldMode ?
                                    <div className="market-type-item">
                                        <MarketTypeItem
                                            key={MENU_MARKET.SEARCHING}
                                            marketTypeName={lang_string('All')}
                                            onClick={() => changeTabs(MENU_MARKET.SEARCHING)}
                                            isActive={tabMarketType === MENU_MARKET.SEARCHING}
                                            isSearching={searchText !== ''}
                                        ></MarketTypeItem>
                                    </div> : null
                            }
                            {
                                marketMenu.map((item, index) => {
                                    const { market: market1, title } = item;
                                    const marketTypeName = title[window.GLOBAL_PRO_TRADE.lang] ? title[window.GLOBAL_PRO_TRADE.lang] : title.en;
                                    if (searchText !== '' && market1 === MENU_MARKET.SPOT && searchedMarkets.spot.length === 0) {
                                        return null
                                    }
                                    if (searchText !== '' && market1 === MENU_MARKET.CONTRACT && searchedMarkets.future.length === 0) {
                                        return null
                                    }
                                    if (searchText !== '' && market1 === MENU_MARKET.LOAN && searchedMarkets.loan.length === 0) {
                                        return null
                                    }
                                    if (marketFoldMode && isMarketInfoHover && market1 !== tabMarketType && searchText != '') {
                                        return null
                                    }
                                    return (
                                        <div data-index={index}
                                            key={market1}
                                            className={`market-type-item market-type-item-${market1}`}>
                                            <MarketTypeItem
                                                marketTypeName={marketTypeName}
                                                onClick={() => changeTabs(market1)}
                                                isActive={market1 === tabMarketType}
                                                isSearching={searchText !== ''}
                                            ></MarketTypeItem>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </OverFlowDom>
                }
                {
                    !isMarketInfoHover && searchText === '' && <MarketListModeSwitch />
                }
            </div>
        </div>
    )
}

export default inject('store')(observer(MarketTabs))
