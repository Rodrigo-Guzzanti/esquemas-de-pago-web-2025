document.addEventListener('DOMContentLoaded', function () {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyYkSXnvfWpNHvrJPu6s3lbYl7rued2SDM2XvA58jh4CBfoLcRnE3FNRSq_ynLmH_Kr6A/exec';
  
    // Obtener nombre del archivo sin la extensión
    const path = window.location.pathname;
    const fileNameWithExtension = path.substring(path.lastIndexOf("/") + 1);
    const fileName = fileNameWithExtension.split(".").slice(0, -1).join(".");
  
    // Buscar la imagen y actualizarle el ID para que coincida con el nombre del archivo
    const img = document.getElementById("linkRAF");
    if (img) {
      img.id = fileName;
      img.src = "https://braze-images.com/appboy/communication/assets/image_assets/images/67b47bb5bb5dc900650b683c/original.gif?1739881397"; // Imagen de carga
    }
  
    // Traer los datos del App Script y reemplazar src
    fetch(scriptURL)
      .then(response => response.json())
      .then(data => {
        const rafData = data.find(item => item.codigo === fileName);
        const imgElement = document.getElementById(fileName);
  
        if (rafData && imgElement) {
          imgElement.src = rafData.linkRAF;
        }
      })
      .catch(error => console.error('Error al obtener los datos:', error));
  });
  