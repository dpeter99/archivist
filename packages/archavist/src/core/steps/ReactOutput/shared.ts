import {ComponentType, ReactNode} from "react";
import type { Content } from "../../Content";


export type RscPayload = {
  root: ReactNode
}

export type TemplateOptions = {
  rootComponent: ComponentType<{ content: Content }>;
}
