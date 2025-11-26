const fs = require("fs");
const path = require("path");

const folderPath = "."; // carpeta actual

// Footer viejo (regex robusto que matchea todo el bloque)
const oldFooterRegex = /<footer class="footer">[\s\S]*?<\/footer>/g;

// Footer nuevo EXACTO como lo necesitás
const newFooter = `
        <footer class="footer">
            <a href="https://riders.repartosya.com.ar/categorias/pagos.html" class="container_boton">
                <button class="boton">Ver más sobre mis pagos</button>
            </a>
        </footer>`;

// Obtener HTMLs
function getHtmlFiles(dir) {
    return fs.readdirSync(dir).filter(f => f.endsWith(".html"));
}

// Reemplazo
function updateFooter() {
    const htmlFiles = getHtmlFiles(folderPath);

    htmlFiles.forEach(file => {
        const filePath = path.join(folderPath, file);
        const content = fs.readFileSync(filePath, "utf8");

        if (oldFooterRegex.test(content)) {
            const updated = content.replace(oldFooterRegex, newFooter);
            fs.writeFileSync(filePath, updated, "utf8");
            console.log(`✔ Footer actualizado en: ${file}`);
        } else {
            console.log(`— Footer no encontrado en: ${file}`);
        }
    });

    console.log("\n✔ Reemplazo de footers finalizado.");
}

updateFooter();
