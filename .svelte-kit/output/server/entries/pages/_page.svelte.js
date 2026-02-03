import "clsx";
import { g as get, w as writable, d as derived, r as readable } from "../../chunks/index.js";
import * as THREE from "three";
import { REVISION, DefaultLoadingManager, Vector3, Sphere, Matrix4, Ray, Object3D, Vector2, TextureLoader, Mesh, ShaderChunk, Points, Spherical, Color, BufferGeometry, BufferAttribute, ShaderMaterial, AdditiveBlending, Box3, CanvasTexture, MeshBasicMaterial } from "three";
import mitt from "mitt";
import { b as bind_props, s as store_get, u as unsubscribe_stores, c as spread_props, d as sanitize_props, e as rest_props, f as attributes, g as clsx, j as ensure_array_like, k as element, l as slot, m as attr_class, a as attr, n as attr_style } from "../../chunks/index2.js";
import { a1 as ssr_context, $ as getContext, Z as setContext, a2 as fallback } from "../../chunks/context.js";
import "camera-controls";
import "three-viewport-gizmo";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GroundedSkybox } from "three/examples/jsm/objects/GroundedSkybox.js";
import { OrbitControls as OrbitControls$1 } from "three/examples/jsm/controls/OrbitControls.js";
import { shaderStructs, shaderIntersectFunction, MeshBVHUniformStruct } from "three-mesh-bvh";
import "@threejs-kit/instanced-sprite-mesh";
import { Text as Text$1 } from "troika-three-text";
import * as math from "mathjs";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
function fromStore(store) {
  if ("set" in store) {
    return {
      get current() {
        return get(store);
      },
      set current(v) {
        store.set(v);
      }
    };
  }
  return {
    get current() {
      return get(store);
    }
  };
}
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
async function tick() {
}
const useCache = () => {
  const cache = getContext("threlte-cache");
  if (!cache) {
    throw new Error("No cache found. The cache can only be used in a child component to <Canvas>.");
  }
  return cache;
};
const signal = /* @__PURE__ */ Symbol();
const isStore = (dep) => {
  return typeof dep?.subscribe === "function";
};
const runObserve = (dependencies, callback, pre) => {
  const stores = dependencies().map((d) => {
    if (isStore(d)) {
      return fromStore(d);
    }
    return signal;
  });
  dependencies().map((d, i) => {
    if (stores[i] === signal) return d;
    return stores[i].current;
  });
};
const observePost = (dependencies, callback) => {
  return runObserve(dependencies);
};
const observePre = (dependencies, callback) => {
  return runObserve(dependencies);
};
const observe = Object.assign(observePost, { pre: observePre });
const isInstanceOf = (obj, type) => {
  return obj?.[`is${type}`] === true;
};
const browser = typeof window !== "undefined";
REVISION.replace("dev", "");
const currentWritable = (value) => {
  const store = writable(value);
  const extendedWritable = {
    set: (value2) => {
      extendedWritable.current = value2;
      store.set(value2);
    },
    subscribe: store.subscribe,
    update: (fn) => {
      const newValue = fn(extendedWritable.current);
      extendedWritable.current = newValue;
      store.set(newValue);
    },
    current: value
  };
  return extendedWritable;
};
const resolvePropertyPath = (target, propertyPath) => {
  if (propertyPath.includes(".")) {
    const path = propertyPath.split(".");
    const key = path.pop();
    for (let i = 0; i < path.length; i += 1) {
      target = target[path[i]];
    }
    return {
      target,
      key
    };
  } else {
    return {
      target,
      key: propertyPath
    };
  }
};
const useDOM = () => {
  const context = getContext("threlte-dom-context");
  if (!context) {
    throw new Error("useDOM can only be used in a child component to <Canvas>.");
  }
  return context;
};
class DAG {
  allVertices = {};
  /** Nodes that are fully unlinked */
  isolatedVertices = {};
  connectedVertices = {};
  sortedConnectedValues = [];
  needsSort = false;
  emitter = mitt();
  emit = this.emitter.emit.bind(this.emitter);
  on = this.emitter.on.bind(this.emitter);
  off = this.emitter.off.bind(this.emitter);
  get sortedVertices() {
    return this.mapNodes((value) => value);
  }
  moveToIsolated(key) {
    const vertex = this.connectedVertices[key];
    if (!vertex)
      return;
    this.isolatedVertices[key] = vertex;
    delete this.connectedVertices[key];
  }
  moveToConnected(key) {
    const vertex = this.isolatedVertices[key];
    if (!vertex)
      return;
    this.connectedVertices[key] = vertex;
    delete this.isolatedVertices[key];
  }
  getKey = (v) => {
    if (typeof v === "object") {
      return v.key;
    }
    return v;
  };
  add(key, value, options) {
    if (this.allVertices[key] && this.allVertices[key].value !== void 0) {
      throw new Error(`A node with the key ${key.toString()} already exists`);
    }
    let vertex = this.allVertices[key];
    if (!vertex) {
      vertex = {
        value,
        previous: /* @__PURE__ */ new Set(),
        next: /* @__PURE__ */ new Set()
      };
      this.allVertices[key] = vertex;
    } else if (vertex.value === void 0) {
      vertex.value = value;
    }
    const hasEdges = vertex.next.size > 0 || vertex.previous.size > 0;
    if (!options?.after && !options?.before && !hasEdges) {
      this.isolatedVertices[key] = vertex;
      this.emit("node:added", {
        key,
        type: "isolated",
        value
      });
      return;
    } else {
      this.connectedVertices[key] = vertex;
    }
    if (options?.after) {
      const afterArr = Array.isArray(options.after) ? options.after : [options.after];
      afterArr.forEach((after) => {
        vertex.previous.add(this.getKey(after));
      });
      afterArr.forEach((after) => {
        const afterKey = this.getKey(after);
        const linkedAfter = this.allVertices[afterKey];
        if (!linkedAfter) {
          this.allVertices[afterKey] = {
            value: void 0,
            // uninitialized
            previous: /* @__PURE__ */ new Set(),
            next: /* @__PURE__ */ new Set([key])
          };
          this.connectedVertices[afterKey] = this.allVertices[afterKey];
        } else {
          linkedAfter.next.add(key);
          this.moveToConnected(afterKey);
        }
      });
    }
    if (options?.before) {
      const beforeArr = Array.isArray(options.before) ? options.before : [options.before];
      beforeArr.forEach((before) => {
        vertex.next.add(this.getKey(before));
      });
      beforeArr.forEach((before) => {
        const beforeKey = this.getKey(before);
        const linkedBefore = this.allVertices[beforeKey];
        if (!linkedBefore) {
          this.allVertices[beforeKey] = {
            value: void 0,
            // uninitialized
            previous: /* @__PURE__ */ new Set([key]),
            next: /* @__PURE__ */ new Set()
          };
          this.connectedVertices[beforeKey] = this.allVertices[beforeKey];
        } else {
          linkedBefore.previous.add(key);
          this.moveToConnected(beforeKey);
        }
      });
    }
    this.emit("node:added", {
      key,
      type: "connected",
      value
    });
    this.needsSort = true;
  }
  remove(key) {
    const removeKey = this.getKey(key);
    const unlinkedVertex = this.isolatedVertices[removeKey];
    if (unlinkedVertex) {
      delete this.isolatedVertices[removeKey];
      delete this.allVertices[removeKey];
      this.emit("node:removed", {
        key: removeKey,
        type: "isolated"
      });
      return;
    }
    const linkedVertex = this.connectedVertices[removeKey];
    if (!linkedVertex) {
      return;
    }
    linkedVertex.next.forEach((nextKey) => {
      const nextVertex = this.connectedVertices[nextKey];
      if (nextVertex) {
        nextVertex.previous.delete(removeKey);
        if (nextVertex.previous.size === 0 && nextVertex.next.size === 0) {
          this.moveToIsolated(nextKey);
        }
      }
    });
    linkedVertex.previous.forEach((prevKey) => {
      const prevVertex = this.connectedVertices[prevKey];
      if (prevVertex) {
        prevVertex.next.delete(removeKey);
        if (prevVertex.previous.size === 0 && prevVertex.next.size === 0) {
          this.moveToIsolated(prevKey);
        }
      }
    });
    delete this.connectedVertices[removeKey];
    delete this.allVertices[removeKey];
    this.emit("node:removed", {
      key: removeKey,
      type: "connected"
    });
    this.needsSort = true;
  }
  mapNodes(callback) {
    if (this.needsSort) {
      this.sort();
    }
    const result = [];
    this.forEachNode((value, index) => {
      result.push(callback(value, index));
    });
    return result;
  }
  forEachNode(callback) {
    if (this.needsSort) {
      this.sort();
    }
    let index = 0;
    for (; index < this.sortedConnectedValues.length; index++) {
      callback(this.sortedConnectedValues[index], index);
    }
    Reflect.ownKeys(this.isolatedVertices).forEach((key) => {
      const vertex = this.isolatedVertices[key];
      if (vertex.value !== void 0)
        callback(vertex.value, index++);
    });
  }
  getValueByKey(key) {
    return this.allVertices[key]?.value;
  }
  getKeyByValue(value) {
    return Reflect.ownKeys(this.connectedVertices).find((key) => this.connectedVertices[key].value === value) ?? Reflect.ownKeys(this.isolatedVertices).find((key) => this.isolatedVertices[key].value === value);
  }
  sort() {
    const inDegree = /* @__PURE__ */ new Map();
    const zeroInDegreeQueue = [];
    const result = [];
    const connectedVertexKeysWithValues = Reflect.ownKeys(this.connectedVertices).filter((key) => {
      const vertex = this.connectedVertices[key];
      return vertex.value !== void 0;
    });
    connectedVertexKeysWithValues.forEach((vertex) => {
      inDegree.set(vertex, 0);
    });
    connectedVertexKeysWithValues.forEach((vertexKey) => {
      const vertex = this.connectedVertices[vertexKey];
      vertex.next.forEach((next) => {
        const nextVertex = this.connectedVertices[next];
        if (!nextVertex)
          return;
        inDegree.set(next, (inDegree.get(next) || 0) + 1);
      });
    });
    inDegree.forEach((degree, value) => {
      if (degree === 0) {
        zeroInDegreeQueue.push(value);
      }
    });
    while (zeroInDegreeQueue.length > 0) {
      const vertexKey = zeroInDegreeQueue.shift();
      result.push(vertexKey);
      const v = connectedVertexKeysWithValues.find((key) => key === vertexKey);
      if (v) {
        this.connectedVertices[v]?.next.forEach((adjVertex) => {
          const adjVertexInDegree = (inDegree.get(adjVertex) || 0) - 1;
          inDegree.set(adjVertex, adjVertexInDegree);
          if (adjVertexInDegree === 0) {
            zeroInDegreeQueue.push(adjVertex);
          }
        });
      }
    }
    if (result.length !== connectedVertexKeysWithValues.length) {
      throw new Error("The graph contains a cycle, and thus can not be sorted topologically.");
    }
    const filterUndefined = (value) => value !== void 0;
    this.sortedConnectedValues = result.map((key) => this.connectedVertices[key].value).filter(filterUndefined);
    this.needsSort = false;
  }
  clear() {
    this.allVertices = {};
    this.isolatedVertices = {};
    this.connectedVertices = {};
    this.sortedConnectedValues = [];
    this.needsSort = false;
  }
  static isKey(value) {
    return typeof value === "string" || typeof value === "symbol";
  }
  static isValue(value) {
    return typeof value === "object" && "key" in value;
  }
}
const useScheduler = () => {
  const context = getContext("threlte-scheduler-context");
  if (!context) {
    throw new Error("useScheduler can only be used in a child component to <Canvas>.");
  }
  return context;
};
const useCamera = () => {
  const context = getContext("threlte-camera-context");
  if (!context) {
    throw new Error("useCamera can only be used in a child component to <Canvas>.");
  }
  return context;
};
const parentContextKey = /* @__PURE__ */ Symbol("threlte-parent-context");
const createParentContext = (parent) => {
  const ctx = currentWritable(parent);
  setContext(parentContextKey, ctx);
  return ctx;
};
const useParent = () => {
  const parent = getContext(parentContextKey);
  return parent;
};
const parentObject3DContextKey = /* @__PURE__ */ Symbol("threlte-parent-object3d-context");
const createParentObject3DContext = (object) => {
  const parentObject3D = getContext(parentObject3DContextKey);
  const object3D = writable(object);
  const ctx = derived([object3D, parentObject3D], ([object3D2, parentObject3D2]) => {
    return object3D2 ?? parentObject3D2;
  });
  setContext(parentObject3DContextKey, ctx);
  return object3D;
};
const useParentObject3D = () => {
  return getContext(parentObject3DContextKey);
};
function useTask(keyOrFn, fnOrOptions, options) {
  if (!browser) {
    return {
      task: void 0,
      start: () => void 0,
      stop: () => void 0,
      started: readable(false)
    };
  }
  let key;
  let fn;
  let opts;
  if (DAG.isKey(keyOrFn)) {
    key = keyOrFn;
    fn = fnOrOptions;
    opts = options;
  } else {
    key = /* @__PURE__ */ Symbol("useTask");
    fn = keyOrFn;
    opts = fnOrOptions;
  }
  const schedulerCtx = useScheduler();
  let stage = schedulerCtx.mainStage;
  if (opts) {
    if (opts.stage) {
      if (DAG.isValue(opts.stage)) {
        stage = opts.stage;
      } else {
        const maybeStage = schedulerCtx.scheduler.getStage(opts.stage);
        if (!maybeStage) {
          throw new Error(`No stage found with key ${opts.stage.toString()}`);
        }
        stage = maybeStage;
      }
    } else if (opts.after) {
      if (Array.isArray(opts.after)) {
        for (let index = 0; index < opts.after.length; index++) {
          const element2 = opts.after[index];
          if (DAG.isValue(element2)) {
            stage = element2.stage;
            break;
          }
        }
      } else if (DAG.isValue(opts.after)) {
        stage = opts.after.stage;
      }
    } else if (opts.before) {
      if (Array.isArray(opts.before)) {
        for (let index = 0; index < opts.before.length; index++) {
          const element2 = opts.before[index];
          if (DAG.isValue(element2)) {
            stage = element2.stage;
            break;
          }
        }
      } else if (DAG.isValue(opts.before)) {
        stage = opts.before.stage;
      }
    }
  }
  const started = writable(false);
  const task = stage.createTask(key, fn, opts);
  const start = () => {
    started.set(true);
    if (opts?.autoInvalidate ?? true) {
      schedulerCtx.autoInvalidations.add(fn);
    }
    task.start();
  };
  const stop = () => {
    started.set(false);
    if (opts?.autoInvalidate ?? true) {
      schedulerCtx.autoInvalidations.delete(fn);
    }
    task.stop();
  };
  if (opts?.autoStart ?? true) {
    start();
  } else {
    stop();
  }
  onDestroy(() => {
    stop();
    stage.removeTask(key);
  });
  return {
    task,
    start,
    stop,
    started: {
      subscribe: started.subscribe
    }
  };
}
const useScene = () => {
  const context = getContext("threlte-scene-context");
  if (!context) {
    throw new Error("useScene can only be used in a child component to <Canvas>.");
  }
  return context;
};
const useRenderer = () => {
  const context = getContext("threlte-renderer-context");
  if (!context) {
    throw new Error("useRenderer can only be used in a child component to <Canvas>.");
  }
  return context;
};
const useUserContext = () => {
  const context = getContext("threlte-user-context");
  if (!context) {
    throw new Error("useUserContext can only be used in a child component to <Canvas>.");
  }
  return context;
};
function Canvas($$renderer, $$props) {
  let { children, $$slots, $$events, ...rest } = $$props;
  $$renderer.push(`<div class="svelte-clyidt"><canvas class="svelte-clyidt">`);
  {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--></canvas></div>`);
}
const useThrelte = () => {
  const schedulerCtx = useScheduler();
  const rendererCtx = useRenderer();
  const cameraCtx = useCamera();
  const sceneCtx = useScene();
  const domCtx = useDOM();
  const context = {
    advance: schedulerCtx.advance,
    autoRender: schedulerCtx.autoRender,
    autoRenderTask: rendererCtx.autoRenderTask,
    camera: cameraCtx.camera,
    colorManagementEnabled: rendererCtx.colorManagementEnabled,
    colorSpace: rendererCtx.colorSpace,
    dpr: rendererCtx.dpr,
    invalidate: schedulerCtx.invalidate,
    mainStage: schedulerCtx.mainStage,
    renderer: rendererCtx.renderer,
    renderMode: schedulerCtx.renderMode,
    renderStage: schedulerCtx.renderStage,
    scheduler: schedulerCtx.scheduler,
    shadows: rendererCtx.shadows,
    shouldRender: schedulerCtx.shouldRender,
    dom: domCtx.dom,
    canvas: domCtx.canvas,
    size: domCtx.size,
    toneMapping: rendererCtx.toneMapping,
    get scene() {
      return sceneCtx.scene;
    },
    set scene(scene) {
      sceneCtx.scene = scene;
    }
  };
  return context;
};
const useAttach = (getRef, getAttach) => {
  const { invalidate } = useThrelte();
  fromStore(useParent());
  fromStore(useParentObject3D());
  createParentContext();
  createParentObject3DContext();
};
const contextName = /* @__PURE__ */ Symbol("threlte-disposable-object-context");
const useSetDispose = (getDispose) => {
  const parentDispose = getContext(contextName);
  const mergedDispose = getDispose() ?? parentDispose?.() ?? true;
  setContext(contextName, () => mergedDispose);
};
const useEvents = (getRef, propKeys, props) => {
  for (const key of propKeys) {
    props[key];
    if (key.startsWith("on")) ;
  }
};
let currentIs;
const setIs = (is) => {
  currentIs = is;
};
const useIs = () => {
  const is = currentIs;
  currentIs = void 0;
  return is;
};
const pluginContextKey = "threlte-plugin-context";
const usePlugins = (args) => {
  const plugins = getContext(pluginContextKey);
  if (!plugins)
    return;
  const pluginsProps = [];
  const pluginsArray = Object.values(plugins);
  if (pluginsArray.length > 0) {
    const pluginArgs = args();
    for (let i = 0; i < pluginsArray.length; i++) {
      const plugin = pluginsArray[i];
      const p = plugin(pluginArgs);
      if (p && p.pluginProps) {
        pluginsProps.push(...p.pluginProps);
      }
    }
  }
  return {
    pluginsProps
  };
};
const ignoredProps = /* @__PURE__ */ new Set(["$$scope", "$$slots", "type", "args", "attach", "instance"]);
const updateProjectionMatrixKeys = /* @__PURE__ */ new Set([
  "fov",
  "aspect",
  "near",
  "far",
  "left",
  "right",
  "top",
  "bottom",
  "zoom"
]);
const memoizeProp = (value) => {
  if (typeof value === "string")
    return true;
  if (typeof value === "number")
    return true;
  if (typeof value === "boolean")
    return true;
  if (typeof value === "undefined")
    return true;
  if (value === null)
    return true;
  return false;
};
const createSetter = (target, key, value) => {
  if (!Array.isArray(value) && typeof value === "number" && typeof target[key] === "object" && target[key] !== null && typeof target[key]?.setScalar === "function" && // colors do have a setScalar function, but we don't want to use it, because
  // the hex notation (i.e. 0xff0000) is very popular and matches the number
  // type. So we exclude colors here.
  !target[key]?.isColor) {
    return (target2, key2, value2) => {
      target2[key2].setScalar(value2);
    };
  } else {
    if (typeof target[key]?.set === "function" && typeof target[key] === "object" && target[key] !== null) {
      if (Array.isArray(value)) {
        return (target2, key2, value2) => {
          target2[key2].set(...value2);
        };
      } else {
        return (target2, key2, value2) => {
          target2[key2].set(value2);
        };
      }
    } else {
      return (target2, key2, value2) => {
        target2[key2] = value2;
      };
    }
  }
};
const useProps = () => {
  const { invalidate } = useThrelte();
  const memoizedProps = /* @__PURE__ */ new Map();
  const memoizedSetters = /* @__PURE__ */ new Map();
  const setProp = (instance, propertyPath, value, manualCamera) => {
    if (memoizeProp(value)) {
      const memoizedProp = memoizedProps.get(propertyPath);
      if (memoizedProp && memoizedProp.instance === instance && memoizedProp.value === value) {
        return;
      }
      memoizedProps.set(propertyPath, {
        instance,
        value
      });
    }
    const { key, target } = resolvePropertyPath(instance, propertyPath);
    if (value !== void 0 && value !== null) {
      const memoizedSetter = memoizedSetters.get(propertyPath);
      if (memoizedSetter) {
        memoizedSetter(target, key, value);
      } else {
        const setter = createSetter(target, key, value);
        memoizedSetters.set(propertyPath, setter);
        setter(target, key, value);
      }
    } else {
      createSetter(target, key, value)(target, key, value);
    }
    if (manualCamera)
      return;
    if (updateProjectionMatrixKeys.has(key) && (target.isPerspectiveCamera || target.isOrthographicCamera)) {
      target.updateProjectionMatrix();
    }
  };
  const updateProp = (instance, key, value, pluginsProps, manualCamera) => {
    if (!ignoredProps.has(key) && !pluginsProps?.includes(key)) {
      setProp(instance, key, value, manualCamera);
    }
    invalidate();
  };
  return {
    updateProp
  };
};
const isClass = (input) => {
  return typeof input === "function" && Function.prototype.toString.call(input).startsWith("class ");
};
const determineRef = (is, args) => {
  if (isClass(is)) {
    if (Array.isArray(args)) {
      return new is(...args);
    } else {
      return new is();
    }
  }
  return is;
};
function T$1($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      is = useIs(),
      args,
      attach,
      manual = false,
      makeDefault = false,
      dispose,
      ref = void 0,
      oncreate,
      children,
      $$slots,
      $$events,
      ...props
    } = $$props;
    const internalRef = determineRef(is, args);
    usePlugins(() => ({
      get ref() {
        return internalRef;
      },
      get args() {
        return args;
      },
      get attach() {
        return attach;
      },
      get manual() {
        return manual;
      },
      get makeDefault() {
        return makeDefault;
      },
      get dispose() {
        return dispose;
      },
      get props() {
        return props;
      }
    }));
    const propKeys = Object.keys(props);
    useProps();
    propKeys.forEach((key) => {
      props[key];
    });
    useAttach();
    useSetDispose(() => dispose);
    useEvents(() => internalRef, propKeys, props);
    children?.($$renderer2, { ref: internalRef });
    $$renderer2.push(`<!---->`);
    bind_props($$props, { ref });
  });
}
const catalogue = {};
const T = new Proxy(T$1, {
  get(_target, is) {
    if (typeof is !== "string") {
      return T$1;
    }
    const module = catalogue[is] || THREE[is];
    if (module === void 0) {
      throw new Error(`No Three.js module found for ${is}. Did you forget to extend the catalogue?`);
    }
    setIs(module);
    return T$1;
  }
});
function useThrelteUserContext(namespace, value, options) {
  const userCtxStore = useUserContext();
  if (!userCtxStore) {
    throw new Error("No user context store found, did you invoke this function outside of your main <Canvas> component?");
  }
  if (!value) {
    return derived(userCtxStore, (ctx) => ctx[namespace]);
  }
  userCtxStore.update((ctx) => {
    if (namespace in ctx) {
      return ctx;
    }
    const v = typeof value === "function" ? value() : value;
    ctx[namespace] = v;
    return ctx;
  });
  return userCtxStore.current[namespace];
}
const toCurrentReadable = (store) => {
  return {
    subscribe: store.subscribe,
    get current() {
      return store.current;
    }
  };
};
let previousTotalLoaded = 0;
const finishedOnce = currentWritable(false);
const activeStore = currentWritable(false);
const itemStore = currentWritable(void 0);
const loadedStore = currentWritable(0);
const totalStore = currentWritable(0);
const errorsStore = currentWritable([]);
const progressStore = currentWritable(0);
const { onStart, onLoad, onError } = DefaultLoadingManager;
DefaultLoadingManager.onStart = (url, loaded, total) => {
  onStart?.(url, loaded, total);
  activeStore.set(true);
  itemStore.set(url);
  loadedStore.set(loaded);
  totalStore.set(total);
  const progress = (loaded - previousTotalLoaded) / (total - previousTotalLoaded);
  progressStore.set(progress);
  if (progress === 1)
    finishedOnce.set(true);
};
DefaultLoadingManager.onLoad = () => {
  onLoad?.();
  activeStore.set(false);
};
DefaultLoadingManager.onError = (url) => {
  onError?.(url);
  errorsStore.update((errors) => {
    return [...errors, url];
  });
};
DefaultLoadingManager.onProgress = (url, loaded, total) => {
  if (loaded === total) {
    previousTotalLoaded = total;
  }
  activeStore.set(true);
  itemStore.set(url);
  loadedStore.set(loaded);
  totalStore.set(total);
  const progress = (loaded - previousTotalLoaded) / (total - previousTotalLoaded) || 1;
  progressStore.set(progress);
  if (progress === 1)
    finishedOnce.set(true);
};
({
  active: toCurrentReadable(activeStore),
  item: toCurrentReadable(itemStore),
  loaded: toCurrentReadable(loadedStore),
  total: toCurrentReadable(totalStore),
  errors: toCurrentReadable(errorsStore),
  progress: toCurrentReadable(progressStore),
  finishedOnce: toCurrentReadable(finishedOnce)
});
new Vector3();
new Vector3();
new Vector3();
new Sphere();
new Matrix4();
new Ray();
new Vector3();
const suspenseContextIdentifier = /* @__PURE__ */ Symbol("THRELTE_SUSPENSE_CONTEXT_IDENTIFIER");
const useSuspense = () => {
  const ctx = getContext(suspenseContextIdentifier);
  const promises = /* @__PURE__ */ new Set();
  const suspend = (promise) => {
    if (ctx) {
      ctx.suspend(promise);
      promises.add(promise);
    }
    return promise;
  };
  const state = {
    suspended: derived(ctx?.suspended ?? readable(false), (suspended) => suspended)
  };
  onDestroy(() => {
    if (!ctx)
      return;
    for (const promise of promises) {
      ctx.onComponentDestroy(promise);
    }
    promises.clear();
  });
  return Object.assign(suspend, state);
};
new Vector3();
new Matrix4();
new Vector3();
new Vector3();
new Object3D();
new Vector3();
new Vector3();
new Vector3();
new Vector2();
const useEnvironment = (options) => {
  const { invalidate } = useThrelte();
  observe(() => [options.scene], ([scene]) => {
    const { background, environment } = scene;
    return () => {
      scene.background = background;
      scene.environment = environment;
    };
  });
  observe(() => [options.scene], ([scene]) => {
    scene.background;
    scene.environment;
  });
};
const loaders = {};
function Environment($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const ctx = useThrelte();
    let {
      skybox = void 0,
      texture = void 0,
      ground = false,
      isBackground = false,
      scene = ctx.scene,
      url
    } = $$props;
    useSuspense();
    useCache();
    useEnvironment({
      get scene() {
        return scene;
      }
    });
    const isEXR = url?.endsWith("exr") ?? false;
    const isHDR = url?.endsWith("hdr") ?? false;
    (() => {
      if (url === void 0) return;
      if (isEXR) {
        loaders.exr ??= new EXRLoader();
        return loaders.exr;
      } else if (isHDR) {
        loaders.hdr ??= new RGBELoader();
        return loaders.hdr;
      }
      loaders.tex ??= new TextureLoader();
      return loaders.tex;
    })();
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (ground) {
        $$renderer3.push("<!--[-->");
        const options = ground === true ? {} : ground;
        if (texture) {
          $$renderer3.push("<!--[-->");
          T($$renderer3, {
            is: GroundedSkybox,
            args: [
              texture,
              options.height ?? 1,
              options.radius ?? 1,
              options.resolution ?? 128
            ],
            get ref() {
              return skybox;
            },
            set ref($$value) {
              skybox = $$value;
              $$settled = false;
            }
          });
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]-->`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { skybox, texture });
  });
}
const useControlsContext = () => {
  return useThrelteUserContext("threlte-controls", {
    orbitControls: writable(void 0),
    trackballControls: writable(void 0)
  });
};
function OrbitControls($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { ref = void 0, children, $$slots, $$events, ...props } = $$props;
    const parent = useParent();
    const { dom, invalidate } = useThrelte();
    if (!isInstanceOf(store_get($$store_subs ??= {}, "$parent", parent), "Camera")) {
      throw new Error("Parent missing: <OrbitControls> need to be a child of a <Camera>");
    }
    const controls = new OrbitControls$1(store_get($$store_subs ??= {}, "$parent", parent), dom);
    const { orbitControls } = useControlsContext();
    const { start, stop } = useTask(
      () => {
        controls.update();
      },
      { autoStart: false, autoInvalidate: false }
    );
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      T($$renderer3, spread_props([
        { is: controls },
        props,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          children: ($$renderer4) => {
            children?.($$renderer4, { ref: controls });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        }
      ]));
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { ref });
  });
}
new Matrix4();
new Matrix4();
new Mesh();
`
    #include <common>
    ${ShaderChunk.logdepthbuf_pars_vertex}
    ${ShaderChunk.fog_pars_vertex}

    attribute vec3 previous;
    attribute vec3 next;
    attribute float side;
    attribute float width;
    attribute float counters;

    uniform vec2 resolution;
    uniform float lineWidth;
    uniform vec3 color;
    uniform float opacity;
    uniform float sizeAttenuation;
    uniform float scaleDown;

    varying vec2 vUV;
    varying vec4 vColor;
    varying float vCounters;

    vec2 intoScreen(vec4 i) {
        return resolution * (0.5 * i.xy / i.w + 0.5);
    }

    void main() {
        float aspect = resolution.y / resolution.x;

        mat4 m = projectionMatrix * modelViewMatrix;

        vec4 currentClip = m * vec4( position, 1.0 );
        vec4 prevClip = m * vec4( previous, 1.0 );
        vec4 nextClip = m * vec4( next, 1.0 );

        vec4 currentNormed = currentClip / currentClip.w;
        vec4 prevNormed = prevClip / prevClip.w;
        vec4 nextNormed = nextClip / nextClip.w;

        vec2 currentScreen = intoScreen(currentNormed);
        vec2 prevScreen = intoScreen(prevNormed);
        vec2 nextScreen = intoScreen(nextNormed);

        float actualWidth = lineWidth * width;

        vec2 dir;
        if(nextScreen == currentScreen) {
            dir = normalize( currentScreen - prevScreen );
        } else if(prevScreen == currentScreen) {
            dir = normalize( nextScreen - currentScreen );
        } else {
            vec2 inDir = currentScreen - prevScreen;
            vec2 outDir = nextScreen - currentScreen;
            vec2 fullDir = nextScreen - prevScreen;

            if(length(fullDir) > 0.0) {
                dir = normalize(fullDir);
            } else if(length(inDir) > 0.0){
                dir = normalize(inDir);
            } else {
                dir = normalize(outDir);
            }
        }

        vec2 normal = vec2(-dir.y, dir.x);

        if(sizeAttenuation != 0.0) {
            normal /= currentClip.w;
            normal *= min(resolution.x, resolution.y);
        }

        if (scaleDown > 0.0) {
            float dist = length(nextNormed - prevNormed);
            normal *= smoothstep(0.0, scaleDown, dist);
        }

        vec2 offsetInScreen = actualWidth * normal * side * 0.5;

        vec2 withOffsetScreen = currentScreen + offsetInScreen;
        vec3 withOffsetNormed = vec3((2.0 * withOffsetScreen/resolution - 1.0), currentNormed.z);

        vCounters = counters;
        vColor = vec4( color, opacity );
        vUV = uv;

        gl_Position = currentClip.w * vec4(withOffsetNormed, 1.0);

        ${ShaderChunk.logdepthbuf_vertex}
        ${ShaderChunk.fog_vertex}
    }
`;
`
uniform vec3 glowColor;
uniform float falloffAmount;
uniform float glowSharpness;
uniform float glowInternalRadius;

varying vec3 vPosition;
varying vec3 vNormal;

void main()
{
	// Normal
	vec3 normal = normalize(vNormal);
	if(!gl_FrontFacing)
			normal *= - 1.0;
	vec3 viewDirection = normalize(cameraPosition - vPosition);
	float fresnel = dot(viewDirection, normal);
	fresnel = pow(fresnel, glowInternalRadius + 0.1);
	float falloff = smoothstep(0., falloffAmount, fresnel);
	float fakeGlow = fresnel;
	fakeGlow += fresnel * glowSharpness;
	fakeGlow *= falloff;
	gl_FragColor = vec4(clamp(glowColor * fresnel, 0., 1.0), clamp(fakeGlow, 0., 1.0));

	${ShaderChunk.tonemapping_fragment}
	${ShaderChunk.colorspace_fragment}
}`;
const addStops = (gradient, stops = []) => {
  for (const { color, offset } of stops) {
    gradient.addColorStop(offset, color);
  }
  return gradient;
};
const fragmentShader$1 = `
uniform sampler2D pointTexture;
uniform float fade;
uniform float opacity;

varying vec3 vColor;
void main() {
	float pointOpacity = 1.0;
	if (fade == 1.0) {
		float d = distance(gl_PointCoord, vec2(0.5, 0.5));
		pointOpacity = 1.0 / (1.0 + exp(16.0 * (d - 0.25)));
	}
	gl_FragColor = vec4(vColor, pointOpacity * opacity);

	${ShaderChunk.tonemapping_fragment}
	${ShaderChunk.colorspace_fragment}
}`;
const vertexShader$1 = `uniform float time;
attribute float size;
varying vec3 vColor;
void main() {
	vColor = color;
	vec4 mvPosition = modelViewMatrix * vec4(position, 0.5);
	gl_PointSize = size * (30.0 / -mvPosition.z) * (3.0 + sin(time + 100.0));
	gl_Position = projectionMatrix * mvPosition;
}`;
function Stars($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      count = 5e3,
      radius = 50,
      depth = 50,
      factor = 6,
      saturation = 1,
      lightness = 0.8,
      speed = 1,
      fade = true,
      opacity = 1,
      ref = void 0,
      children,
      $$slots,
      $$events,
      ...props
    } = $$props;
    const points = new Points();
    new Vector3();
    new Spherical();
    new Color();
    const geometry = new BufferGeometry();
    new BufferAttribute(new Float32Array(count * 3), 3);
    new BufferAttribute(new Float32Array(count * 3), 3);
    new BufferAttribute(new Float32Array(count), 1);
    const { stop, start } = useTask(
      (dt) => {
        uniforms.time.value += dt * speed;
      },
      { autoStart: false }
    );
    const uniforms = {
      time: { value: 0 },
      fade: { value: 1 },
      opacity: { value: 1 }
    };
    const material = new ShaderMaterial({ uniforms, vertexShader: vertexShader$1, fragmentShader: fragmentShader$1 });
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      T($$renderer3, spread_props([
        { is: points },
        props,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          children: ($$renderer4) => {
            T($$renderer4, { is: geometry });
            $$renderer4.push(`<!----> `);
            T($$renderer4, {
              is: material,
              blending: AdditiveBlending,
              depthWrite: false,
              transparent: true,
              vertexColors: true
            });
            $$renderer4.push(`<!----> `);
            children?.($$renderer4, { ref: points });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        }
      ]));
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
const fragmentShader = `#define ENVMAP_TYPE_CUBE_UV
precision highp isampler2D;
precision highp usampler2D;
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying mat4 vModelMatrixInverse;

#ifdef USE_INSTANCING_COLOR
	varying vec3 vInstanceColor;
#endif

#ifdef ENVMAP_TYPE_CUBEM
	uniform samplerCube envMap;
#else
	uniform sampler2D envMap;
#endif

uniform float bounces;
${shaderStructs}
${shaderIntersectFunction}
uniform BVH bvh;
uniform float ior;
uniform bool correctMips;
uniform vec2 resolution;
uniform float fresnel;
uniform mat4 modelMatrix;
uniform mat4 projectionMatrixInverse;
uniform mat4 viewMatrixInverse;
uniform float aberrationStrength;
uniform vec3 color;

float fresnelFunc(vec3 viewDirection, vec3 worldNormal) {
	return pow( 1.0 + dot( viewDirection, worldNormal), 10.0 );
}

vec3 totalInternalReflection(vec3 ro, vec3 rd, vec3 normal, float ior, mat4 modelMatrixInverse) {
	vec3 rayOrigin = ro;
	vec3 rayDirection = rd;
	rayDirection = refract(rayDirection, normal, 1.0 / ior);
	rayOrigin = vWorldPosition + rayDirection * 0.001;
	rayOrigin = (modelMatrixInverse * vec4(rayOrigin, 1.0)).xyz;
	rayDirection = normalize((modelMatrixInverse * vec4(rayDirection, 0.0)).xyz);
	for(float i = 0.0; i < bounces; i++) {
		uvec4 faceIndices = uvec4( 0u );
		vec3 faceNormal = vec3( 0.0, 0.0, 1.0 );
		vec3 barycoord = vec3( 0.0 );
		float side = 1.0;
		float dist = 0.0;
		bvhIntersectFirstHit( bvh, rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist );
		vec3 hitPos = rayOrigin + rayDirection * max(dist - 0.001, 0.0);
		vec3 tempDir = refract(rayDirection, faceNormal, ior);
		if (length(tempDir) != 0.0) {
			rayDirection = tempDir;
			break;
		}
		rayDirection = reflect(rayDirection, faceNormal);
		rayOrigin = hitPos + rayDirection * 0.01;
	}
	rayDirection = normalize((modelMatrix * vec4(rayDirection, 0.0)).xyz);
	return rayDirection;
}

#include <common>
#include <cube_uv_reflection_fragment>

#ifdef ENVMAP_TYPE_CUBEM
	vec4 textureGradient(samplerCube envMap, vec3 rayDirection, vec3 directionCamPerfect) {
		return textureGrad(envMap, rayDirection, dFdx(correctMips ? directionCamPerfect: rayDirection), dFdy(correctMips ? directionCamPerfect: rayDirection));
	}
#else
	vec4 textureGradient(sampler2D envMap, vec3 rayDirection, vec3 directionCamPerfect) {
		vec2 uvv = equirectUv( rayDirection );
		vec2 smoothUv = equirectUv( directionCamPerfect );
		return textureGrad(envMap, uvv, dFdx(correctMips ? smoothUv : uvv), dFdy(correctMips ? smoothUv : uvv));
	}
#endif

void main() {
	vec2 uv = gl_FragCoord.xy / resolution;
	vec3 directionCamPerfect = (projectionMatrixInverse * vec4(uv * 2.0 - 1.0, 0.0, 1.0)).xyz;
	directionCamPerfect = (viewMatrixInverse * vec4(directionCamPerfect, 0.0)).xyz;
	directionCamPerfect = normalize(directionCamPerfect);
	vec3 normal = vNormal;
	vec3 rayOrigin = cameraPosition;
	vec3 rayDirection = normalize(vWorldPosition - cameraPosition);
	vec3 finalColor;
	#ifdef CHROMATIC_ABERRATIONS
		vec3 rayDirectionG = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior, 1.0), vModelMatrixInverse);
		#ifdef FAST_CHROMA
			vec3 rayDirectionR = normalize(rayDirectionG + 1.0 * vec3(aberrationStrength / 2.0));
			vec3 rayDirectionB = normalize(rayDirectionG - 1.0 * vec3(aberrationStrength / 2.0));
		#else
			vec3 rayDirectionR = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior * (1.0 - aberrationStrength), 1.0), vModelMatrixInverse);
			vec3 rayDirectionB = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior * (1.0 + aberrationStrength), 1.0), vModelMatrixInverse);
		#endif
		float finalColorR = textureGradient(envMap, rayDirectionR, directionCamPerfect).r;
		float finalColorG = textureGradient(envMap, rayDirectionG, directionCamPerfect).g;
		float finalColorB = textureGradient(envMap, rayDirectionB, directionCamPerfect).b;
		finalColor = vec3(finalColorR, finalColorG, finalColorB);
	#else
		rayDirection = totalInternalReflection(rayOrigin, rayDirection, normal, max(ior, 1.0), vModelMatrixInverse);
		finalColor = textureGradient(envMap, rayDirection, directionCamPerfect).rgb;
	#endif

	finalColor *= color;
	#ifdef USE_INSTANCING_COLOR
		finalColor *= vInstanceColor;
	#endif

	vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
	float nFresnel = fresnelFunc(viewDirection, normal) * fresnel;
	gl_FragColor = vec4(mix(finalColor, vec3(1.0), nFresnel), 1.0);
	${ShaderChunk.tonemapping_fragment}
	${ShaderChunk.colorspace_fragment}
}`;
const vertexShader = `uniform mat4 viewMatrixInverse;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying mat4 vModelMatrixInverse;

#ifdef USE_INSTANCING_COLOR
	varying vec3 vInstanceColor;
#endif

void main() {
	vec4 transformedNormal = vec4(normal, 0.0);
	vec4 transformedPosition = vec4(position, 1.0);
	#ifdef USE_INSTANCING
		transformedNormal = instanceMatrix * transformedNormal;
		transformedPosition = instanceMatrix * transformedPosition;
	#endif

	#ifdef USE_INSTANCING
		vModelMatrixInverse = inverse(modelMatrix * instanceMatrix);
	#else
		vModelMatrixInverse = inverse(modelMatrix);
	#endif

	#ifdef USE_INSTANCING_COLOR
		vInstanceColor = instanceColor.rgb;
	#endif

	vWorldPosition = (modelMatrix * transformedPosition).xyz;
	vNormal = normalize((viewMatrixInverse * vec4(normalMatrix * transformedNormal.xyz, 0.0)).xyz);
	gl_Position = projectionMatrix * viewMatrix * modelMatrix * transformedPosition;
}`;
function MeshRefractionMaterial($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let {
      envMap,
      bounces = 2,
      ior = 2.4,
      fresnel = 0,
      aberrationStrength = 0,
      color = "white",
      fastChroma = true,
      ref = void 0,
      $$slots,
      $$events,
      ...props
    } = $$props;
    const uniforms = {
      envMap: { value: null },
      bounces: { value: 2 },
      ior: { value: 2.4 },
      correctMips: { value: true },
      aberrationStrength: { value: 0.01 },
      fresnel: { value: 0 },
      bvh: { value: new MeshBVHUniformStruct() },
      color: { value: new Color("white") },
      resolution: { value: new Vector2() },
      viewMatrixInverse: { value: new Matrix4() },
      projectionMatrixInverse: { value: new Matrix4() }
    };
    const material = new ShaderMaterial({ fragmentShader, vertexShader, uniforms });
    ref = material;
    const { size, invalidate, camera } = useThrelte();
    useParent();
    let defines = {};
    useTask(
      () => {
        uniforms.viewMatrixInverse.value = camera.current.matrixWorld;
        uniforms.projectionMatrixInverse.value = camera.current.projectionMatrixInverse;
      },
      { autoInvalidate: false }
    );
    const colorObj = new Color(color);
    T($$renderer2, spread_props([
      {
        is: material,
        "uniforms.envMap.value": envMap,
        "uniforms.bounces.value": bounces,
        "uniforms.ior.value": ior,
        "uniforms.fresnel.value": fresnel,
        "uniforms.aberrationStrength.value": aberrationStrength,
        "uniforms.color.value": colorObj,
        "uniforms.resolution.value": [
          store_get($$store_subs ??= {}, "$size", size).width,
          store_get($$store_subs ??= {}, "$size", size).height
        ],
        defines
      },
      props
    ]));
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { ref });
  });
}
new Box3();
function LinearGradientTexture($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      width = 1024,
      height = 1024,
      startX = 0,
      startY = 0,
      endX = 0,
      endY = height,
      stops = [{ offset: 0, color: "black" }, { offset: 1, color: "white" }],
      attach = "map",
      children,
      ref = void 0,
      $$slots,
      $$events,
      ...props
    } = $$props;
    const canvas = new OffscreenCanvas(0, 0);
    const context = canvas.getContext("2d");
    if (context === null) {
      throw new Error("canvas texture context is null");
    }
    const texture = new CanvasTexture(canvas);
    observe(() => [props.wrapS, props.wrapT], () => {
      texture.needsUpdate = true;
      invalidate();
    });
    (() => {
      const gradient = context.createLinearGradient(startX, startY, endX, endY);
      addStops(gradient, stops);
      return gradient;
    })();
    const { invalidate } = useThrelte();
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      T($$renderer3, spread_props([
        { is: texture, attach },
        props,
        {
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          children: ($$renderer4) => {
            children?.($$renderer4, { ref: texture });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        }
      ]));
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
typeof window !== "undefined" ? document.createElement("div") : void 0;
function Text($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      font = null,
      characters = null,
      sdfGlyphSize = null,
      ref = void 0,
      onsync,
      children,
      $$slots,
      $$events,
      ...props
    } = $$props;
    const text = new Text$1();
    const { invalidate } = useThrelte();
    const onUpdate = async () => {
      await tick();
      text.sync(() => {
        invalidate();
        onsync?.();
      });
    };
    const propsToListenTo = [
      "text",
      "anchorX",
      "anchorY",
      "curveRadius",
      "direction",
      "font",
      "fontSize",
      "letterSpacing",
      "lineHeight",
      "maxWidth",
      "overflowWrap",
      "textAlign",
      "textIndent",
      "whiteSpace",
      "material",
      "color",
      "depthOffset",
      "clipRect",
      "glyphGeometryDetail",
      "sdfGlyphSize",
      "outlineWidth",
      "outlineColor",
      "outlineOpacity",
      "outlineBlur",
      "outlineOffsetX",
      "outlineOffsetY",
      "strokeWidth",
      "strokeColor",
      "strokeOpacity",
      "fillOpacity",
      "characters",
      "colorRanges"
    ];
    observe(() => propsToListenTo.map((key) => props[key]), () => {
      onUpdate();
    });
    useSuspense();
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      T($$renderer3, spread_props([
        { is: text },
        props,
        {
          font,
          characters,
          sdfGlyphSize,
          get ref() {
            return ref;
          },
          set ref($$value) {
            ref = $$value;
            $$settled = false;
          },
          children: ($$renderer4) => {
            children?.($$renderer4, { ref: text });
            $$renderer4.push(`<!---->`);
          },
          $$slots: { default: true }
        }
      ]));
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { ref });
  });
}
new MeshBasicMaterial();
new Vector3();
new Matrix4();
new Ray();
new Sphere();
new Box3();
new Vector3();
new Vector3();
const generateKnotPoints = (xEq, yEq, zEq, segments = 100, tMax = Math.PI * 2) => {
  const points = [];
  let xNode;
  let yNode;
  let zNode;
  try {
    xNode = math.compile(xEq);
    yNode = math.compile(yEq);
    zNode = math.compile(zEq);
  } catch (e) {
    console.error("Error compiling equations:", e);
    return [];
  }
  for (let i = 0; i <= segments; i++) {
    const t = i / segments * tMax;
    const scope = { t, PI: Math.PI };
    try {
      const x = xNode.evaluate(scope);
      const y = yNode.evaluate(scope);
      const z = zNode.evaluate(scope);
      points.push(new THREE.Vector3(x, y, z));
    } catch (e) {
    }
  }
  return points;
};
const PRESETS = {
  trefoil: {
    name: "Trefoil",
    x: "sin(t) + 2 * sin(2*t)",
    y: "cos(t) - 2 * cos(2*t)",
    z: "-sin(3*t)",
    defaultColor: "#00ff88"
  },
  figure8: {
    name: "Figure 8",
    x: "cos(t)",
    y: "sin(t) * cos(t)",
    z: "sin(t)",
    defaultColor: "#ff0088"
  },
  torus: {
    name: "Torus Knot (3,2)",
    x: "(2 + cos(3*t)) * cos(2*t)",
    y: "(2 + cos(3*t)) * sin(2*t)",
    z: "sin(3*t)",
    defaultColor: "#0088ff"
  },
  cinquefoil: {
    name: "Cinquefoil (5,2)",
    x: "(2 + cos(5*t)) * cos(2*t)",
    y: "(2 + cos(5*t)) * sin(2*t)",
    z: "sin(5*t)",
    defaultColor: "#ffaa00"
  },
  lissajous: {
    name: "Lissajous (3,4,5)",
    x: "sin(3*t)",
    y: "sin(4*t)",
    z: "sin(5*t)",
    defaultColor: "#aa00ff"
  },
  granny: {
    name: "Granny Knot",
    x: "-2.2 * cos(t) - 1.2 * cos(3*t)",
    y: "-2.2 * sin(t) - 1.2 * sin(3*t)",
    z: "sin(2*t)",
    defaultColor: "#ff8888"
  },
  square: {
    name: "Square Knot",
    x: "sin(t) + 2*sin(2*t)",
    y: "cos(t) - 2*cos(2*t)",
    // Approximation or composite required for true square knot, using visual proxy
    z: "-sin(5*t) * 0.5",
    defaultColor: "#8888ff"
  },
  stevedore: {
    name: "Stevedore (6_1)",
    x: "(2 + cos(2*t)) * cos(3*t)",
    y: "(2 + cos(2*t)) * sin(3*t)",
    z: "sin(4*t)",
    // Simplified representation
    defaultColor: "#ffff00"
  },
  carrick: {
    name: "Carrick Bend",
    x: "cos(2*t) * (cos(7*t) + 0.5)",
    y: "sin(2*t) * (cos(7*t) + 0.5)",
    z: "sin(7*t) * 0.5",
    defaultColor: "#00ffff"
  },
  unknot: {
    name: "Unknot (Circle)",
    x: "cos(t)",
    y: "sin(t)",
    z: "0",
    defaultColor: "#ffffff"
  },
  twist: {
    name: "Twist Knot",
    x: "cos(2*t + 1)",
    y: "sin(2*t + 1)",
    z: "cos(3*t) + sin(5*t)",
    defaultColor: "#ff00ff"
  },
  prime7_1: {
    name: "7_1 Knot",
    x: "(2.5 + cos(7*t)) * cos(2*t)",
    y: "(2.5 + cos(7*t)) * sin(2*t)",
    z: "sin(7*t)",
    defaultColor: "#88ff00"
  },
  decoration: {
    name: "Decorative",
    x: "sin(5*t)*cos(2*t)",
    y: "sin(5*t)*sin(2*t)",
    z: "cos(5*t)",
    defaultColor: "#ff4444"
  },
  harmonograph: {
    name: "Harmonograph 3D",
    x: "sin(2*t) + sin(3*t)",
    y: "cos(2*t) + cos(3*t)",
    z: "sin(4*t)",
    defaultColor: "#4444ff"
  },
  eight_eightteen: {
    name: "8_18 Knot",
    x: "cos(t) * (2 + cos(3*t))",
    y: "sin(t) * (2 + cos(3*t))",
    z: "sin(2*t) + sin(4*t + 1.5)",
    // Artistic approx
    defaultColor: "#ffcc00"
  },
  pretzel: {
    name: "Pretzel Link",
    x: "cos(3*t)",
    y: "sin(2*t)",
    z: "cos(5*t)",
    defaultColor: "#ccff00"
  },
  coil: {
    name: "Coil / Spring",
    x: "cos(5*t)",
    y: "sin(5*t)",
    z: "t / 5",
    // Note: range handling needs to support this
    defaultColor: "#00ccff"
  },
  infinity: {
    name: "Infinity Symbol",
    x: "cos(t)",
    y: "sin(2*t) / 2",
    z: "sin(t) * 0.2",
    defaultColor: "#ff88cc"
  },
  helix_torus: {
    name: "Helix on Torus",
    x: "(4 + sin(20*t)) * cos(t)",
    y: "(4 + sin(20*t)) * sin(t)",
    z: "cos(20*t)",
    defaultColor: "#aa44aa"
  },
  random_mess: {
    name: "Complex Tangle",
    x: "sin(t) + cos(2.3*t)",
    y: "cos(t) - sin(2.3*t)",
    z: "sin(3.5*t)",
    defaultColor: "#888888"
  }
};
class KnotState {
  // Knot Parameters
  x = PRESETS.trefoil.x;
  y = PRESETS.trefoil.y;
  z = PRESETS.trefoil.z;
  thickness = 0.4;
  color = PRESETS.trefoil.defaultColor;
  // Animation State
  growth = 1;
  isPlaying = false;
  autoRotate = true;
  showLabels = true;
  bgStyle = "void";
  // Design 2.0 State
  materialMode = "neon";
  useGradient = false;
  // Private animation state
  #animationFrameRequestId = null;
  #startTime = null;
  #direction = 1;
  // 1 for growing, -1 for shrinking
  setPreset(key) {
    if (PRESETS[key]) {
      const p = PRESETS[key];
      this.x = p.x;
      this.y = p.y;
      this.z = p.z;
      if (p.defaultColor) this.color = p.defaultColor;
      this.growth = 1;
      this.isPlaying = false;
      this.stopAnimation();
    }
  }
  togglePlay() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.stopAnimation();
    } else {
      this.isPlaying = true;
      this.growth = 0;
      this.#startTime = null;
      this.#direction = 1;
      this.animate();
    }
  }
  animate() {
    const loop = (time) => {
      if (!this.isPlaying) return;
      if (this.#startTime === null) this.#startTime = time;
      const duration = 3e3;
      const elapsed = time - this.#startTime;
      let progress = elapsed / duration;
      if (this.#direction === 1) {
        if (progress >= 1) {
          this.growth = 1;
          this.#direction = -1;
          this.#startTime = time;
        } else {
          this.growth = progress;
        }
      } else {
        if (progress >= 1) {
          this.growth = 0;
          this.#direction = 1;
          this.#startTime = time;
        } else {
          this.growth = 1 - progress;
        }
      }
      this.#animationFrameRequestId = requestAnimationFrame(loop);
    };
    this.#animationFrameRequestId = requestAnimationFrame(loop);
  }
  stopAnimation() {
    if (this.#animationFrameRequestId) {
      cancelAnimationFrame(this.#animationFrameRequestId);
      this.#animationFrameRequestId = null;
    }
  }
}
const knotState = new KnotState();
async function exportKnot(mesh, format = "obj", name = "knot") {
  if (!mesh) return;
  let result = null;
  let extension = "";
  let mimeType = "";
  if (format === "obj") {
    const exporter = new OBJExporter();
    result = exporter.parse(mesh);
    extension = "obj";
    mimeType = "text/plain";
  } else if (format === "stl") {
    const exporter = new STLExporter();
    result = exporter.parse(mesh, { binary: true });
    extension = "stl";
    mimeType = "application/octet-stream";
  }
  if (result) {
    const blob = new Blob([result], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
function Knot($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let fullPoints = generateKnotPoints(knotState.x, knotState.y, knotState.z, 300);
    let visiblePoints = (() => {
      if (fullPoints.length < 2) return [];
      const count = Math.max(2, Math.floor(fullPoints.length * knotState.growth));
      return fullPoints.slice(0, count);
    })();
    let curve = (() => {
      if (visiblePoints.length < 2) return null;
      return new THREE.CatmullRomCurve3(visiblePoints, true);
    })();
    let geometryArgs = curve ? [curve, 256, knotState.thickness, 32, false] : null;
    let meshRef = void 0;
    function handleExport(e) {
      if (meshRef) exportKnot(meshRef, e.detail, "knot");
    }
    onDestroy(() => {
      if (typeof document !== "undefined") {
        document.removeEventListener("export-request", handleExport);
      }
    });
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (geometryArgs) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<!---->`);
        {
          let gradient = function($$renderer4) {
            LinearGradientTexture($$renderer4, {
              stops: [
                { offset: 0, color: knotState.color },
                { offset: 0.5, color: "#ffffff" },
                { offset: 1, color: knotState.color }
              ]
            });
          };
          T.Mesh($$renderer3, {
            get ref() {
              return meshRef;
            },
            set ref($$value) {
              meshRef = $$value;
              $$settled = false;
            },
            gradient,
            children: ($$renderer4) => {
              $$renderer4.push(`<!---->`);
              T.TubeGeometry($$renderer4, { args: geometryArgs });
              $$renderer4.push(`<!---->  `);
              if (knotState.materialMode === "neon") {
                $$renderer4.push("<!--[-->");
                $$renderer4.push(`<!---->`);
                T.MeshPhysicalMaterial($$renderer4, {
                  color: knotState.color,
                  roughness: 0.2,
                  metalness: 0.1,
                  clearcoat: 1,
                  clearcoatRoughness: 0.1,
                  transmission: 0.2,
                  emissive: knotState.color,
                  emissiveIntensity: 0.5,
                  children: ($$renderer5) => {
                    if (knotState.useGradient) {
                      $$renderer5.push("<!--[-->");
                      $$renderer5.push(`<!---->`);
                      T.Slot($$renderer5, {
                        slot: "emissiveMap",
                        children: ($$renderer6) => {
                          gradient($$renderer6);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer5.push(`<!---->`);
                    } else {
                      $$renderer5.push("<!--[!-->");
                    }
                    $$renderer5.push(`<!--]-->`);
                  },
                  $$slots: { default: true }
                });
                $$renderer4.push(`<!---->`);
              } else {
                $$renderer4.push("<!--[!-->");
                if (knotState.materialMode === "chrome") {
                  $$renderer4.push("<!--[-->");
                  $$renderer4.push(`<!---->`);
                  T.MeshStandardMaterial($$renderer4, {
                    color: knotState.useGradient ? "#ffffff" : knotState.color,
                    roughness: 0,
                    metalness: 1,
                    envMapIntensity: 1,
                    children: ($$renderer5) => {
                      if (knotState.useGradient) {
                        $$renderer5.push("<!--[-->");
                        $$renderer5.push(`<!---->`);
                        T.Slot($$renderer5, {
                          slot: "map",
                          children: ($$renderer6) => {
                            gradient($$renderer6);
                          },
                          $$slots: { default: true }
                        });
                        $$renderer5.push(`<!---->`);
                      } else {
                        $$renderer5.push("<!--[!-->");
                      }
                      $$renderer5.push(`<!--]-->`);
                    },
                    $$slots: { default: true }
                  });
                  $$renderer4.push(`<!---->`);
                } else {
                  $$renderer4.push("<!--[!-->");
                  if (knotState.materialMode === "liquid") {
                    $$renderer4.push("<!--[-->");
                    MeshRefractionMaterial($$renderer4, {
                      color: knotState.color,
                      ior: 1.4,
                      reflectivity: 0.5,
                      transmission: 1,
                      roughness: 0,
                      aberrationStrength: 0.01,
                      toneMapped: false
                    });
                  } else {
                    $$renderer4.push("<!--[!-->");
                    if (knotState.materialMode === "iridescent") {
                      $$renderer4.push("<!--[-->");
                      $$renderer4.push(`<!---->`);
                      T.MeshPhysicalMaterial($$renderer4, {
                        color: knotState.color,
                        roughness: 0.1,
                        metalness: 0.1,
                        transmission: 0.5,
                        thickness: 2,
                        iridescence: 1,
                        iridescenceIOR: 1.3,
                        iridescenceThicknessRange: [100, 400],
                        children: ($$renderer5) => {
                          if (knotState.useGradient) {
                            $$renderer5.push("<!--[-->");
                            $$renderer5.push(`<!---->`);
                            T.Slot($$renderer5, {
                              slot: "map",
                              children: ($$renderer6) => {
                                gradient($$renderer6);
                              },
                              $$slots: { default: true }
                            });
                            $$renderer5.push(`<!---->`);
                          } else {
                            $$renderer5.push("<!--[!-->");
                          }
                          $$renderer5.push(`<!--]-->`);
                        },
                        $$slots: { default: true }
                      });
                      $$renderer4.push(`<!---->`);
                    } else {
                      $$renderer4.push("<!--[!-->");
                    }
                    $$renderer4.push(`<!--]-->`);
                  }
                  $$renderer4.push(`<!--]-->`);
                }
                $$renderer4.push(`<!--]-->`);
              }
              $$renderer4.push(`<!--]--> `);
              if (knotState.showLabels) {
                $$renderer4.push("<!--[-->");
                Text($$renderer4, {
                  text: knotState.x + "\n" + knotState.y + "\n" + knotState.z,
                  position: [0, 4, 0],
                  fontSize: 0.5,
                  color: "white",
                  anchorX: "center",
                  anchorY: "middle",
                  outlineWidth: 0.05,
                  outlineColor: "#000000"
                });
              } else {
                $$renderer4.push("<!--[!-->");
              }
              $$renderer4.push(`<!--]-->`);
            },
            $$slots: { gradient: true, default: true }
          });
        }
        $$renderer3.push(`<!---->`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function Scene($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="h-full w-full bg-slate-900">`);
    Canvas($$renderer2, {
      children: ($$renderer3) => {
        T.PerspectiveCamera($$renderer3, {
          makeDefault: true,
          position: [0, 0, 10],
          fov: 50,
          children: ($$renderer4) => {
            OrbitControls($$renderer4, {
              enableDamping: true,
              autoRotate: knotState.autoRotate,
              autoRotateSpeed: 2
            });
          },
          $$slots: { default: true }
        });
        $$renderer3.push(`<!----> `);
        T.AmbientLight($$renderer3, { intensity: 0.5 });
        $$renderer3.push(`<!----> `);
        T.DirectionalLight($$renderer3, { position: [10, 10, 5], intensity: 1.5, color: "white" });
        $$renderer3.push(`<!----> `);
        T.PointLight($$renderer3, { position: [-10, -10, -5], intensity: 1, color: "#4400ff" });
        $$renderer3.push(`<!----> `);
        if (knotState.bgStyle === "stars") {
          $$renderer3.push("<!--[-->");
          Stars($$renderer3, {
            radius: 100,
            depth: 50,
            count: 5e3,
            factor: 4,
            saturation: 0,
            fade: true,
            speed: 1
          });
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> `);
        Environment($$renderer3, { preset: "city" });
        $$renderer3.push(`<!----> `);
        Knot($$renderer3);
        $$renderer3.push(`<!---->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div>`);
  });
}
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
function Icon($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "name",
    "color",
    "size",
    "strokeWidth",
    "absoluteStrokeWidth",
    "iconNode"
  ]);
  $$renderer.component(($$renderer2) => {
    let name = fallback($$props["name"], void 0);
    let color = fallback($$props["color"], "currentColor");
    let size = fallback($$props["size"], 24);
    let strokeWidth = fallback($$props["strokeWidth"], 2);
    let absoluteStrokeWidth = fallback($$props["absoluteStrokeWidth"], false);
    let iconNode = fallback($$props["iconNode"], () => [], true);
    $$renderer2.push(`<svg${attributes(
      {
        ...defaultAttributes,
        ...!hasA11yProp($$restProps) ? { "aria-hidden": "true" } : void 0,
        ...$$restProps,
        width: size,
        height: size,
        stroke: color,
        "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
        class: clsx(mergeClasses("lucide-icon", "lucide", name ? `lucide-${name}` : "", $$sanitized_props.class))
      },
      void 0,
      void 0,
      void 0,
      3
    )}><!--[-->`);
    const each_array = ensure_array_like(iconNode);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [tag, attrs] = each_array[$$index];
      element($$renderer2, tag, () => {
        $$renderer2.push(`${attributes({ ...attrs }, void 0, void 0, void 0, 3)}`);
      });
    }
    $$renderer2.push(`<!--]--><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></svg>`);
    bind_props($$props, {
      name,
      color,
      size,
      strokeWidth,
      absoluteStrokeWidth,
      iconNode
    });
  });
}
function Grid_3x3($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "rect",
      { "width": "18", "height": "18", "x": "3", "y": "3", "rx": "2" }
    ],
    ["path", { "d": "M3 9h18" }],
    ["path", { "d": "M3 15h18" }],
    ["path", { "d": "M9 3v18" }],
    ["path", { "d": "M15 3v18" }]
  ];
  Icon($$renderer, spread_props([
    { name: "grid-3x3" },
    $$sanitized_props,
    {
      /**
       * @component @name Grid3x3
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiAvPgogIDxwYXRoIGQ9Ik0zIDloMTgiIC8+CiAgPHBhdGggZD0iTTMgMTVoMTgiIC8+CiAgPHBhdGggZD0iTTkgM3YxOCIgLz4KICA8cGF0aCBkPSJNMTUgM3YxOCIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/grid-3x3
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Image($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "rect",
      {
        "width": "18",
        "height": "18",
        "x": "3",
        "y": "3",
        "rx": "2",
        "ry": "2"
      }
    ],
    ["circle", { "cx": "9", "cy": "9", "r": "2" }],
    ["path", { "d": "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }]
  ];
  Icon($$renderer, spread_props([
    { name: "image" },
    $$sanitized_props,
    {
      /**
       * @component @name Image
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIgLz4KICA8Y2lyY2xlIGN4PSI5IiBjeT0iOSIgcj0iMiIgLz4KICA8cGF0aCBkPSJtMjEgMTUtMy4wODYtMy4wODZhMiAyIDAgMCAwLTIuODI4IDBMNiAyMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/image
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Pause($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "rect",
      { "x": "14", "y": "3", "width": "5", "height": "18", "rx": "1" }
    ],
    [
      "rect",
      { "x": "5", "y": "3", "width": "5", "height": "18", "rx": "1" }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "pause" },
    $$sanitized_props,
    {
      /**
       * @component @name Pause
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB4PSIxNCIgeT0iMyIgd2lkdGg9IjUiIGhlaWdodD0iMTgiIHJ4PSIxIiAvPgogIDxyZWN0IHg9IjUiIHk9IjMiIHdpZHRoPSI1IiBoZWlnaHQ9IjE4IiByeD0iMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/pause
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Play($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"
      }
    ]
  ];
  Icon($$renderer, spread_props([
    { name: "play" },
    $$sanitized_props,
    {
      /**
       * @component @name Play
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSA1YTIgMiAwIDAgMSAzLjAwOC0xLjcyOGwxMS45OTcgNi45OThhMiAyIDAgMCAxIC4wMDMgMy40NThsLTEyIDdBMiAyIDAgMCAxIDUgMTl6IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/play
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Settings($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    [
      "path",
      {
        "d": "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
      }
    ],
    ["circle", { "cx": "12", "cy": "12", "r": "3" }]
  ];
  Icon($$renderer, spread_props([
    { name: "settings" },
    $$sanitized_props,
    {
      /**
       * @component @name Settings
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOS42NzEgNC4xMzZhMi4zNCAyLjM0IDAgMCAxIDQuNjU5IDAgMi4zNCAyLjM0IDAgMCAwIDMuMzE5IDEuOTE1IDIuMzQgMi4zNCAwIDAgMSAyLjMzIDQuMDMzIDIuMzQgMi4zNCAwIDAgMCAwIDMuODMxIDIuMzQgMi4zNCAwIDAgMS0yLjMzIDQuMDMzIDIuMzQgMi4zNCAwIDAgMC0zLjMxOSAxLjkxNSAyLjM0IDIuMzQgMCAwIDEtNC42NTkgMCAyLjM0IDIuMzQgMCAwIDAtMy4zMi0xLjkxNSAyLjM0IDIuMzQgMCAwIDEtMi4zMy00LjAzMyAyLjM0IDIuMzQgMCAwIDAgMC0zLjgzMUEyLjM0IDIuMzQgMCAwIDEgNi4zNSA2LjA1MWEyLjM0IDIuMzQgMCAwIDAgMy4zMTktMS45MTUiIC8+CiAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/settings
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Share($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const iconNode = [
    ["path", { "d": "M12 2v13" }],
    ["path", { "d": "m16 6-4-4-4 4" }],
    ["path", { "d": "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }]
  ];
  Icon($$renderer, spread_props([
    { name: "share" },
    $$sanitized_props,
    {
      /**
       * @component @name Share
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMnYxMyIgLz4KICA8cGF0aCBkPSJtMTYgNi00LTQtNCA0IiAvPgogIDxwYXRoIGQ9Ik00IDEydjhhMiAyIDAgMCAwIDIgMmgxMmEyIDIgMCAwIDAgMi0ydi04IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/share
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$renderer2) => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {});
        $$renderer2.push(`<!--]-->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Overlay($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="pointer-events-none fixed top-0 left-0 z-50 flex w-full items-start justify-between p-6"><div class="pointer-events-auto"><h1 class="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-2xl font-black tracking-tighter text-transparent drop-shadow-lg">KNOTS<span class="ml-1 align-top font-mono text-[10px] text-white/50">FLOW</span></h1></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="fixed bottom-8 left-1/2 z-50 w-full max-w-xl -translate-x-1/2 px-6"><div class="group relative flex items-center justify-between overflow-hidden rounded-full border border-white/10 bg-black/60 p-2 pr-3 pl-3 shadow-2xl backdrop-blur-2xl"><div class="flex items-center gap-2"><button${attr_class(
      `rounded-full p-3 transition-all hover:bg-white/10 hover:text-white active:scale-95 ${"text-slate-400"}`,
      "svelte-zbg823"
    )} title="Presets">`);
    Grid_3x3($$renderer2, { size: 20 });
    $$renderer2.push(`<!----></button> <button${attr_class(
      `rounded-full p-3 transition-all hover:bg-white/10 hover:text-white active:scale-95 ${"text-slate-400"}`,
      "svelte-zbg823"
    )} title="Customize">`);
    Settings($$renderer2, { size: 20 });
    $$renderer2.push(`<!----></button> <button${attr_class(
      `rounded-full p-3 transition-all hover:bg-white/10 hover:text-white active:scale-95 ${"text-slate-400"}`,
      "svelte-zbg823"
    )} title="Background">`);
    Image($$renderer2, { size: 20 });
    $$renderer2.push(`<!----></button> <div class="mx-1 h-8 w-px bg-white/10"></div></div> <div class="flex flex-1 items-center justify-center gap-4 px-2"><button class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-300 hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] active:scale-90">`);
    if (knotState.isPlaying) {
      $$renderer2.push("<!--[-->");
      Pause($$renderer2, { size: 18, fill: "currentColor" });
    } else {
      $$renderer2.push("<!--[!-->");
      Play($$renderer2, { size: 18, fill: "currentColor", class: "translate-x-0.5" });
    }
    $$renderer2.push(`<!--]--></button> <div class="group/slider relative flex-1"><input type="range" min="0" max="1" step="0.01"${attr("value", knotState.growth)} class="slider-track absolute inset-0 z-10 w-full cursor-pointer opacity-0"/> <div class="pointer-events-none relative h-1.5 w-full overflow-hidden rounded-full bg-white/10 transition-all group-hover/slider:h-2"><div class="absolute inset-y-0 left-0 bg-white shadow-[0_0_10px_white] transition-all duration-75"${attr_style(`width: ${knotState.growth * 100}%`)}></div></div> <div class="pointer-events-none absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover/slider:opacity-100"${attr_style(`left: ${knotState.growth * 100}%; transform: translate(-50%, -50%)`)}></div></div></div> <div class="flex items-center gap-2 pl-2"><div class="mx-1 h-8 w-px bg-white/10"></div> <button${attr_class(
      `rounded-full p-3 text-slate-400 transition-all hover:bg-white/10 hover:text-white active:scale-95 ${""}`,
      "svelte-zbg823"
    )}>`);
    Share($$renderer2, { size: 20 });
    $$renderer2.push(`<!----></button></div></div></div>`);
  });
}
function _page($$renderer) {
  $$renderer.push(`<div class="relative h-screen w-screen overflow-hidden bg-[#050510]">`);
  Scene($$renderer);
  $$renderer.push(`<!----> `);
  Overlay($$renderer);
  $$renderer.push(`<!----></div>`);
}
export {
  _page as default
};
