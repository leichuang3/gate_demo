import React, { memo } from "react";
import { Popup } from 'reactjs-popup';
import { SpotMarketItem, SpotMarketMenu } from '@/components/market';
import { WithDefaultImg } from '@/components';
import { observer, inject } from "mobx-react";
import { reaction, toJS } from 'mobx';
import tradeTools from '@/utils/tradeTools';

import { NoRecord, LoadingComponent, AutoSizerBrowser, TableHeaderItem, SwitchTableHeaderItem } from '@/components/common'
import { FixedSizeList } from 'react-window';
@inject('store')
@observer
export default class SpotMarketList extends React.Component {
    componentDidMount() {
        if (GLOBAL_PRO_TRADE.is_login) {
            let tempObj = {
                type: 'get_customer_pairs'
            };
            proTradeApi.addFav(tempObj).then(res => {
                if (res && res.datas && res.datas.length) {
                    this.setState({
                        favArr: res.datas.toLowerCase().split(',')
                    }, () => {
                        this.setFavMarketDate()
                    }
                    )
                } else {
                    this.setState({
                        favArr: []
                    })
                }
            }
            )
        } else {
            this.setState({
                favArr: localStorage.getItem('custom') ? localStorage.getItem('custom').split(',') : []
            }, () => {
                this.setFavMarketDate()
            }
            )
        }
        this.favChangeListenerSubscribe = PubSub.subscribe('FAVCHANGE', this.favChangeListener);
        this.tickerUpdateSubscribe = PubSub.subscribe('TRADE_EVENT_ticker.update', this.pushUpdateQueue);
        this.priceUpdateSubscribe = PubSub.subscribe('TRADE_EVENT_price.update', this.pushUpdateQueue);
        this.priceUpdateSubscribe = PubSub.subscribe('TRADE_EVENT_price.update', this.pushUpdateQueue);
        this.marketAllFoldModeSubscribe = PubSub.subscribe('CHARTS_MODE_RESIZE', this.handleMarketAllFoldModeSubscribe);
        reaction(() => this.props.store.allMarketList, () => {
            this.setFavMarketDate()
        }
        );
        reaction(() => this.props.store.menuSubType, () => {
            this.updatePriceWsSubscribe(Object.values(this.props.store.curMarketList[this.props.store.menuSubType] || {}))
        }
        );
        reaction(() => this.props.store.curMarketList, () => {
            this.updatePriceWsSubscribe(Object.values(this.props.store.curMarketList[this.props.store.menuSubType] || {}))
        }
        );
        reaction(() => this.props.store.searchText, () => {
            this.updatePriceWsSubscribe(this.props.store.searchText !== '' ? this.props.store.searchedMarkets.spot : Object.values(this.props.store.curMarketList[this.props.store.menuSubType] || {}))
        }
        );
        setInterval(() => {
            if (this.updateQueue.length > 0) {
                this.batchUpdate()
            }
        }
            , 2e3)
    }
    componentWillUnmount() {
        PubSub.unsubscribe(this.favChangeListenerSubscribe);
        PubSub.unsubscribe(this.tickerUpdateSubscribe);
        PubSub.unsubscribe(this.priceUpdateSubscribe);
        PubSub.unsubscribe(this.marketAllFoldModeSubscribe)
    }
    renderMarketList(itemData, spot_lerverage) {
        const { loadingAllMarketListData } = this.props.store;
        if (!itemData || itemData.length === 0) {
            return loadingAllMarketListData ? <LoadingComponent></LoadingComponent> : <NoRecord></NoRecord>
        }
        let itemSize = this.getRowHeight();
        return <AutoSizerBrowser
            style={{ height: '100%' }}>
            {
                ({ height, width }) => {
                    return <FixedSizeList
                        width={width}
                        height={height - 4}
                        itemKey={
                            index => {
                                const item = itemData[index];
                                return item && item.pair ? item.pair : index
                            }
                        }
                        itemSize={itemSize}
                        itemCount={itemData.length}
                        itemData={{
                            itemData: itemData,
                            spot_lerverage: spot_lerverage
                        }}
                        onItemsRendered={
                            params => this.handleMarketListReRender(params, itemData)
                        }
                        onScroll={
                            ({ scrollOffset }) => this.setState({
                                scrollOffset
                            })
                        }
                    >
                        {this.renderCoinRow}
                    </FixedSizeList>
                }
            }
        </AutoSizerBrowser>

    }
    renderList() {
        const { marketMenu, tabMarketType, marketFoldMode } = this.props.store;
        const { isMarketInfoHover } = this.props;
        const selectedTab = marketMenu.find(o => {
            return o.market === tabMarketType
        }
        );
        if (selectedTab) {
            const subMenu = selectedTab.sub;
            return subMenu && subMenu.length && (!marketFoldMode || isMarketInfoHover) &&
                <SpotMarketMenu
                    menuData={subMenu}
                    onChangeMenu={market1 => this.changeSub(market1)}
                >
                </SpotMarketMenu>
        }
        return null
    }
    getRowHeight() {
        const { isMarketInfoHover = false } = this.props;
        const { marketSimpleMode, marketFoldMode, searchText } = this.props.store;
        let RowHeight = 44;
        if (isMarketInfoHover || marketSimpleMode || searchText != '') {
            RowHeight = 24
        }
        if (marketFoldMode && !isMarketInfoHover) {
            RowHeight = 40
        }
        return RowHeight
    }
    setFavMarketDate(favArr) {
        const { allMarketList } = this.props.store;
        let _favArr = favArr || this.state.favArr;
        let obj = {};
        let FAVRT = {};
        for (let key in allMarketList) {
            if (!Array.isArray(allMarketList[key])) {
                Object.assign(obj, allMarketList[key])
            }
        }
        _favArr.forEach(item => {
            item = item.toLowerCase();
            obj[item] && (FAVRT[item] = obj[item])
        }
        );
        allMarketList.FAVRT = FAVRT;
        this.props.store.allMarketList = allMarketList;
        addDataToIndexDB('all_market', toJS(allMarketList))
    }
    set_switch_sort(switch_sort) {
        this.setState({
            switch_sort: switch_sort
        })
    }
    handleMarketAllFoldModeSubscribe() {
        const { marketAllFoldMode, updateLeftMarkets } = this.props.store;
        if (marketAllFoldMode) {
            proTradeSocket.updatePriceSubscribe([]);
            updateLeftMarkets([])
        } else {
            this.updatePriceWsSubscribe(Object.values(this.props.store.curMarketList[this.props.store.menuSubType] || {}))
        }
    }
    pushUpdateQueue(key, update) {
        const updateIndex = this.updateQueue.findIndex(current => current[0] === update[0]);
        if (updateIndex > -1) {
            this.updateQueue[updateIndex] = update
        } else {
            this.updateQueue.push(update)
        }
    }
    batchUpdate() {
        const { allMarketList, menuSubType, searchText, searchedMarkets, updateSearchedMarkets } = this.props.store;
        const listToUpdate = searchText === '' ? toJS(allMarketList[menuSubType]) : searchedMarkets.spot;
        this.updateQueue.forEach(update => {
            if (update && update.length < 1) {
                return
            }
            let target = Array.isArray(listToUpdate) ? listToUpdate.find(pair => pair.pair.toUpperCase() === update[0]) : listToUpdate[update[0].toLowerCase()];
            if (typeof target !== 'undefined') {
                target.rate = update[1].price || update[1].last;
                target.rate_percent = update[1].change;
                target.trend = Number(update[1].change) > 0 ? 'up' : 'down';
                if (update[1].baseVolume) {
                    target.vol_b = update[1].baseVolume
                }
            }
        }
        );
        if (Array.isArray(listToUpdate)) {
            if (searchText === '') {
                allMarketList[menuSubType] = [...listToUpdate]
            } else {
                updateSearchedMarkets(_objectSpread({}, searchedMarkets, {
                    spot: listToUpdate
                }))
            }
        } else {
            allMarketList[menuSubType] = _objectSpread({}, listToUpdate)
        }
        this.updateQueue = []
    }
    favChangeListener(e) {
        this.setState({
            favArr: localStorage.getItem('custom').length > 0 ? localStorage.getItem('custom').split(',') : []
        })
    }
    changeSub(type) {
        const { setTabMarketType } = this.props.store;
        let menuSubType = type.toUpperCase();
        if (menuSubType === 'USD_S') {
            menuSubType = 'USDT'
        }
        $('#top_search_input').val('');
        if (type === 'FAVRT') {
            this.setFavMarketDate()
        }
        this.setState({
            isSort: false,
            sortBy: ''
        });
        setTabMarketType(MENU_MARKET.SPOT);
        this.props.store.set_menuSubType(menuSubType);
        localStorage.setItem('SPOT_TRADE_MARKET_MENU', menuSubType)
    }
    switchMarket(marketName) {
        const { setTabMarketType, clearSearchResult } = this.props.store;
        this.props.store.history.push(`${`/trade`}/${marketName}${window.location.search}`);
        if (window.collectEvent) {
            window.collectEvent('beconEvent', 'trade_future_list_market_click', {
                event_name: this.props.store.searchText != '' ? 'spot_search' : 'spot_normal_click'
            })
        }
    }

