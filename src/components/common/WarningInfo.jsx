import React from 'react'
const WarningInfo = (props)=>{
    var {html=null, className='', text, ...others} = props;
    return <div className={'warning_info_container' + ` ${className}`} {...others}>
        <svg className="icon" aria-hidden="true">
            <use xlinkHref="#icona-12px-shuoming-fill"></use>
        </svg>
        {
            html ? html : <p>{text}</p>
        }
    </div>
}

export default WarningInfo