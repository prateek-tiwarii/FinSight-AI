const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

function loadApi() {
  const sourcePath = path.join(__dirname, "../src/lib/api.ts");
  const source = fs.readFileSync(sourcePath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const apiModule = new Module(sourcePath, module);
  apiModule.filename = sourcePath;
  apiModule.paths = Module._nodeModulePaths(path.dirname(sourcePath));
  apiModule._compile(compiled, sourcePath);
  return apiModule.exports;
}

function setCookie(value) {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { cookie: value },
  });
}

test("apiFetch sends CSRF and credentials on every unsafe method", async () => {
  setCookie("finsight_csrf=csrf-value");
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
  };
  const { apiFetch } = loadApi();

  for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
    await apiFetch("/api/test", { method });
  }

  assert.equal(calls.length, 4);
  for (const { init } of calls) {
    assert.equal(new Headers(init.headers).get("X-CSRF-Token"), "csrf-value");
    assert.equal(init.credentials, "include");
  }
});

test("guest session waits for the credentialed CSRF priming GET", async () => {
  setCookie("");
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    const headers = { "content-type": "application/json" };
    if (url.endsWith("/api/auth/me")) headers["X-CSRF-Token"] = "primed-token";
    return new Response("{}", { status: 200, headers });
  };
  const { continueAsGuest } = loadApi();

  await continueAsGuest();

  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /\/api\/auth\/me$/);
  assert.equal(calls[0].init.credentials, "include");
  assert.match(calls[1].url, /\/api\/guest\/session$/);
  assert.equal(calls[1].init.credentials, "include");
  assert.equal(new Headers(calls[1].init.headers).get("X-CSRF-Token"), "primed-token");
  assert.equal(globalThis.document.cookie, "");
});

test("apiFetch does not send an unsafe request when priming does not set a cookie", async () => {
  setCookie("");
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
  };
  const { continueAsGuest } = loadApi();

  await assert.rejects(continueAsGuest(), /CSRF initialization failed/);
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/api\/auth\/me$/);
});