    renderCoinRow({ data, index, style }) {
        const { marketSimpleMode } = this.props.store;
        const item = data.itemData[index];
        let { favArr } = this.state;
        const { isMarketInfoHover } = this.props;
        let { pair } = item;
        let isFav = favArr.includes(pair);
        return (
            <a
                onClick={e => e.preventDefault && e.preventDefault()}
                href={`/trade/${item.pair.toUpperCase()}`}
                target="_self"
            >
                {
                    marketSimpleMode || this.props.isMarketInfoHover ?
                        <Popup
                            position='right center'
                            on={['hover', 'focus']}
                            className="popup-tooltips"
                            arrow={true}
                            trigger={
                                open => (<SpotMarketItem
                                    style={style}
                                    item={item}
                                    open={open}
                                    store={this.props.store}
                                    index={index}
                                    switchMarket={val => this.switchMarket(val)}
                                    changeFav={this.changeFav}
                                    switch_sort={this.state.switch_sort}
                                    isFav={isFav}
                                    isMarketInfoHover={isMarketInfoHover}
                                />)
                            }

                        >
                            <div className="left_market_list_hover">
                                <div className="list_hover_tips_coin">
                                    <WithDefaultImg
                                        className="icon_img"
                                        src={`/images/coin_icon/64/${item.curr_a.toLowerCase()}.png`}
                                        alt={`${item.curr_a}`}
                                        defaultImg="/images/coin_icon/64/0.png"
                                    ></WithDefaultImg>
                                    <span>
                                        {item.curr_a.toUpperCase()}/{item.curr_b.toUpperCase()}
                                    </span>
                                </div>
                                <ul className="list_hover_tips_name">
                                    <li>
                                        <span>
                                            {lang_string('价格')}
                                        </span>
                                        <span>{item.rate}</span>
                                    </li>
                                    <li>
                                        <span>
                                            {lang_string('Change')}
                                        </span>
                                        <span className={`${item.trend === 'up' ? 'font-add-color' : 'font-dec-color'}`}>{item.rate_percent}%</span>
                                    </li>
                                    <li>
                                        <span>
                                            {lang_string('24小时')} {lang_string('成交量')}
                                        </span>
                                        <span>{tradeTools.conversionUnit(item.vol_b)}</span>
                                    </li>
                                </ul>
                            </div>
                        </Popup> :
                         <SpotMarketItem
                            style={style}
                            item={item}
                            open={open}
                            store={this.props.store}
                            index={index}
                            switchMarket={val => this.switchMarket(val)}
                            changeFav={this.changeFav}
                            switch_sort={this.state.switch_sort}
                            isFav={isFav}
                            isMarketInfoHover={isMarketInfoHover}
                        />
                }

            </a>
        )
    }



