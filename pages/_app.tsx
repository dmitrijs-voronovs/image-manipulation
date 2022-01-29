import '../styles/globals.css'
import type { AppProps } from 'next/app'
import {ChakraProvider} from "@chakra-ui/react";
import Script from 'next/script'

function MyApp({ Component, pageProps }: AppProps) {
  return <ChakraProvider>
    <Script src={"https://cdnjs.cloudflare.com/ajax/libs/camanjs/4.1.2/caman.full.min.js"} />
    <Component {...pageProps} />
  </ChakraProvider>
}

export default MyApp
