import Document, { Html, Head, Main, NextScript } from 'next/document'
 
export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
          <div id="dock-tooltip-root"></div>
        </body>
      </Html>
    )
  }
}