    getText(text) {
        if (text.length === 0)
            return;
        return text.length > 7 ? text.slice(0, 6) + '...' : text
    }
    subscribeMarkets(list, start, end) {
        const { updateLeftMarkets, leftMarkets } = this.props.store;
        const { isMarketInfoHover = false } = this.props;
        if (!list || list.length == 0) {
            proTradeSocket.updatePriceSubscribe([])
        }
        const curMarkets = list.slice(start, end);
        let markets = curMarkets.map(item => item.pair.toUpperCase());
        if (isMarketInfoHover) {
            markets = Array.from(new Set([...markets, ...leftMarkets]))
        } else {
            updateLeftMarkets(markets)
        }
        proTradeSocket.updatePriceSubscribe(markets)
    }
    handleMarketListReRender({ visibleStartIndex, visibleStopIndex }, list) {
        this.subscribeMarkets(list, visibleStartIndex, visibleStopIndex + 1)
    }
    updatePriceWsSubscribe(list) {
        const { scrollOffset } = this.state;
        const { isMarketInfoHover = false } = this.props;
        const marketListDom = document.getElementById(!isMarketInfoHover ? "spot_marketlist_view" : "spot_marketlist_view_hover");
        if (!marketListDom) {
            return
        }
        const marketListDomHeight = marketListDom.clientHeight;
        const RowHeight = this.getRowHeight();
        const count = Math.ceil(marketListDomHeight / RowHeight);
        const firstIndex = Math.floor(scrollOffset / RowHeight);
        this.subscribeMarkets(list, firstIndex, firstIndex + count + 1)
    }
    changeFav(isFav, pair) {
        let { favArr, favSubmitting } = this.state;
        if (favSubmitting) {
            return
        }
        const type = this.props.store.menuSubType;
        isFav ? favArr = favArr.filter((e, i) => {
            return e !== pair
        }
        ) : favArr.push(pair);
        type === 'FAVRT' && this.setFavMarketDate(favArr);
        if (typeof this.favObj[pair] !== 'undefined') {
            delete this.favObj[pair]
        } else {
            this.favObj[pair] = !isFav ? 1 : 0
        }
        this.setState({
            favArr: favArr
        });
        localStorage.setItem('custom', favArr.join());
        if (GLOBAL_PRO_TRADE.is_login) {
            this.setState({
                favSubmitting: true
            });
            let postData = {
                type: 'set_customer_pairs',
                pairs: JSON.stringify(this.favObj)
            };
            proTradeApi.addFav(postData).then(data => { }
            ).finally(() => {
                this.setState({
                    favSubmitting: false
                })
            }
            )
        }
        PubSub.publish('FAVCHANGE')
    }
    getUnitSymbol(curr_b) {
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
    changePriceToLocal(price, curr_b) {
        let decimals_fiatRate = tradeTools.get_bid_or_ask_decimals(price, curr_b);
        const currPriceToLocal = price * decimals_fiatRate.fiat_rate;
        let localPrice = currPriceToLocal.toFixed(2);
        if (localPrice === '0.00')
            localPrice = currPriceToLocal.toFixed(6);
        if (Math.abs(tradeTools.transferToNumber(currPriceToLocal).split('.')[0]) < 1) {
            var ref145;
            let localDecimalDigit = currPriceToLocal ? (ref145 = tradeTools.transferToNumber(currPriceToLocal).split('.')[1]) === null || ref145 === void 0 ? void 0 : ref145.length : '';
            localPrice = tradeTools.transferToNumber(currPriceToLocal.toFixed(localDecimalDigit > 12 ? 12 : localDecimalDigit))
        }
        return localPrice
    }
    changeBubbleStatus({ upOrDown, onSort, sortBy }) {
        this.setState({
            upOrDown,
            isSort: onSort,
            sortBy
        });
        const { searchText, searchedMarkets } = this.props.store;
        const type = this.props.store.menuSubType;
        const { curMarketList } = this.props.store;
        let data = searchedMarkets.spot.length || searchText ? Object.values(searchedMarkets.spot) : Object.values(curMarketList[type] || {});
        data = this.bubble({
            data: data,
            sortBy,
            upOrDown
        });
        this.updatePriceWsSubscribe(data);
        if (window.collectEvent) {
            let btn_name = onSort;
            if (btn_name === 'pair')
                btn_name = 'sorting_coin';
            if (btn_name === 'rate')
                btn_name = 'sorting_price';
            if (btn_name === 'rate_percent')
                btn_name = 'sorting_increase';
            window.collectEvent('beconEvent', 'trade_sorting_turn_click', {
                button_name: btn_name
            })
        }
    }
    bubble({ data, sortBy, upOrDown }) {
        let sortData = JSON.parse(JSON.stringify(data));
        if (upOrDown === 'down') {
            sortData = sortData.sort((a, b) => {
                if (sortBy !== 'pair') {
                    return Number(b[sortBy].replace(/,/g, '')) - Number(a[sortBy].replace(/,/g, ''))
                } else {
                    return a[sortBy].localeCompare(b[sortBy])
                }
            }
            )
        } else if (upOrDown === 'up') {
            sortData = sortData.sort((a, b) => {
                if (sortBy !== 'pair') {
                    return Number(a[sortBy].replace(/,/g, '')) - Number(b[sortBy].replace(/,/g, ''))
                } else {
                    return b[sortBy].localeCompare(a[sortBy])
                }
            }
            )
        }
        return sortData
    }
    render() {
        const { isSort, sortBy, upOrDown, switch_sort } = this.state;
        const type = this.props.store.menuSubType;
        const { isMarketInfoHover } = this.props;
        const { curMarketList, searchText, tabMarketType, searchedMarkets, spot_lerverage, layoutMode } = this.props.store;
        let listData = searchText && searchText != '' ? searchedMarkets.spot : Object.values(curMarketList[type] || {});
        const SearchResultLength = layoutMode === LAYOUT_MODES.SIMPLE_TRADE && !isMarketInfoHover ? 8 : 5;
        if (tabMarketType === MENU_MARKET.SEARCHING) {
            listData = listData.slice(0, SearchResultLength)
        }
        if (isSort) {
            listData = this.bubble({
                data: listData,
                sortBy,
                upOrDown
            })
        }
        return <>
            {
                (!searchText || searchText == '') && this.renderList()
            }
            {
                searchText !== '' && listData.length === 0 ? null :
                    <div className="marketlist_head">
                        <ul>
                            <TableHeaderItem
                                isSearching={searchText !== ''}
                                showBubble={sortBy === 'pair'}
                                onClick={
                                    (upOrDown1, onSort) => {
                                        if (searchText !== '') {
                                            return
                                        }
                                        this.changeBubbleStatus({
                                            upOrDown: upOrDown1,
                                            onSort,
                                            sortBy: 'pair'
                                        })
                                    }
                                }
                            >
                                <span>
                                    {lang_string('币种')}
                                </span>
                            </TableHeaderItem>
                            <TableHeaderItem
                                isSearching={searchText !== ''}
                                showBubble={sortBy === 'rate'}
                                onClick={
                                    (upOrDown1, onSort) => {
                                        if (searchText !== '') {
                                            return
                                        }
                                        this.changeBubbleStatus({
                                            upOrDown: upOrDown1,
                                            onSort,
                                            sortBy: 'rate'
                                        })
                                    }
                                }
                            >
                                <span>
                                    {lang_string('价格')}
                                </span>
                            </TableHeaderItem>
                            <SwitchTableHeaderItem
                                showBubble={switch_sort == 2 && sortBy == 'rate_percent' || switch_sort == 4 && sortBy == 'vol_b'}
                                onClick={
                                    (upOrDown1, onSort) => {
                                        if (searchText !== '') {
                                            return
                                        }
                                        if (switch_sort == 2) {
                                            this.changeBubbleStatus({
                                                upOrDown: upOrDown1,
                                                onSort,
                                                sortBy: 'rate_percent'
                                            })
                                        } else {
                                            this.changeBubbleStatus({
                                                upOrDown: upOrDown1,
                                                onSort,
                                                sortBy: 'vol_b'
                                            })
                                        }
                                    }
                                }
                                switch_sort={switch_sort}
                                set_switch_sort={this.set_switch_sort}
                                set_sort={() => { }}
                                isMarketInfoHover={this.props.isMarketInfoHover}
                            >
                            </SwitchTableHeaderItem>

                        </ul>
                    </div>
            }
            {
                listData.length === 0 ? <NoRecord /> :
                    <div
                        className='marketlist_view'
                        style={{
                            height: tabMarketType === MENU_MARKET.SEARCHING ? `${24 * listData.length + 4}px` : 'auto'
                        }}
                        id="spot_marketlist_view"
                    >
                        {this.renderMarketList(listData, spot_lerverage)}
                    </div>
            }
        </>
    }
    constructor(props) {
        super(props);
        this.renderCoinRow = memo(this.renderCoinRow.bind(this))
        this.set_switch_sort = this.set_switch_sort.bind(this)
        this.handleMarketAllFoldModeSubscribe = this.handleMarketAllFoldModeSubscribe.bind(this)
        this.pushUpdateQueue = this.pushUpdateQueue.bind(this)
        this.batchUpdate = this.batchUpdate.bind(this)
        this.favChangeListener = this.favChangeListener.bind(this)
        this.changeSub = this.changeSub.bind(this)
        this.setFavMarketDate = this.setFavMarketDate.bind(this)
        this.switchMarket = this.switchMarket.bind(this)
        this.getText = this.getText.bind(this)
        this.subscribeMarkets = this.subscribeMarkets.bind(this)
        this.handleMarketListReRender = this.handleMarketListReRender.bind(this)
        this.getRowHeight = this.getRowHeight.bind(this)
        this.updatePriceWsSubscribe = this.updatePriceWsSubscribe.bind(this)
        this.changeFav = this.changeFav.bind(this)
        this.getUnitSymbol = this.getUnitSymbol.bind(this)
        this.changePriceToLocal = this.changePriceToLocal.bind(this)
        this.changeBubbleStatus = this.changeBubbleStatus.bind(this)
        this.bubble = this.bubble.bind(this)
        this.marketlist_price_watch_markets = [];
        this.state = {
            favArr: [],
            isSort: false,
            sortBy: '',
            marketPairs: [],
            currChangePair: [],
            switch_sort: 2,
            favSubmitting: false,
            scrollOffset: 0
        };
        this.favObj = {};
        this.updateQueue = []
    }
}