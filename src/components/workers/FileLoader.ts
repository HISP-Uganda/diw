import { read } from 'xlsx';

const ctx: Worker = self as any;

ctx.onmessage = function (event) {
  const [file] = event.data;
  const reader = new FileReader();
  reader.onerror = () => {
    reader.abort();
  };
  reader.onload = () => {
    const workbook = read(reader.result, {
      type: "array",
      raw: true,
      dateNF: "yyyy-mm-dd\\Thh:mm:ss",
    });
    ctx.postMessage(workbook)
  };
  reader.readAsArrayBuffer(file)
};