import React from 'react'
import { Switch } from '@mantine/core';
import { useTradeStyles } from '../../utils/useStyles';

const SwitchComponent = props => {
    const { classes } = useTradeStyles();
    return (
        <Switch {...props} classNames={{
            root: 'mantine_switch_root',
            label: 'mantine_switch_label',
            input: classes.switchInput
        }}>
        </Switch>
    )
};
export default SwitchComponent