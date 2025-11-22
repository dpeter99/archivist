import { createFromReadableStream } from '@vitejs/plugin-rsc/ssr'
import { prerender } from 'react-dom/static.edge'
import { injectRSCPayload } from 'rsc-html-stream/server'
import type { RscPayload } from '@/core/steps/ReactOutput/shared'

export async function renderHtml(
  rscStream: ReadableStream<Uint8Array>,
): Promise<ReadableStream<Uint8Array>> {
  const [rsc1, rsc2] = rscStream.tee();

  const rscPayload = await createFromReadableStream<RscPayload>(rsc1)

  const bootstrapScriptContent = await import.meta.viteRsc.loadBootstrapScriptContent('index')

  const prerenderResult = await prerender(rscPayload.root, {
    bootstrapScriptContent,
  })
  let htmlStream: ReadableStream<Uint8Array> = prerenderResult.prelude


  let responseStream: ReadableStream<Uint8Array> = htmlStream
  responseStream = responseStream.pipeThrough(injectRSCPayload(rsc2))
  return responseStream
}
