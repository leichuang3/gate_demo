import '@/utils/globalTrade'
import '@/utils/website_common';

import { MantineProvider } from '@mantine/core';
import { ColorSchemeContext, UI_THEME } from '../../components'
import React, { useState, useMemo, useEffect } from 'react'
import { Provider } from 'mobx-react';
import { useStore } from '../../store/GlobalStore';
import Main from './Main';
// import Script from 'next/script'
export default function MyApp() {
    const [colorScheme, setColorScheme] = useState('dark');
    const theme = useMemo(() => {
        return {
            ...UI_THEME,
            colorScheme,
            dir: 'ltr'
        }
    }, [colorScheme])
    const globalStore = useStore();
    window.globalStore = globalStore
    return (
        <>
            <ColorSchemeContext.Provider value={
                {
                    colorScheme,
                    onChange: setColorScheme
                }
            }>
                <Provider store={globalStore}>
                    <MantineProvider theme={theme}>
                        <Main></Main>
                    </MantineProvider>
                </Provider>
            </ColorSchemeContext.Provider>
        </>
    )
}