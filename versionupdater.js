const fs = require("fs");
const path = require("path");

// Carpeta donde están tus HTML
const folderPath = __dirname; 

// Versión a reemplazar
const oldVersion = "v2.1";
const newVersion = "v2.2";

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error("Error leyendo la carpeta:", err);
    return;
  }

  files.forEach((file) => {
    if (file.endsWith(".html")) {
      const filePath = path.join(folderPath, file);

      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error leyendo el archivo:", file, err);
          return;
        }

        if (data.includes(oldVersion)) {
          const updatedData = data.split(oldVersion).join(newVersion);

          fs.writeFile(filePath, updatedData, "utf8", (err) => {
            if (err) {
              console.error("Error guardando el archivo:", file, err);
            } else {
              console.log(`✅ Actualizado: ${file}`);
            }
          });
        }
      });
    }
  });
});
