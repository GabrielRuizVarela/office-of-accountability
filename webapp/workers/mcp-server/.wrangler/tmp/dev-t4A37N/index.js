var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/auth.ts
async function sha256(input) {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
function extractBearerToken(authHeader) {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : null;
}
__name(extractBearerToken, "extractBearerToken");
async function authenticate(request, env2) {
  const token = extractBearerToken(request.headers.get("Authorization"));
  if (!token) {
    return { error: "Missing Authorization: Bearer <api-key> header", status: 401 };
  }
  const keyHash = await sha256(token);
  const record = await env2.API_KEYS.get(`key:${keyHash}`, "json");
  if (!record) {
    return { error: "Invalid API key", status: 401 };
  }
  if (record.revoked_at) {
    return { error: "API key has been revoked", status: 401 };
  }
  const updated = { ...record, last_used_at: (/* @__PURE__ */ new Date()).toISOString() };
  env2.API_KEYS.put(`key:${keyHash}`, JSON.stringify(updated));
  return {
    auth: {
      key_id: record.id,
      user_id: record.user_id,
      scopes: record.scopes,
      investigation_ids: record.investigation_ids
    }
  };
}
__name(authenticate, "authenticate");
function hasScope(auth, requiredScope) {
  if (auth.scopes.includes("*")) return true;
  if (auth.scopes.includes(requiredScope)) return true;
  const [namespace] = requiredScope.split(":");
  if (auth.scopes.includes(`${namespace}:*`)) return true;
  return false;
}
__name(hasScope, "hasScope");
async function checkRateLimit(keyId, env2, maxPerMinute = 120) {
  const minute = Math.floor(Date.now() / 6e4);
  const counterKey = `ratelimit:${keyId}:${minute}`;
  const current = await env2.API_KEYS.get(counterKey, "json");
  const count3 = current ?? 0;
  if (count3 >= maxPerMinute) {
    return false;
  }
  await env2.API_KEYS.put(counterKey, JSON.stringify(count3 + 1), {
    expirationTtl: 120
  });
  return true;
}
__name(checkRateLimit, "checkRateLimit");

// src/registry.ts
var tools = /* @__PURE__ */ new Map();
function registerTool(definition, handler, scope) {
  tools.set(definition.name, { definition, handler, scope });
}
__name(registerTool, "registerTool");
function listTools(auth) {
  const visible = [];
  for (const [, tool] of tools) {
    if (hasScope(auth, tool.scope)) {
      visible.push(tool.definition);
    }
  }
  return visible;
}
__name(listTools, "listTools");
async function callTool(name, args, auth, env2) {
  const tool = tools.get(name);
  if (!tool) {
    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true
    };
  }
  if (!hasScope(auth, tool.scope)) {
    return {
      content: [{ type: "text", text: `Access denied: missing scope '${tool.scope}' for tool '${name}'` }],
      isError: true
    };
  }
  try {
    return await tool.handler(args, auth, env2);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Tool error: ${message}` }],
      isError: true
    };
  }
}
__name(callTool, "callTool");
var resources = /* @__PURE__ */ new Map();
function registerResource(template, handler, scope) {
  resources.set(template.uriTemplate, { template, handler, scope });
}
__name(registerResource, "registerResource");
function listResourceTemplates(auth) {
  const visible = [];
  for (const [, resource] of resources) {
    if (hasScope(auth, resource.scope)) {
      visible.push(resource.template);
    }
  }
  return visible;
}
__name(listResourceTemplates, "listResourceTemplates");
async function readResource(uri, auth, env2) {
  for (const [, resource] of resources) {
    if (matchUriTemplate(resource.template.uriTemplate, uri)) {
      if (!hasScope(auth, resource.scope)) {
        return { error: `Access denied for resource: ${uri}` };
      }
      try {
        return await resource.handler(uri, auth, env2);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { error: `Resource error: ${message}` };
      }
    }
  }
  return { error: `Unknown resource: ${uri}` };
}
__name(readResource, "readResource");
function matchUriTemplate(template, uri) {
  const regex = template.replace(/\{[^}]+\}/g, "[^/]+");
  return new RegExp(`^${regex}$`).test(uri);
}
__name(matchUriTemplate, "matchUriTemplate");
function getToolCount() {
  return tools.size;
}
__name(getToolCount, "getToolCount");
function getResourceCount() {
  return resources.size;
}
__name(getResourceCount, "getResourceCount");

// src/proxy.ts
async function proxyToApi(options, auth, env2) {
  const url = new URL(options.path, env2.NEXTJS_API_URL);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      url.searchParams.set(key, value);
    }
  }
  const headers = {
    "Content-Type": "application/json",
    "X-MCP-User-Id": auth.user_id,
    "X-MCP-Key-Id": auth.key_id
  };
  const fetchOptions = {
    method: options.method,
    headers,
    signal: AbortSignal.timeout(3e4)
  };
  if (options.body && (options.method === "POST" || options.method === "PATCH" || options.method === "PUT")) {
    fetchOptions.body = JSON.stringify(options.body);
  }
  try {
    const response = await fetch(url.toString(), fetchOptions);
    if (!response.ok) {
      const errorText = await response.text();
      return {
        content: [
          {
            type: "text",
            text: `API error (${response.status}): ${errorText}`
          }
        ],
        isError: true
      };
    }
    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2)
        }
      ]
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Proxy error: ${message}` }],
      isError: true
    };
  }
}
__name(proxyToApi, "proxyToApi");

