import {ReactElement, ReactNode} from "react";
import {RscPayload} from "@/core/steps/ReactOutput/shared";
import {renderToReadableStream} from "@vitejs/plugin-rsc/rsc";

export async function render(component: ReactElement){
  const rscPayload: RscPayload = { root: component };
  const rscStream = renderToReadableStream<RscPayload>(rscPayload)
  const [rscStream1, rscStream2] = rscStream.tee()

  const ssr = await import.meta.viteRsc.loadModule<
    typeof import('./entry.ssr')
  >('ssr', 'index')
  const ssrResult: ReadableStream<Uint8Array> = await ssr.renderHtml(rscStream1)

  return { html: ssrResult, rsc: rscStream2 }
}



export function defineTemplate(options: TemplateOptions) {
  return options;
}