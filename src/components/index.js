import React, { createContext, useState, useEffect } from "react";
import ReactDOM from 'react-dom'
import { createStyles } from '@mantine/core'
const ColorSchemeContext = createContext(null);

const useMantineStyles = createStyles(theme=>{
    const isDark = theme.colorScheme === 'dark';
    const mainColor = UI_THEME.mainRed[Number(isDark)];
    return {
        radio: {
            marginRight: 4,
            '&:checked': {
                background: isDark ? '#161A1E' : '#fff',
                borderColor: mainColor
            },
            '&:checked:before': {
                backgroundColor: mainColor,
                width: 10,
                height: 10
            }
        },
        modal: {
            padding: '14px 24px 24px 24px',
            '*': {
                boxSizing: 'border-box'
            },
            background: getColor(isDark, 1)
        },
        modalInner: {
            padding: '80px 16px'
        },
        modalCenterInner: {
            alignItems: 'center',
            padding: '80px 16px'
        },
        modalheader: {
            borderBottom: `1px solid ${getColor(isDark, 4)}`,
            margin: '0 -24px',
            padding: '0 24px 14px 24px',
            fontSize: 18,
            fontWeight: 500
        },
        modalMobileHeader: {
            margin: '0 -24px',
            padding: '0 24px 14px 24px',
            fontSize: 16,
            fontWeight: 500,
            display: 'grid',
            gridTemplateColumns: 'auto 28px',
            alignItems: 'center',
            justifyContent: 'normal'
        },
        modalCenteredTitle: {
            width: 'calc(100% + 28px)',
            textAlign: 'center'
        },
        modalBody: {
            paddingTop: 24
        },
        modalClose: {
            '&:focus': {
                boxShadow: 'none'
            }
        },
        inputWrapper: {
            background: isDark ? '#161A1E' : '#fff',
            borderColor: 'red',
            '&:disabled': {
                background: 'red'
            }
        },
        inputContent: {
            border: `1px solid ${getColor(isDark, 5)}`,
            color: getColor(isDark, 9),
            fontWeight: '500',
            paddingRight: '56px',
            '&:disabled': {
                background: getColor(isDark, 3)
            },
            '&:focus': {
                border: `1px solid ${getColor(isDark, 5)}`
            }
        },
        inputRightSection: {
            paddingRight: '8px',
            color: getColor(isDark, 9),
            fontWeight: '500',
            width: 'fit-content !important'
        },
        pagiItem: {
            background: 'none',
            color: getColor(isDark, 9),
            border: 'none',
            height: '28px',
            lineHeight: '29px',
            '&:hover': {
                background: getColor(isDark, 3)
            }
        },
        pagiItemActive: {
            background: getColor(isDark, 3),
            color: UI_THEME.mainRed[Number(isDark)]
        },
        popover: {
            background: 'var(--color-card-2)'
        },
        popoverBody: {
            border: 'none'
        }
    }
}
);
function WithDefaultImg(_param) {
    var {src, defaultImg, ...props} = _param
    const [isImageError,setIsImageError] = useState(false);
    useEffect(()=>{
        setIsImageError(false)
    }
    , [src]);
    return (<img
        src= {isImageError ? defaultImg : src}
        alt=""
        onError= {
            ()=>{
                setIsImageError(true)
            }
        }
        {...props}
    />)
}
const CustomModal = ({className, children})=>{
    const [el] = useState(document.createElement('div'));
    useEffect(()=>{
        el.classList.add(className);
        document.body.appendChild(el);
        document.body.classList.add('no-scroll');
        return ()=>{
            document.body.removeChild(el);
            document.body.classList.remove('no-scroll')
        }
    }
    , []);
    return ReactDOM.createPortal(children, el)
}
export {
    WithDefaultImg,
    CustomModal,
    useMantineStyles,
    ColorSchemeContext,
}