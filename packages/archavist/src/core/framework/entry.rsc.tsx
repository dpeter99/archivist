import '@vitejs/plugin-rsc/types';
import React from 'react';
import {RscPayload} from "@/core/steps/ReactOutput/shared";
import {renderToReadableStream} from "@vitejs/plugin-rsc/rsc";
import { template } from 'template';
import { setCurrentContent, setNavTree } from '@dpeter99/archavist/template';
import { Content } from '../Content';
import type { NavTreeNode } from '../NavTree';

export async function render(content: Content, navTree?: NavTreeNode[]){
  // Set the current content in global context
  setCurrentContent(content);

  // Set the navigation tree in global context
  setNavTree(navTree);

  const rscPayload: RscPayload = { root: <template.rootComponent content={content} /> };
  const rscStream = renderToReadableStream<RscPayload>(rscPayload)
  const [rscStream1, rscStream2] = rscStream.tee()

  const ssr = await import.meta.viteRsc.loadModule<
    typeof import('./entry.ssr')
  >('ssr', 'index')
  const ssrResult: ReadableStream<Uint8Array> = await ssr.renderHtml(rscStream1)

  return { html: ssrResult, rsc: rscStream2 }
}