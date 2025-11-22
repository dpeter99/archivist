import { createFromReadableStream } from '@vitejs/plugin-rsc/browser'
import { rscStream } from "rsc-html-stream/client"

import { hydrateRoot } from "react-dom/client"
import {RscPayload} from "@/core/steps/ReactOutput/shared";


async function hydrate(): Promise<void> {
  const initialPayload = await createFromReadableStream<RscPayload>(rscStream)

  hydrateRoot(document, initialPayload.root)

  if (import.meta.hot) {
    import.meta.hot.on('rsc:update', () => {
      window.history.replaceState({}, '', window.location.href)
    })
  }
}

hydrate()