import React from 'react'
const MarketTypeItem = ({ marketTypeName, onClick, isActive, key, isSearching = false }) => {

    return (
        <div className="market-type-item-container" onClick={() => onClick && onClick()}>
            {
                isSearching ? <div className={`market-type-item-name-searching ${isActive ? 'active' : ''}`}>{marketTypeName}</div>
                    : <>
                        <div className={`market-type-item-name ${isActive ? 'active' : ''}`}>
                            {marketTypeName}
                        </div>
                        <div className={`market-type-item-isActive ${isActive ? 'active' : ''}`}></div>
                    </>
            }
        </div>
    )
}
export default MarketTypeItem