/* eslint-disable react/no-unescaped-entities */
import Layout from '../components/layout'
import Head from 'next/head'
import React from 'react'
// import Script from 'next/script'
import '@/assets/style/iconfont.css';
import '@/assets/style/cross_margin_modal.css';
import '@/assets/style/common.css';
import '@/assets/style/theme_classicDark.css';
import '@/assets/style/theme_config.css';
import '@/assets/style/tradingview_v22_trade.css';
import '@/assets/style/unified_account_open_modal.css';
import '@/assets/style/unifiedTransfer.css';
import '@/assets/style/theme_colors.css';
import '@/assets/style/pro_trade.css';
import '@/assets/style/gate.io_fonts_gate_pro_trade_iconfont.css';
import '@/assets/style/classic_dark.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  )
}