// src/tools/investigation.ts
registerTool(
  {
    name: "investigation.list",
    description: "List published investigations with pagination and optional tag filter.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number (1-based, default 1)" },
        limit: { type: "number", description: "Results per page (1-50, default 20)" },
        tag: { type: "string", description: "Filter by tag" }
      }
    }
  },
  async (args, auth, env2) => {
    const query = {};
    if (args.page != null) query.page = String(args.page);
    if (args.limit != null) query.limit = String(args.limit);
    if (args.tag != null) query.tag = String(args.tag);
    return proxyToApi({ method: "GET", path: "/api/investigations", query }, auth, env2);
  },
  "investigation:read"
);
registerTool(
  {
    name: "investigation.get",
    description: "Retrieve a single investigation by its ID. Drafts require author access.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Investigation UUID" }
      },
      required: ["id"]
    }
  },
  async (args, auth, env2) => {
    const id = String(args.id);
    return proxyToApi({ method: "GET", path: `/api/investigations/${id}` }, auth, env2);
  },
  "investigation:read"
);
registerTool(
  {
    name: "investigation.create",
    description: "Create a new investigation with a title, body (TipTap JSON), tags, and status.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Investigation title" },
        body: { type: "object", description: "TipTap editor JSON body" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for categorization"
        },
        status: {
          type: "string",
          enum: ["draft", "published"],
          description: "Publication status (default: draft)"
        }
      },
      required: ["title", "body"]
    }
  },
  async (args, auth, env2) => {
    const body = {
      title: args.title,
      body: args.body
    };
    if (args.tags != null) body.tags = args.tags;
    if (args.status != null) body.status = args.status;
    return proxyToApi({ method: "POST", path: "/api/investigations", body }, auth, env2);
  },
  "investigation:write"
);
registerTool(
  {
    name: "investigation.update",
    description: "Update an existing investigation. Only the author can update. Partial updates supported.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Investigation UUID" },
        title: { type: "string", description: "New title" },
        body: { type: "object", description: "New TipTap editor JSON body" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "New tags"
        },
        status: {
          type: "string",
          enum: ["draft", "published"],
          description: "New publication status"
        }
      },
      required: ["id"]
    }
  },
  async (args, auth, env2) => {
    const id = String(args.id);
    const body = {};
    if (args.title != null) body.title = args.title;
    if (args.body != null) body.body = args.body;
    if (args.tags != null) body.tags = args.tags;
    if (args.status != null) body.status = args.status;
    return proxyToApi({ method: "PATCH", path: `/api/investigations/${id}`, body }, auth, env2);
  },
  "investigation:write"
);
registerTool(
  {
    name: "investigation.delete",
    description: "Delete an investigation. Only the author can delete.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Investigation UUID" }
      },
      required: ["id"]
    }
  },
  async (args, auth, env2) => {
    const id = String(args.id);
    return proxyToApi({ method: "DELETE", path: `/api/investigations/${id}` }, auth, env2);
  },
  "investigation:write"
);
registerTool(
  {
    name: "investigation.mine",
    description: "List the authenticated user's investigations (all statuses) with pagination.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number (1-based, default 1)" },
        limit: { type: "number", description: "Results per page (1-50, default 20)" }
      }
    }
  },
  async (args, auth, env2) => {
    const query = {};
    if (args.page != null) query.page = String(args.page);
    if (args.limit != null) query.limit = String(args.limit);
    return proxyToApi({ method: "GET", path: "/api/investigations/mine", query }, auth, env2);
  },
  "investigation:read"
);
registerTool(
  {
    name: "investigation.tags",
    description: "List all unique tags from published investigations.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  async (_args, auth, env2) => {
    return proxyToApi({ method: "GET", path: "/api/investigations/tags" }, auth, env2);
  },
  "investigation:read"
);
registerTool(
  {
    name: "investigation.upload_image",
    description: "Upload a base64-encoded image for use in investigation documents. Returns the image URL. Max 5MB. Accepts JPEG, PNG, GIF, WebP.",
    inputSchema: {
      type: "object",
      properties: {
        data: {
          type: "string",
          description: "Base64-encoded image data"
        },
        filename: {
          type: "string",
          description: 'Original filename (e.g., "photo.jpg")'
        },
        mime_type: {
          type: "string",
          enum: ["image/jpeg", "image/png", "image/gif", "image/webp"],
          description: "MIME type of the image"
        }
      },
      required: ["data", "filename", "mime_type"]
    }
  },
  async (args, auth, env2) => {
    return proxyToApi(
      {
        method: "POST",
        path: "/api/investigations/images",
        body: {
          data: args.data,
          filename: args.filename,
          mime_type: args.mime_type
        }
      },
      auth,
      env2
    );
  },
  "investigation:write"
);

