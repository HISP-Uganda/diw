const ctx: Worker = self as any;

ctx.onmessage = function (event) {
  const data = event.data
  ctx.postMessage(data)
};