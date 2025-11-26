const fs = require("fs");
const path = require("path");

// Regex que encuentra el link viejo aunque esté en múltiples líneas
const oldLinkRegex = /https:\/\/braze-images\.com\/appboy\/communication\/assets\/image_assets\/images\/66fac448e6bad100816f1203\/original\.png\?1727710280/g;

// Link nuevo
const newLink = "https://braze-images.com/appboy/communication/assets/image_assets/images/691b806328ea9a006322f355/original.png?1763410019";

const folderPath = ".";

// Obtener HTMLs
function getHtmlFiles(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith(".html"));
}

function updateHtmlFiles() {
  const htmlFiles = getHtmlFiles(folderPath);

  htmlFiles.forEach(file => {
    const filePath = path.join(folderPath, file);
    const content = fs.readFileSync(filePath, "utf8");

    // Ver si el link viejo existe
    if (oldLinkRegex.test(content)) {
      const updated = content.replace(oldLinkRegex, newLink);
      fs.writeFileSync(filePath, updated, "utf8");

      console.log(`✔ Actualizado: ${file}`);
    } else {
      console.log(`— No encontrado en: ${file}`);
    }
  });

  console.log("\n✔ Reemplazo finalizado.");
}

updateHtmlFiles();
