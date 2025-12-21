import {ComponentType, ReactNode} from "react";
import type { Content } from "../core/Content";


export type RscPayload = {
  root: ReactNode
}

export type TemplateOptions = {
  rootComponent: ComponentType<{ content: Content }>;
}
