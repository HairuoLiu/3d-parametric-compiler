const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/generate", (req, res) => {
  const { template, params } = req.body;

  const inputPath = `./templates/${template}`;
  const tempPath = `./temp.scad`;
  const outputPath = `./output.stl`;

  let scad = fs.readFileSync(inputPath, "utf8");

  for (let key in params) {
    const regex = new RegExp(`${key}\\s*=\\s*[\\d.]+;`);
    scad = scad.replace(regex, `${key} = ${params[key]};`);
  }

  fs.writeFileSync(tempPath, scad);

  exec(`openscad -o ${outputPath} ${tempPath}`, (err) => {
    if (err) return res.status(500).send("OpenSCAD error");

    const file = fs.readFileSync(outputPath);
    res.setHeader("Content-Type", "application/sla");
    res.send(file);
  });
});

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});