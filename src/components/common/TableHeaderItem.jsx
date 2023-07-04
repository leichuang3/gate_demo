import React, { useState, useEffect } from 'react'
import IconSheng from '@/assets/images/liebiaoshaixuan-sheng.svg'
import IconJiang from '@/assets/images/liebiaoshaixuan-jiang.svg'
import IconMoren from '@/assets/images/liebiaoshaixuan-moren.svg'

const TableHeaderItem = ({ children, onClick, showBubble, classN, isfuture, isSearching = false }) => {
    const [upOrDown, setUpOrDown] = useState('');
    const onClickBubble = () => {
        if (window.collectEvent && !isfuture) {
            window.collectEvent('beconEvent', 'trade_sorting_turn_click', {
                sorting: upOrDown === 'up' ? 'sorting_positive' : 'sorting_reverse'
            })
        }
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
    return <li
        onClick={onClickBubble}
        className={classN}
    >
        {children}
        {
            !isSearching ?
                (upOrDown === 'up' && <IconSheng className="icon" style={{width: 12, height: 12}}></IconSheng>)
                    || (upOrDown === 'down' && <IconJiang className="icon" style={{width: 12, height: 12}}></IconJiang>)
                    || (upOrDown === '' && <IconMoren className="icon" style={{width: 12, height: 12}}></IconMoren>)
                : null
        }
    </li>
}
export default TableHeaderItem