import React, { useState, useEffect } from 'react';
import IconQiehuan from '@/assets/images/icona-16px-qiehuan.svg';
import IconSheng from '@/assets/images/liebiaoshaixuan-sheng.svg'
import IconJiang from '@/assets/images/liebiaoshaixuan-jiang.svg'
import IconMoren from '@/assets/images/liebiaoshaixuan-moren.svg'
import { inject, observer } from "mobx-react";
const SwitchTableHeaderItem = inject('store')(observer(function ({ store, children, onClick, showBubble, classN, switch_sort, set_switch_sort, set_sort, isMarketInfoHover }) {
    const [upOrDown, setUpOrDown] = useState('');
    const onClickBubble = () => {
        switch (upOrDown) {
            case 'up':
                setUpOrDown('down');
                onClick && onClick('down', true);
                break;
            case 'down':
                setUpOrDown('');
                onClick && onClick('', false);
                break;
            default:
                setUpOrDown('up');
                onClick && onClick('up', true);
                break
        }
    }
        ;
    useEffect(() => {
        if (!showBubble) {
            setUpOrDown('')
        }
    }
        , [showBubble]);
    useEffect(() => {
        if (store === null || store === void 0 ? void 0 : store.marketSimpleMode) {
            set_sort({
                key: '',
                desc: 0
            });
            set_switch_sort(2)
        }
    }, [store === null || store === void 0 ? void 0 : store.marketSimpleMode]);
    function switch_sort_Click() {
        if (switch_sort == 4) {
            set_switch_sort(2)
        } else {
            set_switch_sort(4)
        }
    }
    return <li
        onClick={onClickBubble}
        className={classN}
    >
        <span>
            {switch_sort == 2 ? lang_string('Change') : t('成交量')}
        </span>
        {
            store.searchText === '' ?
                (upOrDown === 'up' && <IconSheng className="icon" style={{ width: 12, height: 12 }}></IconSheng>)
                    || (upOrDown === 'down' && <IconJiang className="icon" style={{ width: 12, height: 12 }}></IconJiang>)
                    || (upOrDown === '' && <IconMoren className="icon" style={{ width: 12, height: 12 }}></IconMoren>)
                : null
        }
        {
            !(store === null || store === void 0 ? void 0 : store.marketSimpleMode) && !isMarketInfoHover && store.searchText === '' &&
            <IconQiehuan
                className="icon hover-text-1" style={{ width: 12, height: 12 }}
                onClick={
                    e => {
                        switch_sort_Click();
                        e.stopPropagation()
                    }
                }
            ></IconQiehuan>
        }
    </li>
}));

export default SwitchTableHeaderItem
