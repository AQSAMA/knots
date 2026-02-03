

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.DakmwlzC.js","_app/immutable/chunks/Ct2-c4st.js","_app/immutable/chunks/R3GQYbC8.js","_app/immutable/chunks/CcT1I_mv.js","_app/immutable/chunks/CIRRCpDg.js"];
export const stylesheets = ["_app/immutable/assets/0.Z_kjxn8B.css"];
export const fonts = [];
