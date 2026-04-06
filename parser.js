async function loadScad() {
  const res = await fetch("./templates/lens_adapter.scad");
  return await res.text();
}

function extractParams(scadText) {
  const regex = /(\w+)\s*=\s*([\d.]+);/g;
  const params = {};
  let match;

  while ((match = regex.exec(scadText)) !== null) {
    params[match[1]] = parseFloat(match[2]);
  }

  return params;
}

function updateParamsFromUI(params) {
  const updated = {};

  for (let key in params) {
    const input = document.getElementById(key);
    updated[key] = parseFloat(input.value);
  }

  return updated;
}