// src/tools/graph.ts
registerTool(
  {
    name: "graph.query",
    description: "Query the knowledge graph with structured filters. Returns nodes and links in force-graph format. At least one filter is required.",
    inputSchema: {
      type: "object",
      properties: {
        label: {
          type: "string",
          enum: ["Politician", "Legislation", "Vote", "Investigation"],
          description: "Node label to filter by"
        },
        dateFrom: {
          type: "string",
          description: "Start date filter (YYYY-MM-DD)"
        },
        dateTo: {
          type: "string",
          description: "End date filter (YYYY-MM-DD)"
        },
        jurisdiction: {
          type: "string",
          enum: ["nacional", "provincial", "municipal"],
          description: "Jurisdiction filter"
        },
        relType: {
          type: "string",
          enum: [
            "CAST_VOTE",
            "REPRESENTS",
            "AUTHORED",
            "SPONSORED",
            "REFERENCES",
            "MEMBER_OF",
            "DONATED_TO"
          ],
          description: "Relationship type filter"
        },
        limit: {
          type: "number",
          description: "Max results (1-200, default 50)"
        },
        cursor: {
          type: "string",
          description: "Pagination cursor from previous response"
        }
      }
    }
  },
  async (args, auth, env2) => {
    const query = {};
    if (args.label != null) query.label = String(args.label);
    if (args.dateFrom != null) query.dateFrom = String(args.dateFrom);
    if (args.dateTo != null) query.dateTo = String(args.dateTo);
    if (args.jurisdiction != null) query.jurisdiction = String(args.jurisdiction);
    if (args.relType != null) query.relType = String(args.relType);
    if (args.limit != null) query.limit = String(args.limit);
    if (args.cursor != null) query.cursor = String(args.cursor);
    return proxyToApi({ method: "GET", path: "/api/graph/query", query }, auth, env2);
  },
  "graph:read"
);
registerTool(
  {
    name: "graph.node",
    description: "Get a node and its 1-hop neighborhood (direct connections). Accepts UUID, slug, or acta_id.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Node identifier (UUID, slug, or acta_id)"
        },
        limit: {
          type: "number",
          description: "Max connected nodes (1-200, default 50)"
        }
      },
      required: ["id"]
    }
  },
  async (args, auth, env2) => {
    const id = String(args.id);
    const query = {};
    if (args.limit != null) query.limit = String(args.limit);
    return proxyToApi({ method: "GET", path: `/api/graph/node/${id}`, query }, auth, env2);
  },
  "graph:read"
);
registerTool(
  {
    name: "graph.expand",
    description: "Expand a node neighborhood to configurable depth (1-3 hops). Returns graph centered on the node.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Node identifier (UUID, slug, or acta_id)"
        },
        depth: {
          type: "number",
          description: "Expansion depth (1-3, default 1)"
        },
        limit: {
          type: "number",
          description: "Max nodes returned (1-500, default 200)"
        }
      },
      required: ["id"]
    }
  },
  async (args, auth, env2) => {
    const id = String(args.id);
    const query = {};
    if (args.depth != null) query.depth = String(args.depth);
    if (args.limit != null) query.limit = String(args.limit);
    return proxyToApi({ method: "GET", path: `/api/graph/expand/${id}`, query }, auth, env2);
  },
  "graph:read"
);
registerTool(
  {
    name: "graph.search",
    description: "Full-text search across graph nodes with optional label filter and cursor pagination.",
    inputSchema: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description: "Search query (1-200 characters)"
        },
        label: {
          type: "string",
          enum: ["Politician", "Legislation", "Investigation"],
          description: "Filter results by node label"
        },
        limit: {
          type: "number",
          description: "Max results (1-100, default 20)"
        },
        cursor: {
          type: "string",
          description: "Pagination cursor from previous response"
        }
      },
      required: ["q"]
    }
  },
  async (args, auth, env2) => {
    const query = { q: String(args.q) };
    if (args.label != null) query.label = String(args.label);
    if (args.limit != null) query.limit = String(args.limit);
    if (args.cursor != null) query.cursor = String(args.cursor);
    return proxyToApi({ method: "GET", path: "/api/graph/search", query }, auth, env2);
  },
  "graph:read"
);
registerTool(
  {
    name: "graph.path",
    description: "Find the shortest path(s) between two nodes in the knowledge graph.",
    inputSchema: {
      type: "object",
      properties: {
        source: {
          type: "string",
          description: "Source node identifier"
        },
        target: {
          type: "string",
          description: "Target node identifier"
        },
        maxHops: {
          type: "number",
          description: "Maximum path length (1-6, default 6)"
        },
        all: {
          type: "boolean",
          description: "Return all shortest paths (default: single shortest)"
        }
      },
      required: ["source", "target"]
    }
  },
  async (args, auth, env2) => {
    const query = {
      source: String(args.source),
      target: String(args.target)
    };
    if (args.maxHops != null) query.maxHops = String(args.maxHops);
    if (args.all === true) query.all = "true";
    return proxyToApi({ method: "GET", path: "/api/graph/path", query }, auth, env2);
  },
  "graph:read"
);
registerTool(
  {
    name: "graph.edge_provenance",
    description: "Get provenance metadata (source, confidence tier, timestamps) for a specific relationship between two nodes.",
    inputSchema: {
      type: "object",
      properties: {
        source: {
          type: "string",
          description: "Source node identifier"
        },
        target: {
          type: "string",
          description: "Target node identifier"
        },
        type: {
          type: "string",
          description: "Relationship type (e.g., CAST_VOTE, REPRESENTS)"
        }
      },
      required: ["source", "target", "type"]
    }
  },
  async (args, auth, env2) => {
    const query = {
      source: String(args.source),
      target: String(args.target),
      type: String(args.type)
    };
    return proxyToApi({ method: "GET", path: "/api/graph/edge-provenance", query }, auth, env2);
  },
  "graph:read"
);

