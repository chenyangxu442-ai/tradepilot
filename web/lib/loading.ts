// ponytail: global flag shared by useGenerate + NavMain — no context provider needed
let isLoading = false;
export function setGenerating(v: boolean) { isLoading = v; }
export function isGenerating() { return isLoading; }
