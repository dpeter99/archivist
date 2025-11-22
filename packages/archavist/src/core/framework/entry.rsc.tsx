import {ReactElement} from "react";
import {RscPayload, TemplateOptions} from "@/core/steps/ReactOutput/shared";
import {renderToReadableStream} from "@vitejs/plugin-rsc/rsc";
import { template } from 'template';

export async function render(){
  
  const rscPayload: RscPayload = { root: template.rootComponent };
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