import React from 'react'

import { useTradeStyles } from "../../utils/useStyles";
import { Tooltip } from '@mantine/core';

const Tooltips = props => {
    const { classes } = useTradeStyles();
    const arrowClassMap = {
        top: 'mantine_tooltip_arrow_top',
        bottom: 'mantine_tooltip_arrow_bottom',
        left: 'mantine_tooltip_arrow_left',
        right: 'mantine_tooltip_arrow_right'
    };
    const { position = 'bottom', label, arrowStyle } = props;
    const content = label && typeof label == 'string' ? label.replace(/<br>/g, '\n').replace(/<br\/>/g, '\n') : label;
    return (
        <Tooltip {...props}
            classNames={{
                body: 'mantine_tooltip_body',
                arrow: arrowStyle ? classes[arrowStyle] : arrowClassMap[position]
            }}
            withArrow={true}
            position={position}
            label={content}
            transition="fade"
            transitionDuration={200}
            withinPortal={true}
            zIndex={1001}
        >{props.children}</Tooltip>
    )
}
export default Tooltips;