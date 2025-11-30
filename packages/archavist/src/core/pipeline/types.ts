/**
 * Core types for the static site generator pipeline
 */

import {Content, DataComponent} from "../Content";
import {NavTreeNode} from "../NavTree";
import {ArchavistConfig} from "@/core";

/**
 * Context object that flows through the pipeline
 */
export interface PipelineContext {
  /** Site configuration */
  config: ArchavistConfig;

  content: Content[];
  /** Navigation tree built from content URLs */
  navTree?: NavTreeNode[];
  /** Shared data components registry for cross-step data sharing */
  dataComponents: DataComponent[];
}