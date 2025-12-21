import { createFromReadableStream } from '@vitejs/plugin-rsc/browser'
import { rscStream } from "rsc-html-stream/client"

import { hydrateRoot } from "react-dom/client"
import {RscPayload} from "@/rsc-output/shared";

async function hydrate(): Promise<void> {
  const initialPayload = await createFromReadableStream<RscPayload>(rscStream)

  hydrateRoot(document, initialPayload.root)
}

hydrate()