// src/tools/ingest.ts
registerTool(
  {
    name: "ingest.add_entity",
    description: "Add a single entity node to the case graph. The entity is staged with the given label and properties, attributed to the calling MCP key.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        label: { type: "string", description: "Neo4j node label (e.g. Person, Organization)" },
        properties: { type: "object", description: "Key-value properties for the entity" },
        source_url: { type: "string", description: "Source URL for provenance (optional)" },
        confidence: { type: "number", description: "Confidence score 0\u20131 (optional)" }
      },
      required: ["caso_slug", "label", "properties"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = {
      label: args.label,
      properties: args.properties,
      proposed_by: `mcp:${auth.key_id}`
    };
    if (args.source_url != null) body.source_url = args.source_url;
    if (args.confidence != null) body.confidence = args.confidence;
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/ingest/entity`, body },
      auth,
      env2
    );
  },
  "ingest:write"
);
registerTool(
  {
    name: "ingest.add_relationship",
    description: "Add a directed relationship between two existing graph nodes. Attributed to the calling MCP key.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        from_id: { type: "string", description: "Neo4j element ID of the source node" },
        to_id: { type: "string", description: "Neo4j element ID of the target node" },
        type: { type: "string", description: "Relationship type (e.g. KNOWS, OWNS)" },
        properties: { type: "object", description: "Key-value properties on the relationship (optional)" },
        confidence: { type: "number", description: "Confidence score 0\u20131 (optional)" }
      },
      required: ["caso_slug", "from_id", "to_id", "type"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = {
      from_id: args.from_id,
      to_id: args.to_id,
      type: args.type,
      proposed_by: `mcp:${auth.key_id}`
    };
    if (args.properties != null) body.properties = args.properties;
    if (args.confidence != null) body.confidence = args.confidence;
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/ingest/relationship`, body },
      auth,
      env2
    );
  },
  "ingest:write"
);
registerTool(
  {
    name: "ingest.import_csv",
    description: "Bulk-import entities from CSV content. Columns are mapped to node properties via column_mapping. Attributed to the calling MCP key.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        csv_content: { type: "string", description: "Raw CSV text (including header row)" },
        column_mapping: {
          type: "object",
          description: "Map of CSV column name \u2192 node property name"
        },
        label: { type: "string", description: "Neo4j node label for all imported rows" },
        id_column: {
          type: "string",
          description: "CSV column to use as the unique node identifier (optional)"
        }
      },
      required: ["caso_slug", "csv_content", "column_mapping", "label"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = {
      csv_content: args.csv_content,
      column_mapping: args.column_mapping,
      label: args.label,
      proposed_by: `mcp:${auth.key_id}`
    };
    if (args.id_column != null) body.id_column = args.id_column;
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/ingest/csv`, body },
      auth,
      env2
    );
  },
  "ingest:write"
);
registerTool(
  {
    name: "ingest.import_url",
    description: "Fetch content from a URL and ingest it into the case. Optionally runs entity extraction via the LLM pipeline. Attributed to the calling MCP key.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        url: { type: "string", description: "URL to fetch and ingest" },
        extract_entities: {
          type: "boolean",
          description: "Run LLM entity extraction on the fetched content (default false)"
        }
      },
      required: ["caso_slug", "url"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = {
      url: args.url,
      extract_entities: args.extract_entities ?? false,
      proposed_by: `mcp:${auth.key_id}`
    };
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/ingest/url`, body },
      auth,
      env2
    );
  },
  "ingest:write"
);

