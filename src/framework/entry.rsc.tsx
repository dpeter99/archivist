import { renderToReadableStream } from "@vitejs/plugin-rsc/rsc";
import { Root } from "../template/root.tsx"
import type { RscPayload } from "./shared";


export default async function handler (request: Request) {

  // differentiate RSC and SSR request
  const url = new URL(request.url)
  //
  const rscPayload: RscPayload = { root: <Root url={url} /> }
  const rscStream = renderToReadableStream<RscPayload>(rscPayload)

  const ssr = await import.meta.viteRsc.loadModule<typeof import('./entry.ssr')>('ssr', 'index')
  const { stream } = await ssr.renderHtml(rscStream)

  return new Response(stream, {
    // status: ssrResult.status,
    headers: {
      'content-type': 'text/html;charset=utf-8',
    },
  })
}

// add `import.meta.hot.accept` to handle server module change efficiently
if (import.meta.hot) {
  import.meta.hot.accept()
}