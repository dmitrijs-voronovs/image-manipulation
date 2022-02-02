import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

function MyApp({ Component, pageProps }: AppProps) {
  return <>
    <Script src={"https://cdnjs.cloudflare.com/ajax/libs/camanjs/4.1.2/caman.full.min.js"}/>
    <Component {...pageProps} />
  </>
}

export default MyApp
