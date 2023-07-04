import React, { useEffect } from 'react';

import { createGetInitialProps } from "@mantine/next";
import Document, { Head, Html, Main, NextScript } from "next/document";
import Script from 'next/script'

const getInitialProps = createGetInitialProps();

export default class _Document extends Document {
  static getInitialProps = getInitialProps;
  render() {
    return (
      <Html>
        <Head >
          <Script src='/jquery.min.js' strategy='beforeInteractive' />
          <Script src='/jquery.min.js' strategy='beforeInteractive' />
          <Script id="global" strategy='beforeInteractive' dangerouslySetInnerHTML={{
            __html: ` 
          var dark_version = "1653657532";
          var classicDark_version = "1687680140";
          var g_lang = 'cn',nickName = '',isDebug = '',pageName = 'convert',data_expired_leftbar = Number(''),is_show_margin_page_japan = '0',is_show_margin_tab = '0',is_show_fiat_tab = '1',is_sub_account = "",sub_account_warning = '子账号不支持该功能',globalSearchUserId = '';
          window.uid = '';`}}>
          </Script>
          <Script src='/lang_cn.js' strategy='beforeInteractive' />
          <Script src='/lang_zh.js' strategy='beforeInteractive' />
          <Script src='/lang_trade_zh.js' strategy='beforeInteractive' />
          <Script src='/big.js' strategy='beforeInteractive' />
          <Script src='/jquery.common.tools.js' strategy='beforeInteractive'/>
        </Head>
        <body className='classic-dark'>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}