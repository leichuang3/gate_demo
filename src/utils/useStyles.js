import { createStyles } from '@mantine/styles';

const useTradeStyles = createStyles(theme=>{
    const isDark = theme.colorScheme === 'dark';
    return {
        sliderRoot: {
            height: 14
        },
        sliderThumb: {
            width: 14,
            height: 14,
            borderWidth: 2,
            background: isDark ? '#1F2433' : '#fff',
            border: `2px solid ${isDark ? '#3366FF' : UI_THEME.mainRed[0]}`
        },
        sliderBar: {
            left: '-2px !important'
        },
        sliderTrack: {
            height: 4,
            '&:before': {
                background: isDark ? '#292f40' : '#EEF1FA'
            }
        },
        sliderMark: {
            width: 14,
            height: 14,
            borderColor: isDark ? '#1F2433' : '#ffffff',
            backgroundColor: isDark ? '#292F40' : '#EEF1FA',
            transform: 'translate(-50%, -50%)',
            marginTop: 2
        },
        sliderMarkFilled: {
            background: isDark ? '#3366FF' : UI_THEME.mainRed[0],
            border: `2px solid ${isDark ? '#151926' : '#fff'}`
        },
        selectDropDown: {
            minWidth: 140,
            backgroundColor: isDark ? '#292F40' : '#ffffff',
            boxShadow: '0px 0px 24px rgba(70, 100, 140, 0.15)',
            borderRadius: 8,
            border: 'none',
            padding: '8px 0',
            right: 0,
            zIndex: 1e4,
            '&::-webkit-scrollbar': {
                width: 5
            },
            '&::-webkit-scrollbar-track': {
                background: 'transparent'
            }
        },
        selectItem: {
            zIndex: 1e4,
            height: 40,
            color: getColor(isDark, 9, 0),
            borderRadius: 0,
            lineHeight: '40px',
            padding: '0 16px',
            paddingRight: 0,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            '&:hover': {
                backgroundColor: isDark ? '#141C33' : '#F2F7FF',
                color: UI_THEME.mainRed[0]
            }
        },
        selectSelected: {
            backgroundColor: isDark ? '#141C33' : '#F2F7FF',
            color: UI_THEME.mainRed[0]
        },
        selectRoot: {
            height: 34,
            zIndex: 1e4
        },
        selectInputNoBg: {
            height: 34,
            minHeight: 34,
            paddingLeft: 8,
            paddingRight: 16,
            border: 'none',
            background: 'transparent !important',
            textAlign: 'right'
        },
        selectInput: {
            height: 34,
            minHeight: 34,
            paddingLeft: 8,
            paddingRight: 8,
            border: 'none',
            background: `${isDark ? '#1F2433' : '#f8fafd'} !important`
        },
        selectRightSection: {
            width: 12,
            right: '-2px',
            pointerEvents: 'none'
        },
        selectNoRightSection: {
            display: 'none'
        },
        checkboxRoot: {
            height: 16,
            alignItems: 'start'
        },
        checkboxLabel: {
            color: getColor(isDark, 9, 0),
            fontSize: 12,
            paddingLeft: 4,
            lineHeight: 1,
            marginTop: 2,
            flexShrink: 0
        },
        checkboxIcon: {
            cursor: 'pointer',
            margin: 0
        },
        checkboxInput: {
            borderRadius: 2,
            width: 16,
            height: 16,
            border: `1px solid ${isDark ? '#0f1526' : '#E6E9F2'}`,
            boxSizing: 'border-box',
            '&:hover': {
                border: `1px solid ${UI_THEME.mainRed[0]} !important`,
                cursor: 'pointer'
            },
            '&:checked': {
                background: `${isDark ? '#1F2433' : '#fff'} !important`,
                border: 'none !important'
            },
            '&:focus': {
                boxShadow: 'none',
                outline: 'none'
            },
            '&:focus-visible': {
                boxShadow: 'none',
                outline: 'none',
                borderColor: `${isDark ? '#0f1526' : '#E6E9F2'}`
            },
            '&:focus:not(:focus-visible)': {
                boxShadow: 'none',
                outline: 'none',
                borderColor: `${isDark ? '#0f1526' : '#E6E9F2'}`
            }
        },
        tooltipBody: {
            padding: 12,
            fontSize: 12,
            lineHeight: 1.5,
            color: '#fff',
            background: isDark ? '#474F66' : 'rgba(4, 9, 26, 0.9)',
            boxShadow: isDark ? '' : '0px 2px 4px rgba(4, 9, 25, 0.4)',
            borderRadius: 8,
            whiteSpace: 'break-spaces !important',
            maxWidth: 220
        },
        tooltipArrowBottom: {
            top: -16,
            marginLeft: -3,
            transform: 'none',
            background: 'none',
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '8px solid rgba(4, 9, 26, 0.9)',
            borderLeft: '6px solid transparent'
        },
        tooltipArrowTop: {
            top: 'unset',
            marginLeft: -3,
            bottom: -16,
            transform: 'none',
            background: 'none',
            width: 0,
            height: 0,
            borderBottom: '8px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '8px solid rgba(4, 9, 26, 0.9)',
            borderLeft: '6px solid transparent'
        },
        tooltipArrowLeft: {
            marginTop: -3,
            left: 'unset',
            right: -16,
            transform: 'none',
            background: 'none',
            width: 0,
            height: 0,
            borderBottom: '6px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '6px solid transparent',
            borderLeft: '8px solid rgba(4, 9, 26, 0.9)'
        },
        tooltipArrowRight: {
            marginTop: -3,
            right: 'unset',
            left: -16,
            transform: 'none',
            background: 'none',
            width: 0,
            height: 0,
            borderBottom: '6px solid transparent',
            borderLeft: '8px solid transparent',
            borderTop: '6px solid transparent',
            borderRight: '8px solid rgba(4, 9, 26, 0.9)'
        },
        tooltipArrowCustom1: {
            right: '25px !important',
            left: 'unset !important',
            top: 'unset',
            marginLeft: -3,
            bottom: -16,
            transform: 'none',
            background: 'none',
            width: 0,
            height: 0,
            borderBottom: '8px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: isDark ? '8px solid #474F66' : '8px solid rgba(4, 9, 26, 0.9)',
            borderLeft: '6px solid transparent'
        },
        tooltipArrowCustom2: {
            left: '35px !important',
            right: 'unset !important',
            top: 'unset',
            marginLeft: -3,
            bottom: -16,
            transform: 'none',
            background: 'none',
            width: 0,
            height: 0,
            borderBottom: '8px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: isDark ? '8px solid #474F66' : '8px solid rgba(4, 9, 26, 0.9)',
            borderLeft: '6px solid transparent'
        },
        switchLabel: {
            paddingLeft: 4
        },
        switchInput: {
            width: '48px !important',
            minWidth: '48px !important',
            height: 24,
            borderRadius: 140,
            cursor: 'pointer',
            background: isDark ? '#292F40 !important' : '#EEF1FA !important',
            borderColor: isDark ? '#292F40 !important' : '#EEF1FA !important',
            '&:before': {
                width: '20px',
                height: '20px',
                border: 'none'
            },
            '&:checked': {
                background: isDark ? '#3366FF !important' : '#2354e6 !important',
                borderColor: isDark ? '#3366FF !important' : '#2354e6 !important',
                boxShadow: '0px 0px 4px rgba(4, 9, 25, 0.15) !important',
                '&:before': {
                    transform: 'translateX(24px)'
                }
            }
        },
        modal: {
            padding: '24px 40px !important'
        },
        buttonCancelRoot: {
            height: 52,
            lineHeight: 1,
            fontSize: 20,
            background: 'transparent',
            color: UI_THEME.mainRed[0],
            border: `2px solid ${UI_THEME.mainRed[0]}`,
            '&:hover': {
                background: 'transparent',
                color: UI_THEME.mainRed[0]
            }
        },
        buttonConfirmRoot: {
            height: 52,
            lineHeight: 1,
            fontSize: 20,
            backgroundColor: UI_THEME.mainRed[0],
            '&:hover': {
                backgroundColor: UI_THEME.mainRed[0]
            }
        }
    }
}
);

export {
    useTradeStyles
}