import React, { Component } from 'react'
import { WidthProvider, Responsive } from "react-grid-layout";
const ResponsiveGridLayout = WidthProvider(Responsive);
import { ErrorBoundary } from '../common';
import { MarketList } from '../market';
import DataSource from './DataSource';
import 'react-grid-layout/css/styles.css'
import { inject, observer } from 'mobx-react';

@inject('store')
@observer
export default class Main extends Component {
    componentDidMount() {
        this.cleanProKlineLocalStorage();
        this.props.store.getAllMarketList();
        this.showTradeEditPanelSubscribe = PubSub.subscribe('SHOW_TRADE_EDIT_PANEL', this.showTradeEditPanel);
        window.addEventListener('resize', this.handleResize)
    }
    componentWillUnmount() {
        PubSub.unsubscribe(this.showTradeEditPanelSubscribe);
        window.removeEventListener('resize', this.handleResize)
    }
    async switchTradingType(market) {
        if (market == 'strategybot' && !!globalStore.unified_account_status.is_portfolio_margin_account) {
            await proTradeApi.switchAccountMode({
                status: 0
            });
            await proTradeApi.switchUnifiedAccountStatus({
                status: 0
            });
            updateUnifiedAccountStatus();
            ToastWarning(t('trade.strategy.unavailable'))
        }
        if (globalStore.marketType == 'contract') {
            var ref217;
            globalStore.history.replace(`/futures/${globalStoreProFuture === null || globalStoreProFuture === void 0 ? void 0 : (ref217 = globalStoreProFuture.settle_coin) === null || ref217 === void 0 ? void 0 : ref217.toUpperCase()}/${globalStoreProFuture.currSymbol}${market == 'strategybot' ? '?tradModel=strategybot' : ''}${window.location.hash}`)
        } else {
            globalStore.history.replace(`/trade/${globalStore.currSymbol}${market == 'strategybot' ? '?tradModel=strategybot' : ''}${window.location.hash}`)
        }
        globalStore.set_tradingType(market);
        if (market == 'strategybot') {
            globalStore.updateTabIndex(TRADE_TABLE_TYPE.STRATEGY_BOTS)
        }
        if (market == 'trade') {
            globalStore.setIsolatedMargin(false)
        }
        globalStore.switchStratebotLayout(market)
    }
    render() {
        const { charts, orderPanel, entrustInfo, trading, assets, marketList, chartHeader } = this.props.store.showLayout;
        const { showTradeEditPopup, showProfitCalculator, marketType, layoutMode, layoutOption, changeLayout } = this.props.store;
        return <>
            <ResponsiveGridLayout
                className="layout"
                layouts={layoutOption}
                breakpoints={
                    {
                        w3400: 3400,
                        w1920: 1920,
                        w1600: 1600,
                        w1440: 1440,
                        w1366: 1366
                    }
                }
                cols={{
                    w3400: 100,
                    w1920: 100,
                    w1600: 100,
                    w1440: 100,
                    w1366: 100
                }}
                onLayoutChange={
                    (layout, layouts) => {
                        changeLayout(layouts)
                    }
                }
                autoSize={true}
                margin={[4, 4]}
                rowHeight={Math.floor(7 / 1080 * (window.screen.height <= 1080 ? 1080 : window.screen.height))}
                draggableHandle=".rgl-drag-zone"
                onResizeStop={
                    (layout, oldItem, newItem, placeholder, e, element) => {
                        const dragGoalKey = newItem.i;
                        const store = this.props.store;
                        if (dragGoalKey === 'chartHeader') {
                            store === null || store === void 0 ? void 0 : store.setShouldReCompute(!store.shouldReCompute);
                            setTimeout(() => {
                                store === null || store === void 0 ? void 0 : store.setShouldReCompute(!store.shouldReCompute)
                            }
                                , 800)
                        }
                        if (dragGoalKey === 'entrustInfo') {
                            PubSub.publish('RESIZE_LAYOUT_SAVE')
                        }
                        if (dragGoalKey === 'trading') {
                            store === null || store === void 0 ? void 0 : store.setStrategyChartResize()
                        }
                    }
                }
                onResize={
                    (layout, oldItem, newItem, placeholder, e, element) => {
                        if (newItem.i === 'entrustInfo') {
                            PubSub.publish('RESIZE_SHOW_NUMBER')
                        }
                        if (newItem.i === 'trading') {
                            PubSub.publish('TRADE_MODE_RESIZE')
                        }
                        if (newItem.i === 'charts') {
                            PubSub.publish('CHARTS_MODE_RESIZE')
                        }
                    }
                }
            >
                {
                    marketList && <div key="marketList" style={{ zIndex: 1 }} id="market-list-panel">
                        <ErrorBoundary>
                            <MarketList></MarketList>
                        </ErrorBoundary>
                    </div>
                }
                 <div key="chartHeader" style={{ zIndex: 29 }}>
                    <ErrorBoundary >
                        0000
                    </ErrorBoundary>
                </div>
                  <div key="charts" style={{ zIndex: 2 }}>
                    <ErrorBoundary >
                        1111
                    </ErrorBoundary>
                </div>
                <div key="entrustInfo" style={{ zIndex: 2 }}>
                    <ErrorBoundary>
                        <DataSource></DataSource>
                    </ErrorBoundary>
                </div>
                <div key="orderPanel" style={{ zIndex: 2 }}>
                    <ErrorBoundary>
                       2222
                    </ErrorBoundary>
                </div>
                <div key="trading" id='trading-panel-container' style={{ zIndex: 2 }}>
                    <ErrorBoundary>
                       3333
                    </ErrorBoundary>
                </div>
                <div key="assets" style={{ zIndex: 2 }}>
                    <ErrorBoundary>
                       4444
                    </ErrorBoundary>
                </div>
            </ResponsiveGridLayout>
        </>
    }
    cleanProKlineLocalStorage() {
        for (let key in localStorage) {
            if (key.indexOf('pro_Kline_') !== -1) {
                localStorage.removeItem(key)
            }
        }
    }
    constructor(props41) {
        super(props41);
        Object.defineProperty(this, "handleResize", () => {
            const { clientWidth: clientWidth1 } = this.state;
            if (clientWidth1 !== window.innerWidth) {
                this.props.store.currentClientWidth(window.innerWidth);
                this.setState({
                    clientWidth: window.innerWidth
                })
            }
        }
        );

        Object.defineProperty(this, "showTradeEditPanel", (key, obj) => {
            this.props.store.TradeEditPanelObj = obj;
            if (obj.hasOwnProperty('chartIndex')) {
                this.props.store.setActiveChartIndex(obj.chartIndex)
            }
            setTimeout(() => {
                this.props.store.showTradeEditPopup = true
            }
                , 200)
        }
        );
        window.switchTradingStrategy = this.switchTradingType;
        this.state = {
            clientWidth: window.innerWidth
        }
    }

}