// src/tools/pipeline.ts
registerTool(
  {
    name: "pipeline.run",
    description: "Trigger a pipeline run for a caso.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Caso slug identifier" },
        pipeline_id: { type: "string", description: "Pipeline ID to run" }
      },
      required: ["caso_slug", "pipeline_id"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = { pipeline_id: args.pipeline_id };
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/run`, body },
      auth,
      env2
    );
  },
  "pipeline:write"
);
registerTool(
  {
    name: "pipeline.state",
    description: "Get the current state of a pipeline for a caso.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Caso slug identifier" },
        pipeline_id: { type: "string", description: "Pipeline ID (optional, returns all if omitted)" }
      },
      required: ["caso_slug"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const query = {};
    if (args.pipeline_id != null) query.pipeline_id = String(args.pipeline_id);
    return proxyToApi(
      { method: "GET", path: `/api/casos/${casoSlug}/engine/state`, query },
      auth,
      env2
    );
  },
  "pipeline:read"
);
registerTool(
  {
    name: "pipeline.stop",
    description: "Stop a running pipeline by setting its status to stopped.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Caso slug identifier" },
        pipeline_id: { type: "string", description: "Pipeline ID to stop" }
      },
      required: ["caso_slug", "pipeline_id"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = { pipeline_id: args.pipeline_id, status: "stopped" };
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/state`, body },
      auth,
      env2
    );
  },
  "pipeline:write"
);
registerTool(
  {
    name: "pipeline.proposals",
    description: "List proposals for a given pipeline state, optionally filtered by status.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Caso slug identifier" },
        pipeline_state_id: { type: "string", description: "Pipeline state ID" },
        status: {
          type: "string",
          enum: ["pending", "approved", "rejected"],
          description: "Filter proposals by status (optional)"
        }
      },
      required: ["caso_slug", "pipeline_state_id"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const query = {
      pipeline_state_id: String(args.pipeline_state_id)
    };
    if (args.status != null) query.status = String(args.status);
    return proxyToApi(
      { method: "GET", path: `/api/casos/${casoSlug}/engine/proposals`, query },
      auth,
      env2
    );
  },
  "pipeline:read"
);
registerTool(
  {
    name: "pipeline.approve",
    description: "Approve one or more proposals by ID.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Caso slug identifier" },
        proposal_ids: {
          type: "array",
          items: { type: "string" },
          description: "List of proposal IDs to approve"
        },
        rationale: { type: "string", description: "Reason for approval" }
      },
      required: ["caso_slug", "proposal_ids", "rationale"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = {
      ids: args.proposal_ids,
      action: "approved",
      reviewed_by: `mcp:${auth.key_id}`
    };
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/proposals`, body },
      auth,
      env2
    );
  },
  "pipeline:write"
);
registerTool(
  {
    name: "pipeline.reject",
    description: "Reject one or more proposals by ID.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Caso slug identifier" },
        proposal_ids: {
          type: "array",
          items: { type: "string" },
          description: "List of proposal IDs to reject"
        },
        rationale: { type: "string", description: "Reason for rejection" }
      },
      required: ["caso_slug", "proposal_ids", "rationale"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = {
      ids: args.proposal_ids,
      action: "rejected",
      reviewed_by: `mcp:${auth.key_id}`
    };
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/proposals`, body },
      auth,
      env2
    );
  },
  "pipeline:write"
);
registerTool(
  {
    name: "pipeline.gate_action",
    description: "Perform an approve, reject, or back action on a pipeline gate stage.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Caso slug identifier" },
        stage_id: { type: "string", description: "Gate stage ID" },
        pipeline_state_id: { type: "string", description: "Pipeline state ID" },
        action: {
          type: "string",
          enum: ["approve", "reject", "back"],
          description: "Action to perform on the gate"
        }
      },
      required: ["caso_slug", "stage_id", "pipeline_state_id", "action"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const stageId = String(args.stage_id);
    const body = {
      pipeline_state_id: args.pipeline_state_id,
      action: args.action,
      reviewed_by: `mcp:${auth.key_id}`
    };
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/gate/${stageId}`, body },
      auth,
      env2
    );
  },
  "pipeline:write"
);

// src/tools/verify.ts
registerTool(
  {
    name: "verify.promote_tier",
    description: "Promote one or more graph nodes to a higher confidence tier (silver or gold). Requires evidence URL or rationale.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        node_ids: {
          type: "array",
          items: { type: "string" },
          description: "List of node IDs to promote"
        },
        to_tier: {
          type: "string",
          enum: ["silver", "gold"],
          description: "Target confidence tier"
        },
        evidence_url: { type: "string", description: "URL to supporting evidence (optional)" },
        rationale: { type: "string", description: "Explanation for the promotion decision" }
      },
      required: ["caso_slug", "node_ids", "to_tier", "rationale"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = {
      node_ids: args.node_ids,
      to_tier: args.to_tier,
      rationale: args.rationale,
      promoted_by: `mcp:${auth.key_id}`
    };
    if (args.evidence_url != null) body.evidence_url = args.evidence_url;
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/verify/promote`, body },
      auth,
      env2
    );
  },
  "verify:write"
);
registerTool(
  {
    name: "verify.cross_reference",
    description: "Cross-reference graph nodes using identifier matching (CUIT, DNI, or fuzzy name). Returns potential duplicate or related node pairs.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        match_type: {
          type: "string",
          enum: ["cuit", "dni", "name_fuzzy"],
          description: "Type of identifier matching to apply"
        },
        threshold: {
          type: "number",
          description: "Similarity threshold for fuzzy matching (0\u20131, optional)"
        }
      },
      required: ["caso_slug", "match_type"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = {
      match_type: args.match_type
    };
    if (args.threshold != null) body.threshold = args.threshold;
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/verify/cross-reference`, body },
      auth,
      env2
    );
  },
  "verify:write"
);

// src/tools/analyze.ts
registerTool(
  {
    name: "analyze.detect_gaps",
    description: "Detect evidence gaps, missing relationships, and weak nodes in the case graph.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" }
      },
      required: ["caso_slug"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    return proxyToApi(
      { method: "GET", path: `/api/casos/${casoSlug}/engine/analyze/gaps` },
      auth,
      env2
    );
  },
  "analyze:read"
);
registerTool(
  {
    name: "analyze.hypothesize",
    description: "Propose a new investigative hypothesis, linking it to supporting evidence nodes with a confidence score.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        hypothesis: { type: "string", description: "Text of the hypothesis to propose" },
        evidence_ids: {
          type: "array",
          items: { type: "string" },
          description: "IDs of evidence nodes supporting this hypothesis"
        },
        confidence: {
          type: "number",
          description: "Confidence score (0\u20131) for this hypothesis"
        }
      },
      required: ["caso_slug", "hypothesis", "evidence_ids", "confidence"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = {
      hypothesis: args.hypothesis,
      evidence_ids: args.evidence_ids,
      confidence: args.confidence,
      proposed_by: `mcp:${auth.key_id}`
    };
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/analyze/hypothesis`, body },
      auth,
      env2
    );
  },
  "analyze:write"
);
registerTool(
  {
    name: "analyze.run_analysis",
    description: "Run a structured analysis pass over the case graph. Supported types: procurement, ownership, connections, temporal, centrality.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        type: {
          type: "string",
          enum: ["procurement", "ownership", "connections", "temporal", "centrality"],
          description: "Analysis type to execute"
        }
      },
      required: ["caso_slug", "type"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = {
      type: args.type
    };
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/analyze/run`, body },
      auth,
      env2
    );
  },
  "analyze:read"
);

// src/tools/orchestrator.ts
registerTool(
  {
    name: "orchestrator.state",
    description: "Get the current orchestrator state for a pipeline, including focus, active tasks, and status.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        pipeline_id: { type: "string", description: "Pipeline ID to inspect" }
      },
      required: ["caso_slug", "pipeline_id"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const query = {
      pipeline_id: String(args.pipeline_id)
    };
    return proxyToApi(
      { method: "GET", path: `/api/casos/${casoSlug}/engine/orchestrator`, query },
      auth,
      env2
    );
  },
  "orchestrator:read"
);
registerTool(
  {
    name: "orchestrator.set_focus",
    description: "Set or update the investigative focus directive for a pipeline, guiding subsequent analysis steps.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        pipeline_id: { type: "string", description: "Pipeline ID to update" },
        focus: { type: "string", description: "New focus directive or investigative question" }
      },
      required: ["caso_slug", "pipeline_id", "focus"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = {
      pipeline_id: args.pipeline_id,
      focus: args.focus
    };
    return proxyToApi(
      { method: "PUT", path: `/api/casos/${casoSlug}/engine/orchestrator/focus`, body },
      auth,
      env2
    );
  },
  "orchestrator:write"
);
registerTool(
  {
    name: "orchestrator.tasks",
    description: "List all tasks queued or running under a pipeline, optionally filtered by status.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        pipeline_id: { type: "string", description: "Pipeline ID to query tasks for" },
        status: {
          type: "string",
          enum: ["pending", "active", "completed", "failed"],
          description: "Filter tasks by status (optional)"
        }
      },
      required: ["caso_slug", "pipeline_id"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const query = {
      pipeline_id: String(args.pipeline_id)
    };
    if (args.status != null) query.status = String(args.status);
    return proxyToApi(
      { method: "GET", path: `/api/casos/${casoSlug}/engine/orchestrator/tasks`, query },
      auth,
      env2
    );
  },
  "orchestrator:read"
);

// src/tools/audit.ts
registerTool(
  {
    name: "audit.trail",
    description: "Retrieve the audit trail for a pipeline state, showing all actions and mutations over time.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        pipeline_state_id: { type: "string", description: "Pipeline state ID to audit" },
        limit: { type: "number", description: "Maximum number of audit entries to return (optional)" }
      },
      required: ["caso_slug", "pipeline_state_id"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const query = {
      pipeline_state_id: String(args.pipeline_state_id)
    };
    if (args.limit != null) query.limit = String(args.limit);
    return proxyToApi(
      { method: "GET", path: `/api/casos/${casoSlug}/engine/audit`, query },
      auth,
      env2
    );
  },
  "audit:read"
);
registerTool(
  {
    name: "audit.verify_chain",
    description: "Verify the cryptographic or logical integrity of the audit chain for a pipeline state.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        pipeline_state_id: { type: "string", description: "Pipeline state ID whose chain to verify" }
      },
      required: ["caso_slug", "pipeline_state_id"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const query = {
      pipeline_state_id: String(args.pipeline_state_id),
      verify_chain: "true"
    };
    return proxyToApi(
      { method: "GET", path: `/api/casos/${casoSlug}/engine/audit`, query },
      auth,
      env2
    );
  },
  "audit:read"
);
registerTool(
  {
    name: "snapshot.create",
    description: "Create a named snapshot of the current pipeline state for later restoration or comparison.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        pipeline_state_id: { type: "string", description: "Pipeline state ID to snapshot" },
        label: { type: "string", description: "Human-readable label for this snapshot (optional)" }
      },
      required: ["caso_slug", "pipeline_state_id"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const body = {
      pipeline_state_id: args.pipeline_state_id
    };
    if (args.label != null) body.label = args.label;
    return proxyToApi(
      { method: "POST", path: `/api/casos/${casoSlug}/engine/snapshots`, body },
      auth,
      env2
    );
  },
  "snapshot:write"
);
registerTool(
  {
    name: "snapshot.list",
    description: "List all snapshots created for a given pipeline state.",
    inputSchema: {
      type: "object",
      properties: {
        caso_slug: { type: "string", description: "Case slug identifier" },
        pipeline_state_id: { type: "string", description: "Pipeline state ID to list snapshots for" }
      },
      required: ["caso_slug", "pipeline_state_id"]
    }
  },
  async (args, auth, env2) => {
    const casoSlug = String(args.caso_slug);
    const query = {
      pipeline_state_id: String(args.pipeline_state_id)
    };
    return proxyToApi(
      { method: "GET", path: `/api/casos/${casoSlug}/engine/snapshots`, query },
      auth,
      env2
    );
  },
  "snapshot:read"
);

// src/tools/resources.ts
async function fetchResource(path, auth, env2, uri) {
  const url = new URL(path, env2.NEXTJS_API_URL);
  const response = await fetch(url.toString(), {
    headers: { "X-MCP-User-Id": auth.user_id, "X-MCP-Key-Id": auth.key_id },
    signal: AbortSignal.timeout(15e3)
  });
  const data = await response.json();
  return { uri, mimeType: "application/json", text: JSON.stringify(data, null, 2) };
}
__name(fetchResource, "fetchResource");
function extractSlug(uri) {
  return uri.match(/investigation:\/\/([^/]+)/)?.[1] ?? "";
}
__name(extractSlug, "extractSlug");
registerResource(
  {
    uriTemplate: "investigation://{slug}/summary",
    name: "Investigation Summary",
    description: "High-level statistics and metadata for an investigation case.",
    mimeType: "application/json"
  },
  async (uri, auth, env2) => {
    const slug = extractSlug(uri);
    return fetchResource(`/api/caso/${slug}/stats`, auth, env2, uri);
  },
  "investigation:read"
);
registerResource(
  {
    uriTemplate: "investigation://{slug}/schema",
    name: "Investigation Schema",
    description: "Graph schema (node labels and relationship types) for an investigation.",
    mimeType: "application/json"
  },
  async (uri, auth, env2) => {
    const slug = extractSlug(uri);
    return fetchResource(`/api/caso/${slug}/schema`, auth, env2, uri);
  },
  "investigation:read"
);
registerResource(
  {
    uriTemplate: "investigation://{slug}/gaps",
    name: "Investigation Gaps",
    description: "Identified knowledge gaps and missing connections in an investigation.",
    mimeType: "application/json"
  },
  async (uri, auth, env2) => {
    const slug = extractSlug(uri);
    return fetchResource(`/api/casos/${slug}/engine/analyze/gaps`, auth, env2, uri);
  },
  "analyze:read"
);
registerResource(
  {
    uriTemplate: "investigation://{slug}/pipeline",
    name: "Investigation Pipeline State",
    description: "Current engine pipeline state for an investigation (stages, status, progress).",
    mimeType: "application/json"
  },
  async (uri, auth, env2) => {
    const slug = extractSlug(uri);
    return fetchResource(`/api/casos/${slug}/engine/state`, auth, env2, uri);
  },
  "pipeline:read"
);
registerResource(
  {
    uriTemplate: "investigation://{slug}/metrics",
    name: "Investigation Engine Metrics",
    description: "Observability counters and LLM token usage for an investigation engine run.",
    mimeType: "application/json"
  },
  async (uri, auth, env2) => {
    const slug = extractSlug(uri);
    return fetchResource(`/api/casos/${slug}/engine/metrics`, auth, env2, uri);
  },
  "pipeline:read"
);

// src/index.ts
var PROTOCOL_VERSION = "2024-11-05";
var SERVER_NAME = "Office of Accountability Investigation Engine";
var SERVER_VERSION = "1.0.0";
function sendSSEEvent(session, event, data) {
  const payload = `event: ${event}
data: ${JSON.stringify(data)}

`;
  session.writer.write(session.encoder.encode(payload));
}
__name(sendSSEEvent, "sendSSEEvent");
function handleInitialize(id) {
  const result = {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {
      tools: {},
      resources: {}
    },
    serverInfo: {
      name: SERVER_NAME,
      version: SERVER_VERSION
    }
  };
  return { jsonrpc: "2.0", id, result };
}
__name(handleInitialize, "handleInitialize");
var src_default = {
  async fetch(request, env2) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }
    if (path === "/health" && request.method === "GET") {
      return handleHealth(env2);
    }
    if (path === "/.well-known/mcp.json" && request.method === "GET") {
      return handleManifest(request);
    }
    if (path === "/sse" && request.method === "GET") {
      return handleSSE(request, env2);
    }
    if (path === "/message" && request.method === "POST") {
      return handleMessage(request, env2);
    }
    return new Response("Not Found", { status: 404, headers: corsHeaders() });
  }
};
async function handleSSE(request, env2) {
  const authResult = await authenticate(request, env2);
  if ("error" in authResult) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: authResult.status,
      headers: { ...corsHeaders(), "Content-Type": "application/json" }
    });
  }
  const { auth } = authResult;
  const { readable, writable } = new TransformStream();
  const session = {
    writer: writable.getWriter(),
    encoder: new TextEncoder()
  };
  const messageUrl = new URL("/message", request.url).toString();
  sendSSEEvent(session, "endpoint", messageUrl);
  return new Response(readable, {
    status: 200,
    headers: {
      ...corsHeaders(),
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}
__name(handleSSE, "handleSSE");
async function handleMessage(request, env2) {
  const authResult = await authenticate(request, env2);
  if ("error" in authResult) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: authResult.status,
      headers: { ...corsHeaders(), "Content-Type": "application/json" }
    });
  }
  const { auth } = authResult;
  const allowed = await checkRateLimit(auth.key_id, env2);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded: 120 tool calls per minute" }),
      { status: 429, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    );
  }
  let rpcRequest;
  try {
    rpcRequest = await request.json();
  } catch {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: "Parse error" }
      }),
      { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    );
  }
  if (rpcRequest.jsonrpc !== "2.0" || !rpcRequest.method) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: rpcRequest.id ?? null,
        error: { code: -32600, message: "Invalid JSON-RPC request" }
      }),
      { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    );
  }
  let response;
  switch (rpcRequest.method) {
    case "initialize":
      response = handleInitialize(rpcRequest.id);
      break;
    case "notifications/initialized":
      return new Response(null, { status: 204, headers: corsHeaders() });
    case "tools/list":
      response = {
        jsonrpc: "2.0",
        id: rpcRequest.id,
        result: { tools: listTools(auth) }
      };
      break;
    case "tools/call": {
      const params = rpcRequest.params;
      if (!params?.name) {
        response = {
          jsonrpc: "2.0",
          id: rpcRequest.id,
          error: { code: -32602, message: "Missing tool name in params" }
        };
        break;
      }
      const toolResult = await callTool(params.name, params.arguments ?? {}, auth, env2);
      response = {
        jsonrpc: "2.0",
        id: rpcRequest.id,
        result: toolResult
      };
      break;
    }
    case "resources/list":
      response = {
        jsonrpc: "2.0",
        id: rpcRequest.id,
        result: { resourceTemplates: listResourceTemplates(auth) }
      };
      break;
    case "resources/read": {
      const uri = rpcRequest.params?.uri;
      if (!uri) {
        response = {
          jsonrpc: "2.0",
          id: rpcRequest.id,
          error: { code: -32602, message: "Missing resource URI in params" }
        };
        break;
      }
      const resourceResult = await readResource(uri, auth, env2);
      if ("error" in resourceResult) {
        response = {
          jsonrpc: "2.0",
          id: rpcRequest.id,
          error: { code: -32602, message: resourceResult.error }
        };
      } else {
        response = {
          jsonrpc: "2.0",
          id: rpcRequest.id,
          result: { contents: [resourceResult] }
        };
      }
      break;
    }
    default:
      response = {
        jsonrpc: "2.0",
        id: rpcRequest.id,
        error: { code: -32601, message: `Unknown method: ${rpcRequest.method}` }
      };
  }
  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { ...corsHeaders(), "Content-Type": "application/json" }
  });
}
__name(handleMessage, "handleMessage");
async function handleHealth(env2) {
  let neo4jStatus = "unknown";
  let neo4jLatency = -1;
  try {
    const start = Date.now();
    const res = await fetch(`${env2.NEXTJS_API_URL}/api/health`, {
      signal: AbortSignal.timeout(5e3)
    });
    neo4jLatency = Date.now() - start;
    neo4jStatus = res.ok ? "connected" : "error";
  } catch {
    neo4jStatus = "unreachable";
  }
  const body = {
    status: "ok",
    tools: getToolCount(),
    resources: getResourceCount(),
    neo4j: { status: neo4jStatus, latency_ms: neo4jLatency },
    version: SERVER_VERSION
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders(), "Content-Type": "application/json" }
  });
}
__name(handleHealth, "handleHealth");
function handleManifest(request) {
  const baseUrl = new URL(request.url).origin;
  const manifest = {
    name: SERVER_NAME,
    version: SERVER_VERSION,
    description: "Investigation creation, pipeline orchestration, graph analysis, and compliance for civic research",
    transport: "sse",
    url: `${baseUrl}/sse`,
    auth: { type: "bearer", description: "API key from Settings > API Keys" }
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: { ...corsHeaders(), "Content-Type": "application/json" }
  });
}
__name(handleManifest, "handleManifest");
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}
__name(corsHeaders, "corsHeaders");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-zcDNnW/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-zcDNnW/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
