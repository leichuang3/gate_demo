
import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
const SearchInput = function ({ store, isMarketInfoHover = false, onSearchTextChange }) {
    const { marketFoldMode, marketAllFoldMode } = store;
    const [searchText, setSearchText] = useState(store.searchText);
    const [locked, setLocked] = useState(false);
    const clearSearchText = () => {
        setSearchText('');
        onSearchTextChange('')
    }
        ;
    useEffect(() => {
        if (!isMarketInfoHover) {
            clearSearchText()
        }
    }, [marketFoldMode, marketAllFoldMode]);
    useEffect(() => {
        setSearchText(store.searchText)
    }, [store.searchText]);
    const searchInputHandler = e => {
        setSearchText(e.target.value);
        switch (e.type) {
            case 'change':
                !locked && onSearchTextChange(e.target.value);
                return;
            case 'compositionstart':
                setLocked(true);
                return;
            case 'compositionend':
                setLocked(false);
                onSearchTextChange(e.target.value);
                return
        }
    }
        ;
    const handleFocus = () => {
        if (window.collectEvent) {
            window.collectEvent('beconEvent', 'trade_list_search_click', {
                button_name: 'search'
            })
        }
    };
    return (
        <div className='search-coin-container'>
            <span className='icon iconfont icon-a-14px-sousuo'>
            </span>
            <input type="text" id="top_search_input"
                placeholder={lang_string('搜索')}
                autoComplete={'off'}
                value={searchText}
                onChange={searchInputHandler}
                onCompositionStart={searchInputHandler}
                onCompositionEnd={searchInputHandler}
                onFocus={handleFocus}
            />
            {
                searchText && <span className='icon iconfont icon-a-24px-qingkong hover-brand' onClick={clearSearchText}></span>
            }
        </div>
    )
}

export default inject('store')(observer(SearchInput))