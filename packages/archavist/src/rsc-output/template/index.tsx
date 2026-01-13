import {RscPayload, TemplateOptions} from "@/rsc-output/shared";
import {Content, type PipelineContext} from "@/core";

import {renderToReadableStream} from "@vitejs/plugin-rsc/rsc";
import React from "react";
import {setTemplateContext, templateContext} from "@/rsc-output/template/templateContext";
export * from "./templateContext"
export * from "@/core/NavTree"

export interface TemplateRenderer {
  render()
}

export function defineTemplate(options: TemplateOptions) {

  let template = options

  return {
    render: async (
      content: Content,
      context: PipelineContext
    ) => {
      {
        setTemplateContext({
          content: content,
          pipelineContext: context
        });

        const rscPayload: RscPayload = {root: <template.rootComponent content={content}/>};
        const rscStream = renderToReadableStream<RscPayload>(rscPayload)
        const [rscStream1, rscStream2] = rscStream.tee()

        const ssr = await import.meta.viteRsc
          .loadModule<typeof import('../entry.ssr')>('ssr', 'index')

        const ssrResult: ReadableStream<Uint8Array> = await ssr.renderHtml(rscStream1)

        return {html: ssrResult, rsc: rscStream2}
      }
    }
  }
}

