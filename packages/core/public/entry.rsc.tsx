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
  const ssrResult = await ssr.renderHtml(rscStream1)

  return { html: ssrResult.stream, rsc: rscStream2 }
}


export type TemplateOptions = {
  rootComponent: ReactNode;
}

export function defineTemplate(options: TemplateOptions) {
  return options;
}