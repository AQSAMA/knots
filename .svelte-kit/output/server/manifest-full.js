export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "knots/_app",
	assets: new Set(["robots.txt"]),
	mimeTypes: {".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.D0vKHzlm.js",app:"_app/immutable/entry/app.SwbnyTXO.js",imports:["_app/immutable/entry/start.D0vKHzlm.js","_app/immutable/chunks/lA9DkBN0.js","_app/immutable/chunks/R3GQYbC8.js","_app/immutable/chunks/Amah2ZdW.js","_app/immutable/entry/app.SwbnyTXO.js","_app/immutable/chunks/R3GQYbC8.js","_app/immutable/chunks/CUTyfjMG.js","_app/immutable/chunks/Ct2-c4st.js","_app/immutable/chunks/Amah2ZdW.js","_app/immutable/chunks/B_A-yTTI.js","_app/immutable/chunks/CIRRCpDg.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
