import { inject, observer } from "mobx-react";
import React, { useState, useEffect, useRef } from 'react'
import LatestDeal from '@/components/dataSource/LatestDeal';
import EntrustInfo from '@/components/dataSource/EntrustInfo';
import ReactDraggable from 'react-draggable'
import { OrderBookConfigWrapper, DragComponent } from '@/components/common';


const DataSource = inject('store')(observer(function ({ store }) {
    const [selected, setSelected] = useState('entrustInfo');
    const datasoureRef = useRef();
    const [deltaPosition, setDeltaPosition] = useState({
        x: 0,
        y: 0
    });
    const [changedTab, setChangedTab] = useState('entrustInfo-drag');
    const [isDragging, setIsDragging] = useState(false);
    const [rect, setRect] = useState(undefined);
    const [layout, setLayout] = useState(0);
    const [direction, setDirection] = useState('');
    const [entrustInfoSize, setEntrustInfoSize] = useState({
        width: '100%',
        height: '100%'
    });
    const [latestDealSize, setLatestDealSize] = useState({
        width: '100%',
        height: '100%'
    });
    const [extendPosition, setExtentPosition] = useState({
        x: 0,
        y: 0
    });
    const [currentFirst, setcurrentFirst] = useState(null);
    const [uiDrag, setUiDrag] = useState(null);
    const [lightLine, setLightLine] = useState('');
    const [extendTopBunds, setExtendTopBounds] = useState(undefined);
    const [extendLeftBunds, setExtendLeftBounds] = useState(undefined);
    const localStorageKey = 'deep_list_layout_v1';
    const [isRtl] = useState(g_lang === 'ar');
    useEffect(() => {
        let local = localStorage.getItem(localStorageKey);
        if (local) {
            local = JSON.parse(local);
            if (local.changedTab) {
                setChangedTab(local.changedTab)
            }
            if (local.layout) {
                setLayout(local.layout);
                if (local.layout != 0) {
                    changeType('all')
                }
            }
            if (local.entrust) {
                setEntrustInfoSize(local.entrust);
                PubSub.publish('AUTO_CACL_DEEP_ROW_NUMBER')
            }
            if (local.latest) {
                setLatestDealSize(local.latest)
            }
        }
        const bookReset = PubSub.subscribe('TRADE_ORDERBOOK_LIST_RESET', () => {
            setChangedTab('entrustInfo-drag');
            setSelected('entrustInfo');
            setLayout(0);
            setEntrustInfoSize({
                width: '100%',
                height: '100%'
            });
            PubSub.publish('AUTO_CACL_DEEP_ROW_NUMBER');
            setLatestDealSize({
                width: '100%',
                height: '100%'
            });
            tradeTools.deleteLayoutData()
        }
        );
        return () => {
            datasoureRef.current = null;
            PubSub.unsubscribe(bookReset)
        }
    }
        , []);
    const handleStart = (e, ui) => {
        setIsDragging(true);
        setDeltaPosition({
            x: 0,
            y: 0
        });
        setDirection('');
        setLightLine('');
        const rect1 = datasoureRef.current.getBoundingClientRect();
        setRect(rect1);
        const first = document.querySelector('.dataSource-list.source-pane-1');
        if (first) {
            setcurrentFirst(first.getBoundingClientRect())
        }
        const uiRect = e.target.getBoundingClientRect();
        setUiDrag(Object.assign({}, uiRect, {
            left: uiRect.left - rect1.left,
            top: uiRect.top - rect1.top
        }))
    }
        ;
    const handleDragEntrust = (e, ui) => {
        const isfirstTab = e.target.classList.contains('source-pane-1');
        const isentrustInfo = e.target.classList.contains('entrustInfo-drag');
        const position = {
            x: deltaPosition.x + ui.deltaX,
            y: deltaPosition.y + ui.deltaY
        };
        if (!rect)
            return false;
        const leftAxios = isfirstTab ? rect.width / 8 - 16 : rect.width / 8;
        const rightAxios = isfirstTab ? rect.width * 3 / 4 - 16 : rect.width * 3 / 4 - 55;
        setDeltaPosition(position);
        if (layout === 0) {
            if (Math.abs(position.y) < 43) {
                setDirection('default');
                if (isRtl) {
                    isfirstTab && position.x < -26 ? isentrustInfo ? setLightLine('latestDeal-drag') : setLightLine('entrustInfo-drag') : !isfirstTab && position.x > 26 ? isentrustInfo ? setLightLine('latestDeal-drag') : setLightLine('entrustInfo-drag') : setLightLine('')
                } else {
                    isfirstTab && position.x > 26 ? isentrustInfo ? setLightLine('latestDeal-drag') : setLightLine('entrustInfo-drag') : !isfirstTab && position.x < -26 ? isentrustInfo ? setLightLine('latestDeal-drag') : setLightLine('entrustInfo-drag') : setLightLine('')
                }
            } else if (position.y > 43) {
                setLightLine('');
                if (!isRtl && (isfirstTab && position.x < leftAxios || !isfirstTab && position.x + uiDrag.left < leftAxios) || isRtl && position.x < -rightAxios) {
                    setDirection('left')
                } else if (!isRtl && position.x > rightAxios || isRtl && position.x > -leftAxios + 16) {
                    setDirection('right')
                } else if (position.y < rect.height / 2) {
                    setDirection('top')
                } else if (position.y > rect.height / 2) {
                    setDirection('bottom')
                } else {
                    setDirection('')
                }
            } else {
                setDirection('')
            }
        } else if (layout === 1) {
            let height = 0;
            if (isentrustInfo) {
                height = latestDealSize.height === '50%' ? rect.height / 2 : parseFloat(latestDealSize.height) * rect.height / 100
            } else {
                height = entrustInfoSize.height === '50%' ? rect.height / 2 : parseFloat(entrustInfoSize.height) * rect.height / 100
            }
            if (isfirstTab) {
                if (position.y > 43) {
                    if (position.y > height && position.y <= height + 43) {
                        setDirection('default');
                        isentrustInfo ? setLightLine('latestDeal-drag') : setLightLine('entrustInfo-drag')
                    } else {
                        setLightLine('');
                        if (!isRtl && position.x < leftAxios || isRtl && position.x < -rightAxios) {
                            setDirection('left')
                        } else if (!isRtl && position.x > rightAxios || isRtl && position.x > -leftAxios + 16) {
                            setDirection('right')
                        } else if (position.y > height + 43) {
                            setDirection('bottom')
                        } else {
                            setDirection('')
                        }
                    }
                } else {
                    setDirection('')
                }
            } else {
                if (position.y < -43) {
                    if (position.y < -height + 43) {
                        setDirection('default');
                        isentrustInfo ? setLightLine('latestDeal-drag') : setLightLine('entrustInfo-drag')
                    } else {
                        setLightLine('');
                        if (!isRtl && position.x < leftAxios || isRtl && position.x < -rightAxios) {
                            setDirection('left')
                        } else if (!isRtl && position.x > rightAxios || isRtl && position.x > -leftAxios + 16) {
                            setDirection('right')
                        } else if (position.y < -43 && position.y >= -height + 43) {
                            setDirection('top')
                        } else {
                            setDirection('')
                        }
                    }
                } else {
                    setDirection('')
                }
            }
        } else if (layout === 2) {
            if (Math.abs(position.y) <= 43) {
                if (!isRtl && (isfirstTab && position.x > currentFirst.width - 56 || !isfirstTab && position.x < -10)) {
                    setDirection('default');
                    isfirstTab && position.x > currentFirst.width - 56 ? isentrustInfo ? setLightLine('latestDeal-drag') : setLightLine('entrustInfo-drag') : !isfirstTab && position.x < -10 ? isentrustInfo ? setLightLine('latestDeal-drag') : setLightLine('entrustInfo-drag') : setLightLine('')
                } else if (isRtl && (isfirstTab && position.x < -currentFirst.width + 56 || !isfirstTab && position.x > 10)) {
                    setDirection('default');
                    isfirstTab && position.x < -currentFirst.width + 56 ? isentrustInfo ? setLightLine('latestDeal-drag') : setLightLine('entrustInfo-drag') : !isfirstTab && position.x > 10 ? isentrustInfo ? setLightLine('latestDeal-drag') : setLightLine('entrustInfo-drag') : setLightLine('')
                } else {
                    setDirection('');
                    setLightLine('')
                }
            } else if (position.y > 43) {
                setLightLine('');
                if (!isRtl && isfirstTab && position.x > rightAxios || isRtl && !isfirstTab && position.x > rightAxios - uiDrag.left) {
                    setDirection('right')
                } else if (!isRtl && !isfirstTab && position.x < -rect.width / 4 || isRtl && isfirstTab && position.x < -rightAxios) {
                    setDirection('left')
                } else if (position.y < rect.height / 2) {
                    setDirection('top')
                } else if (position.y > rect.height / 2) {
                    setDirection('bottom')
                }
            } else {
                setDirection('')
            }
        }
    }
        ;
    const handleXDrop = (e, ui) => {
        const isfirstTab = e.target.classList.contains('source-pane-1');
        const isEntrustInfo = e.target.classList.contains('entrustInfo-drag');
        let storage = localStorage.getItem(localStorageKey) ? JSON.parse(localStorage.getItem(localStorageKey)) : {};
        if (direction === 'default' && layout === 0) {
            if (isfirstTab && deltaPosition.x >= 26) {
                setChangedTab(isEntrustInfo ? 'latestDeal-drag' : 'entrustInfo-drag');
                storage.changedTab = isEntrustInfo ? 'latestDeal-drag' : 'entrustInfo-drag'
            } else if (!isfirstTab && deltaPosition.x <= -26) {
                setChangedTab(isEntrustInfo ? 'entrustInfo-drag' : 'latestDeal-drag');
                storage.changedTab = isEntrustInfo ? 'entrustInfo-drag' : 'latestDeal-drag'
            }
        } else {
            if (isfirstTab && (direction === 'right' || direction === 'bottom')) {
                setChangedTab(isEntrustInfo ? 'latestDeal-drag' : 'entrustInfo-drag');
                storage.changedTab = isEntrustInfo ? 'latestDeal-drag' : 'entrustInfo-drag'
            } else if (!isfirstTab && (direction === 'left' || direction === 'top')) {
                setChangedTab(isEntrustInfo ? 'entrustInfo-drag' : 'latestDeal-drag');
                storage.changedTab = isEntrustInfo ? 'entrustInfo-drag' : 'latestDeal-drag'
            } else if (isRtl && isfirstTab && direction === 'left') {
                setChangedTab(isEntrustInfo ? 'latestDeal-drag' : 'entrustInfo-drag');
                storage.changedTab = isEntrustInfo ? 'latestDeal-drag' : 'entrustInfo-drag'
            } else if (isRtl && !isfirstTab && direction === 'right') {
                setChangedTab(isEntrustInfo ? 'entrustInfo-drag' : 'latestDeal-drag');
                storage.changedTab = isEntrustInfo ? 'entrustInfo-drag' : 'latestDeal-drag'
            }
            if (direction === 'left' || direction === 'right') {
                setLayout(2);
                setEntrustInfoSize({
                    width: '50%',
                    height: '100%'
                });
                setLatestDealSize({
                    width: '50%',
                    height: '100%'
                });
                storage = Object.assign(storage, {
                    layout: 2,
                    entrust: {
                        width: '50%',
                        height: '100%'
                    },
                    latest: {
                        width: '50%',
                        height: '100%'
                    }
                })
            } else if (direction === 'top' || direction === 'bottom') {
                setLayout(1);
                setEntrustInfoSize({
                    width: '100%',
                    height: '50%'
                });
                setLatestDealSize({
                    width: '100%',
                    height: '50%'
                });
                storage = Object.assign(storage, {
                    layout: 1,
                    entrust: {
                        width: '100%',
                        height: '50%'
                    },
                    latest: {
                        width: '100%',
                        height: '50%'
                    }
                })
            } else if (direction === 'default') {
                setLayout(0);
                setEntrustInfoSize({
                    width: '100%',
                    height: '100%'
                });
                setLatestDealSize({
                    width: '100%',
                    height: '100%'
                });
                storage = Object.assign(storage, {
                    layout: 0,
                    entrust: {
                        width: '100%',
                        height: '100%'
                    },
                    latest: {
                        width: '100%',
                        height: '100%'
                    }
                })
            }
            PubSub.publish('AUTO_CACL_DEEP_ROW_NUMBER')
        }
        if (direction !== '' && direction !== 'default' && globalStore.orderBookTradeTabType != ORDERBOOK_TRADE.ALL) {
            globalStore.set_orderBookTradeTabType(ORDERBOOK_TRADE.ALL);
            proTradeSocket.switchOrderBookAndTrade({
                type: ORDERBOOK_TRADE.ALL,
                symbol: globalStore.currSymbol
            })
        } else if (globalStore.orderBookTradeTabType == ORDERBOOK_TRADE.ALL && direction !== '' && direction == 'default') {
            proTradeSocket.switchOrderBookAndTrade({
                type: selected === 'entrustInfo' ? ORDERBOOK_TRADE.ORDER_BOOK : ORDERBOOK_TRADE.TRADE,
                symbol: globalStore.currSymbol
            });
            globalStore.set_orderBookTradeTabType(selected === 'entrustInfo' ? ORDERBOOK_TRADE.ORDER_BOOK : ORDERBOOK_TRADE.TRADE)
        }
        setIsDragging(false);
        Object.keys(storage).length > 0 && localStorage.setItem(localStorageKey, JSON.stringify(storage));
        setDeltaPosition({
            x: 0,
            y: 0
        });
        setDirection('');
        setLightLine('')
    }
        ;
    const handlestartExtend = (e, ui) => {
        const rect1 = datasoureRef.current.getBoundingClientRect();
        setRect(rect1);
        const first = document.querySelector('.dataSource-list.source-pane-1');
        if (layout === 1) {
            const entrustHeight = rect1.height * parseFloat(entrustInfoSize.height) / 100;
            const lastDealHeight = rect1.height * parseFloat(latestDealSize.height) / 100;
            if (first.classList.contains('entrustInfo-drag')) {
                setExtendTopBounds({
                    top: -entrustHeight + 206,
                    bottom: lastDealHeight - 206
                })
            } else {
                setExtendTopBounds({
                    top: -lastDealHeight + 206,
                    bottom: entrustHeight - 206
                })
            }
        } else if (layout === 2) {
            const entrustWidth = rect1.width * parseFloat(entrustInfoSize.width) / 100;
            const lastDealWidth = rect1.width * parseFloat(latestDealSize.width) / 100;
            if (first.classList.contains('entrustInfo-drag')) {
                setExtendLeftBounds({
                    left: -entrustWidth + 69,
                    right: lastDealWidth - 69
                })
            } else {
                setExtendLeftBounds({
                    left: -lastDealWidth + 69,
                    right: entrustWidth - 69
                })
            }
        }
    }
        ;
    const handleDragExtend = (e, ui) => {
        const deltaPosition1 = {
            x: extendPosition.x + ui.deltaX,
            y: extendPosition.y + ui.deltaY
        };
        setExtentPosition(deltaPosition1)
    }
        ;
    const handleDropExtend = (e, ui) => {
        const first = document.querySelector('.dataSource-list.source-pane-1');
        const second = document.querySelector('.dataSource-list.source-pane-3');
        const firstRect = first.getBoundingClientRect();
        const secondRect = second.getBoundingClientRect();
        let storage = localStorage.getItem(localStorageKey) ? JSON.parse(localStorage.getItem(localStorageKey)) : {};
        if (layout === 1) {
            if (first.classList.contains('entrustInfo-drag')) {
                setEntrustInfoSize(state => Object.assign({}, state, {
                    height: `${(firstRect.height + extendPosition.y) * 100 / rect.height}%`
                }));
                setLatestDealSize(state => Object.assign({}, state, {
                    height: `${(secondRect.height - extendPosition.y) * 100 / rect.height}%`
                }));
                storage = Object.assign(storage, {
                    entrust: {
                        width: '100%',
                        height: `${(firstRect.height + extendPosition.y) * 100 / rect.height}%`
                    },
                    latest: {
                        width: '100%',
                        height: `${(secondRect.height - extendPosition.y) * 100 / rect.height}%`
                    }
                })
            } else {
                setLatestDealSize(state => Object.assign({}, state, {
                    height: `${(firstRect.height + extendPosition.y) * 100 / rect.height}%`
                }));
                setEntrustInfoSize(state => Object.assign({}, state, {
                    height: `${(secondRect.height - extendPosition.y) * 100 / rect.height}%`
                }));
                storage = Object.assign(storage, {
                    entrust: {
                        width: '100%',
                        height: `${(secondRect.height - extendPosition.y) * 100 / rect.height}%`
                    },
                    latest: {
                        width: '100%',
                        height: `${(firstRect.height + extendPosition.y) * 100 / rect.height}%`
                    }
                })
            }
        } else if (layout === 2) {
            if (!isRtl) {
                if (first.classList.contains('entrustInfo-drag')) {
                    setEntrustInfoSize(state => Object.assign({}, state, {
                        width: `${(firstRect.width + extendPosition.x) * 100 / rect.width}%`,
                        height: '100%'
                    }));
                    setLatestDealSize(state => Object.assign({}, state, {
                        width: `${(secondRect.width - extendPosition.x) * 100 / rect.width}%`,
                        height: '100%'
                    }));
                    storage = Object.assign(storage, {
                        entrust: {
                            height: '100%',
                            width: `${(firstRect.width + extendPosition.x) * 100 / rect.width}%`
                        },
                        latest: {
                            height: '100%',
                            width: `${(secondRect.width - extendPosition.x) * 100 / rect.width}%`
                        }
                    })
                } else {
                    setLatestDealSize(state => Object.assign({}, state, {
                        width: `${(firstRect.width + extendPosition.x) * 100 / rect.width}%`,
                        height: '100%'
                    }));
                    setEntrustInfoSize(state => Object.assign({}, state, {
                        width: `${(secondRect.width - extendPosition.x) * 100 / rect.width}%`,
                        height: '100%'
                    }));
                    storage = Object.assign(storage, {
                        entrust: {
                            height: '100%',
                            width: `${(secondRect.width - extendPosition.x) * 100 / rect.width}%`
                        },
                        latest: {
                            height: '100%',
                            width: `${(firstRect.width + extendPosition.x) * 100 / rect.width}%`
                        }
                    })
                }
            } else {
                if (first.classList.contains('entrustInfo-drag')) {
                    setEntrustInfoSize(state => Object.assign({}, state, {
                        width: `${(firstRect.width - extendPosition.x) * 100 / rect.width}%`,
                        height: '100%'
                    }));
                    setLatestDealSize(state => Object.assign({}, state, {
                        width: `${(secondRect.width + extendPosition.x) * 100 / rect.width}%`,
                        height: '100%'
                    }));
                    storage = Object.assign(storage, {
                        entrust: {
                            height: '100%',
                            width: `${(firstRect.width - extendPosition.x) * 100 / rect.width}%`
                        },
                        latest: {
                            height: '100%',
                            width: `${(secondRect.width + extendPosition.x) * 100 / rect.width}%`
                        }
                    })
                } else {
                    setLatestDealSize(state => Object.assign({}, state, {
                        width: `${(firstRect.width - extendPosition.x) * 100 / rect.width}%`,
                        height: '100%'
                    }));
                    setEntrustInfoSize(state => Object.assign({}, state, {
                        width: `${(secondRect.width + extendPosition.x) * 100 / rect.width}%`,
                        height: '100%'
                    }));
                    storage = Object.assign(storage, {
                        entrust: {
                            height: '100%',
                            width: `${(secondRect.width + extendPosition.x) * 100 / rect.width}%`
                        },
                        latest: {
                            height: '100%',
                            width: `${(firstRect.width - extendPosition.x) * 100 / rect.width}%`
                        }
                    })
                }
            }
        }
        setExtentPosition({
            x: 0,
            y: 0
        });
        if (storage.entrust) {
            localStorage.setItem(localStorageKey, JSON.stringify(storage))
        }
        PubSub.publish('AUTO_CACL_DEEP_ROW_NUMBER')
    }
        ;
    const changeType = selected1 => {
        const selectType = selected1 === 'entrustInfo' ? 0 : selected1 === 'latestDeal' ? 1 : 2;
        if (globalStore.orderBookTradeTabType != selectType) {
            proTradeSocket.switchOrderBookAndTrade({
                type: selectType,
                symbol: globalStore.currSymbol
            })
        }
        globalStore.set_orderBookTradeTabType(selectType);
        PubSub.publish('AUTO_CACL_DEEP_ROW_NUMBER');
        setSelected(selected1)
    }
        ;
    return (
        <div ref={datasoureRef} className={`dataSource ${layout === 2 ? 'dataSource-row' : ''} ${isDragging ? 'dataSource-isDragging' : ''}`}>
            <DragComponent></DragComponent>
            <OrderBookConfigWrapper type="spot"></OrderBookConfigWrapper>
            {
                layout === 0 && <div className="dataSource-tabs">
                    <div
                        data-click-event="trade_orderbook_trades_switch_click"
                        data-collect-params={`{"button_name":"orderbook"}`}
                        className={`entrustInfo ${changedTab === 'entrustInfo-drag' ? 'source-pane-1' : 'source-pane-2'} ${selected === 'entrustInfo' ? 'dataSource-tabs-active' : ''}`}
                        onClick={() => changeType('entrustInfo')}
                    >
                        {i18n_trade.orderBooks}
                        <ReactDraggable
                            position={
                                isDragging ? undefined : {
                                    x: 0,
                                    y: 0
                                }
                            }
                            defaultClassNameDragging="draggable-dragging"
                            defaultClassName={`react-draggable entrustInfo-drag ${changedTab === 'entrustInfo-drag' ? 'source-pane-1' : 'source-pane-2'}`}
                            onStart={handleStart}
                            onDrag={handleDragEntrust}
                            onStop={handleXDrop}
                        >
                            <div className="dragging-tooltips">
                                <span>{t('futures.drag.orderbook')}</span>
                            </div>

                        </ReactDraggable>
                        <span className={`tab-show-hight ${lightLine === 'entrustInfo-drag' ? 'tab-light-line' : ''}`}>

                        </span>
                    </div>

                    <div
                        data-click-event="trade_orderbook_trades_switch_click"
                        data-collect-params={`{"button_name":"trades"}`}
                        className={`latestDeal ${changedTab === 'latestDeal-drag' ? 'source-pane-1' : 'source-pane-2'} ${selected === 'latestDeal' ? 'dataSource-tabs-active' : ''}`}
                        onClick={() => changeType('latestDeal')}
                    >
                        {lang_string('最新成交')}
                        <ReactDraggable
                            position={
                                isDragging ? undefined : {
                                    x: 0,
                                    y: 0
                                }
                            }
                            defaultClassNameDragging="draggable-dragging"
                            defaultClassName={`react-draggable latestDeal-drag ${changedTab === 'latestDeal-drag' ? 'source-pane-1' : 'source-pane-2'}`}
                            onStart={handleStart}
                            onDrag={handleDragEntrust}
                            onStop={handleXDrop}
                        >
                            <div className="dragging-tooltips">
                                <span>{t('futures.drag.tradelist')}</span>
                            </div>

                        </ReactDraggable>
                        <span className={`tab-show-hight ${lightLine === 'entrustInfo-drag' ? 'tab-light-line' : ''}`}>

                        </span>
                    </div>

                </div>
            }
            <div className={`draggable-dragging-border ${isDragging && direction === 'left' ? 'draggable-dragging-left' : ''} ${isDragging && direction === 'right' ? 'draggable-dragging-right' : ''} ${isDragging && direction === 'top' ? 'draggable-dragging-top' : ''} ${isDragging && direction === 'bottom' ? 'draggable-dragging-bottom' : ''}`}>
            </div>
            <div className={`dataSource-list entrustInfo-drag ${changedTab === 'entrustInfo-drag' ? 'source-pane-1' : 'source-pane-3'}`} style={{ ...entrustInfoSize, display: selected === 'entrustInfo' || layout !== 0 ? 'block' : 'none' }}>
                {
                    layout !== 0 && <div className="dataSource-tab">
                        <div className="dataSource-tab-title">
                            {i18n_trade.orderBooks}
                            <span className={`tab-show-hight ${lightLine === 'entrustInfo-drag' ? 'tab-light-line' : ''}`}>
                            </span>
                        </div>
                        <ReactDraggable
                            position={
                                isDragging ? undefined : {
                                    x: 0,
                                    y: 0
                                }
                            }
                            defaultClassNameDragging="draggable-dragging"
                            defaultClassName={`react-draggable entrustInfo-drag ${changedTab === 'entrustInfo-drag' ? 'source-pane-1' : 'source-pane-3'}`}
                            onStart={handleStart}
                            onDrag={handleDragEntrust}
                            onStop={handleXDrop}
                        >
                            <div className="dragging-tooltips entrust-tooltip">
                                <span>{t('futures.drag.orderbook')}</span>
                            </div>

                        </ReactDraggable>

                    </div>
                }
                <div className={`${layout !== 0 ? 'entrustInfo-wrap' : 'entrustInfo-wrap-all'}`}>
                    <div className="react-draggable-entrust-wrapper" style={{ height: '100%' }}>
                        <EntrustInfo />
                    </div>
                </div>
            </div>
            {
                layout !== 0 && <ReactDraggable
                    bounds={layout === 1 ? extendTopBunds : extendLeftBunds}
                    position={{ x: 0, y: 0 }}
                    defaultClassName="source-pane-2 draggable-dragging-expend"
                    axis={layout === 1 ? 'y' : layout === 2 ? 'x' : ''}
                    onStart={handlestartExtend}
                    onDrag={handleDragExtend}
                    onStop={handleDropExtend}
                >
                    <div className={`${layout === 1 ? 'drag-move-extend-vertical' : 'drag-move-extend-hor'}`}>
                        <span>{t('futures.drag.orderbook')}</span>
                    </div>

                </ReactDraggable>
            }
            <div className={`dataSource-list latestDeal-drag ${changedTab === 'latestDeal-drag' ? 'source-pane-1' : 'source-pane-3'}`}
                style={{ display: selected === 'latestDeal' || layout !== 0 ? 'block' : 'none', ...latestDealSize }}>
                {
                    layout !== 0 && <div className="dataSource-tab">
                        <div className="dataSource-tab-title">
                            {lang_string('最新成交')}
                            <span className={`tab-show-hight ${lightLine === 'latestDeal-drag' ? 'tab-light-line' : ''}`}>
                            </span>
                        </div>
                        <ReactDraggable
                            position={isDragging ? undefined : { x: 0, y: 0 }}
                            defaultClassNameDragging= "draggable-dragging"
                            defaultClassName={`react-draggable latestDeal-drag ${changedTab === 'latestDeal-drag' ? 'source-pane-1' : 'source-pane-3'}`}
                            axis={layout === 1 ? 'y' : layout === 2 ? 'x' : ''}
                            onStart={handleStart}
                            onDrag={handleDragEntrust}
                            onStop={handleXDrop}
                        >
                            <div className="dragging-tooltips latestDeal-tooltip">
                                <span>{t('futures.drag.tradelist')}</span>
                            </div>

                        </ReactDraggable>
                    </div>
                }
                <div className={`${layout !== 0 ? 'latestDeal-wrap-list' : 'latestDeal-wrap'}`}>
                    <div className="react-draggable-latestDeal-wrapper" style={{height: '100%'}}>
                        <LatestDeal />
                    </div>
                </div>
            </div>
        </div>
    )
}));

export default DataSource