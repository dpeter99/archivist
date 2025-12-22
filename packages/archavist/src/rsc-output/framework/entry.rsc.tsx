import '@vitejs/plugin-rsc/types';
import React from 'react';
import {RscPayload} from "@/rsc-output/shared";
import {renderToReadableStream} from "@vitejs/plugin-rsc/rsc";
import { template } from 'template';
import { setCurrentContent, setNavTree, setAssetManifest } from '@dpeter99/archavist/template';
import { Content } from '../../core/Content';
import type { NavTreeNode } from '../../core/NavTree';
import type { PipelineContext } from '../../core/pipeline/types';
import {AssetManifestComponent, ComponentStore} from "@/core";

export async function render(
  content: Content,
  navTree: NavTreeNode[] | undefined,
  context: PipelineContext
) {
  // Set the current content in global context
  setCurrentContent(content);

  // Set the navigation tree in global context
  setNavTree(navTree);

  // Extract and set asset manifest from pipeline context data components
  const assetManifest = context.dataComponents.get<AssetManifestComponent>('asset-manifest');
  setAssetManifest(assetManifest);

  const rscPayload: RscPayload = { root: <template.rootComponent content={content} /> };
  const rscStream = renderToReadableStream<RscPayload>(rscPayload)
  const [rscStream1, rscStream2] = rscStream.tee()

  const ssr = await import.meta.viteRsc.loadModule<
    typeof import('./entry.ssr')
  >('ssr', 'index')
  const ssrResult: ReadableStream<Uint8Array> = await ssr.renderHtml(rscStream1)

  return { html: ssrResult, rsc: rscStream2 }
} 