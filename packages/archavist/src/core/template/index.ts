import {TemplateOptions} from "@/core/steps/ReactOutput/shared";
export { getCurrentContent, setCurrentContent } from './currentContent';
export { getNavTree, setNavTree } from './navTree';
export type { NavTreeNode } from '../NavTree';

export function defineTemplate(options: TemplateOptions) {
  return options;
}