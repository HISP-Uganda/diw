const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

let sessionCookie = "";
const onProxyReq = (proxyReq) => {
  if (sessionCookie) {
    proxyReq.setHeader("cookie", sessionCookie);
  }
};
const onProxyRes = (proxyRes) => {
  const proxyCookie = proxyRes.headers["set-cookie"];
  if (proxyCookie) {
    sessionCookie = proxyCookie;
  }
};

// proxy middleware options
const options = {
  target: "https://icyd.dev.hispuganda.org/dev", // target host
  onProxyReq,
  onProxyRes,
  changeOrigin: true, // needed for virtual hosted sites
  auth: undefined,
  logLevel: "debug",
};

// create the proxy (without context)
const exampleProxy = createProxyMiddleware(options);

const app = express();
app.use("/", exampleProxy);
app.listen(3002);
