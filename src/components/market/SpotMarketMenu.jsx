import React, { useState, useLayoutEffect, useRef, useCallback } from 'react'
import JiantouFill from '@/assets/images/jiantou_fill.svg';
import { inject, observer } from "mobx-react";

const SpotMarketMenu = inject('store')(observer(function ({ menuData, onChangeMenu, store }) {
    const [leftArrowVisible, setLeftArrowVisible] = useState(false);
    const [rightArrowVisible, setRightArrowVisible] = useState(false);
    const [topDistance, setTopDistance] = useState(0);
    const [arrowHeight, setArrowHeight] = useState(38);
    const selectedMenu = store.menuSubType;
    const getCurMenuData = menu => {
        const { curMarketList } = store;
        const supportMarkets = Object.keys(curMarketList);
        return menu.filter(item => {
            let market1 = item.market.toUpperCase();
            market1 = market1 === 'USD_S' ? 'USDT' : market1;
            return supportMarkets.includes(market1)
        }
        )
    };
    const curMenuData = getCurMenuData(menuData);
    const displayMenu = curMenuData.slice(0, 6);
    const foldMenu = curMenuData.slice(6, curMenuData.length);
    const isBelongToFoldMenu = foldMenu.findIndex(o => o.market === selectedMenu);
    let selectedFold = null;
    if (isBelongToFoldMenu !== -1) {
        selectedFold = foldMenu[isBelongToFoldMenu]
    }
    const [showFoldMenu, setShowFoldMenu] = useState(false);
    const modalRef = useRef(null);
    const changeLastFold = selectedFoldMenu => {
        onChangeMenu && onChangeMenu(selectedFoldMenu.market)
    }
        ;
    const sendBeacon = (item, name) => {
        if (window.collectEvent) {
            let type = item.market;
            if (type === 'USD_S')
                type = 'USDT';
            if (type === 'FAVRT')
                type = 'custom';
            if (type === 'METAVERSE')
                type = 'Metaverse';
            if (type === 'ANIMAL')
                type = 'Meme';
            if (type === 'Polka')
                type = 'Polkadot_Ecosustem';
            if (type === 'STORAGE')
                type = 'Storage';
            if (type === 'EXCHANGE')
                type = 'Exchange-Based_Tokens';
            if (type === 'SYNTHETICS')
                type = 'Synthetic_Issuer';
            window.collectEvent('beconEvent', name, {
                button_name: type
            })
        }
    }
        ;
    const selectedFoldMenu = foldMenu.find(i => i.market.toUpperCase() == selectedMenu.toUpperCase());
    const subMenuRef = useRef(null);
    const subMenuContainerRef = useRef(null);
    const observerRef = useRef(null);
    observerRef.current = {
        setLeftArrowVisible,
        setRightArrowVisible,
        setTopDistance,
        setArrowHeight
    };
    useLayoutEffect(() => {
        if (!(subMenuContainerRef === null || subMenuContainerRef === void 0 ? void 0 : subMenuContainerRef.current) || !(subMenuRef === null || subMenuRef === void 0 ? void 0 : subMenuRef.current))
            return;
        const checkArrow = () => {
            subMenuRef.current.scrollLeft = 0;
            const containerWidth = subMenuContainerRef.current.offsetWidth;
            const subMenuWidth = subMenuRef.current.offsetWidth - 30;
            if (containerWidth > subMenuWidth) {
                observerRef.current.setLeftArrowVisible(false);
                observerRef.current.setRightArrowVisible(true)
            } else {
                observerRef.current.setLeftArrowVisible(false);
                observerRef.current.setRightArrowVisible(false)
            }
            observerRef.current.setTopDistance(subMenuRef.current.offsetTop);
            observerRef.current.setArrowHeight(subMenuRef.current.offsetHeight)
        }
            ;
        checkArrow();
        const callback = function (mutationsList) {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    checkArrow()
                }
            }
        };
        const config = {
            childList: true,
            subtree: true
        };
        const observer = new MutationObserver(callback);
        observer.observe(subMenuContainerRef === null || subMenuContainerRef === void 0 ? void 0 : subMenuContainerRef.current, config);
        return () => {
            observer.disconnect()
        }
    }
        , []);
    const toLeft = useCallback(() => {
        if (!(subMenuRef === null || subMenuRef === void 0 ? void 0 : subMenuRef.current))
            return;
        subMenuRef.current.scrollLeft = 0;
        setLeftArrowVisible(false);
        setRightArrowVisible(true)
    }, [setLeftArrowVisible, setRightArrowVisible, subMenuRef.current]);
    const toRight = useCallback(() => {
        if (!(subMenuRef === null || subMenuRef === void 0 ? void 0 : subMenuRef.current) || !(subMenuContainerRef === null || subMenuContainerRef === void 0 ? void 0 : subMenuContainerRef.current))
            return;
        subMenuRef.current.scrollLeft = subMenuContainerRef.current.offsetWidth - (subMenuRef.current.offsetWidth - 32);
        setRightArrowVisible(false);
        setLeftArrowVisible(true)
    }
        , [setLeftArrowVisible, setRightArrowVisible, subMenuRef === null || subMenuRef === void 0 ? void 0 : subMenuRef.current, subMenuContainerRef === null || subMenuContainerRef === void 0 ? void 0 : subMenuContainerRef.current]);
    return <div className='marketList_type_top' ref={subMenuRef}>
        {
            leftArrowVisible && <span style={{
                top: topDistance,
                height: arrowHeight
            }}></span>
        }
        <div className='marketList_type_top_container' ref={subMenuContainerRef}>
            <div className='market-sub-menu-display-container'>
                {
                    displayMenu.map((item, index) => {
                        const { market: market1, title } = item;
                        let isSelected = market1.toUpperCase() === selectedMenu.toUpperCase();
                        if (market1.toUpperCase() === 'USD_S' && selectedMenu.toUpperCase() === 'USDT') {
                            isSelected = true
                        }
                        let menuName = title[window.GLOBAL_PRO_TRADE.lang] ? title[window.GLOBAL_PRO_TRADE.lang] : title.en;
                        if (market1.toUpperCase() === 'FAVRT') {
                            menuName = <span className={`icon tradeiconfont icona-20px-Star-fill tab-fav-icon ${isSelected ? 'active' : ''}`}></span>
                        }
                        return (
                            <div onClick={() => {
                                onChangeMenu && onChangeMenu(item.market);
                                sendBeacon(item, 'trade_list_spot_type_click')
                            }}
                                className={`market-sub-menu-item ${isSelected ? 'active' : ''}`}
                                key={index}
                            >
                                {menuName}
                            </div>
                        )
                    })
                }
                {
                    foldMenu.length !== 0 && <div className='market-sub-menu-fold-container'
                        onMouseEnter={
                            () => {
                                setShowFoldMenu(true)
                            }
                        }
                        onMouseLeave={
                            () => {
                                setTimeout(() => {
                                    setShowFoldMenu(false)
                                }
                                    , 100)
                            }
                        }
                    >
                        <div
                            key={selectedFoldMenu === null || selectedFoldMenu === void 0 ? void 0 : selectedFoldMenu.market}
                            className={`market-sub-menu-item ${selectedMenu.toUpperCase() === (selectedFoldMenu === null || selectedFoldMenu === void 0 ? void 0 : selectedFoldMenu.market.toUpperCase()) ? 'active' : ''}`}
                            onClick={() => changeLastFold(selectedFoldMenu)}
                        >
                            {selectedFoldMenu ? selectedFoldMenu.title[window.GLOBAL_PRO_TRADE.lang] ? selectedFoldMenu.title[window.GLOBAL_PRO_TRADE.lang] : selectedFoldMenu.title.en : foldMenu[0].title[window.GLOBAL_PRO_TRADE.lang] ? foldMenu[0].title[window.GLOBAL_PRO_TRADE.lang] : foldMenu[0].title.en}
                        </div>

                        <div className='popup-market-select-menu-container'>
                            <JiantouFill className={`${selectedMenu.toUpperCase() === (selectedFoldMenu === null || selectedFoldMenu === void 0 ? void 0 : selectedFoldMenu.market.toUpperCase()) ? 'c-04091A' : ''} icon drop-down-icon`}></JiantouFill>
                            <div className='popup-menu-container-modal popup-menu-content' style={{ display: showFoldMenu ? 'block' : 'none' }}>
                                <div className='popup-menu-container' ref={modalRef}>
                                    {
                                        foldMenu.map(item => {
                                            const { market: market1, title } = item;
                                            let menuName = title[window.GLOBAL_PRO_TRADE.lang] ? title[window.GLOBAL_PRO_TRADE.lang] : title.en;
                                            return (
                                                <div className='popup-menu-item' key={market1}
                                                    onClick={() => {
                                                        changeLastFold(item);
                                                        sendBeacon(item, 'trade_spot_type_zone_click');
                                                        setShowFoldMenu(false)
                                                    }}
                                                >
                                                    {menuName}
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }

            </div>
        </div>
        {
            rightArrowVisible&& <a className='tradeiconfont icona-8px-jiantou-you marketList_right_arrow' style={{
                top: topDistance,
            height: arrowHeight
            }}
            onClick={toRight}></a>
        }
    </div>
}));

export default SpotMarketMenu