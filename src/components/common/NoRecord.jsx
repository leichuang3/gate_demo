import React from 'react';

const NoRecord = props => {
    return (
        <div className="record_null" {...props}>
            <div className="no_record">
                <div className="no_record_icon"></div>
                <div className="no_record_tips">{lang_string('暂无数据')}</div>
            </div>
        </div>
    )

}

export default NoRecord