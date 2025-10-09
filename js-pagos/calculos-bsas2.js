document.addEventListener('DOMContentLoaded', function()  {
    
    // ----------------------  PARTE 1  ----------------------

    const url = 'https://script.google.com/macros/s/AKfycbxazwkCW8yuFaFNJ0Al99ckD9Szgd66FCALIR7WzffoAbposT-stBI8GCrrI9AP8KsU6w/exec?hoja=Zn%201%20%2B%20GBA%20Oeste%20CODIGO';
    

    let data = [];
    let valoresEstaticos = {};
    let tarifasValores = {};

    const sliders = document.querySelectorAll('input[type="range"]');
    const menu = document.getElementById('menuDesplegable');
    const menu2 = document.getElementById('menuDesplegable2');

    let valorAdicionalActual = 0;
    let seccionActiva = null;

    function updateBar(slider, seccion) {
        const value = slider.value;
        const max = slider.max;
        const percentage = (value / max) * 100;
        const color = (seccion === '2' || seccion === '3') ? '#100423' : '#fa0050';
        slider.style.background = `linear-gradient(to right, ${color} ${percentage}%, #ddd ${percentage}%)`;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) { // Verifica si la respuesta HTTP fue exitosa (código 200)
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(responseData => {
            try {
                data = responseData;
                console.log("Estructura de los datos recibidos:", data);

                renderTable1();
                renderTable2();

                data.forEach((item, index) => {
                    // **MODIFICACIÓN CLAVE AQUÍ:** Usamos el operador de coalescencia nula (??)
                    // para asegurar que si item.Pick_Up es null o undefined, se use 0 en su lugar.
                    valoresEstaticos[index + 1] = {
                        estatico1: item.Pick_Up ?? 0,
                        estatico2: item.Drop_Off ?? 0,
                        extraPorDO: item.Extra_por_DO ?? 0
                    };

                    const estatico1Elem = document.getElementById(`valor-estatico1-${index + 1}`);
                    const estatico2Elem = document.getElementById(`valor-estatico2-${index + 1}`);
                    const extraPorDOElem = document.getElementById(`extra-por-do-${index + 1}`);

                    if (estatico1Elem && estatico2Elem) {
                        estatico1Elem.textContent = `$${item.Pick_Up ?? 0}`;
                        estatico2Elem.textContent = `$${item.Drop_Off ?? 0}`;
                    } else {
                        console.warn(`Elementos no encontrados para index ${index + 1}`);
                    }

                    if (extraPorDOElem) {
                        extraPorDOElem.textContent = item.Extra_por_DO ?? 0;
                    } else {
                        console.warn(`Elemento con ID 'extra-por-do-${index + 1}' no encontrado.`);
                    }
                });

                data.forEach((item, index) => {
                    // **MODIFICACIÓN CLAVE AQUÍ:** Usamos el operador de coalescencia nula (??)
                    // para asegurar que si item.tarifas es null o undefined, se use 0 en su lugar.
                    tarifasValores[index + 1] = {
                        tarifasValores1: item.tarifas ?? 0,
                        tarifasValores2: item.tarifas1 ?? 0
                    };

                    const tarifa1Elem = document.getElementById(`valor-dinamico1-1-${index + 1}`);
                    const tarifa2Elem = document.getElementById(`valor-dinamico2-2-${index + 1}`);

                    if (tarifa1Elem && tarifa2Elem) {
                        tarifa1Elem.textContent = `$${item.tarifas ?? 0}`;
                        tarifa2Elem.textContent = `$${item.tarifas1 ?? 0}`;
                    } else {
                        console.warn(`Elementos no encontrados para index ${index + 1}`);
                    }
                });

                console.log('Valores estáticos:', valoresEstaticos);
                console.log('Tarifas dinámicas:', tarifasValores);

                // **MODIFICACIÓN CLAVE AQUÍ:**
                // Llamamos a mostrarSeccion() y actualizarResultado() aquí.
                // Es crucial que 'actualizarResultado' se llame *después* de que
                // 'valoresEstaticos' esté completamente poblado.
                mostrarSeccion();
                actualizarResultado(); // Esto debería ahora tomar el valor inicial de menu2
                actualizarValores(); // Y luego actualizar todos los demás valores

                // Oculta la imagen de carga
                document.getElementById("overlay").style.display = "none";

            } catch (err) {
                // Este es el error que te estaba marcando. Aquí capturamos errores
                // que ocurren DENTRO del bloque try, como intentar acceder a propiedades
                // de un objeto undefined.
                console.error('Error al procesar los datos de la API:', err);
                document.getElementById("overlay").style.display = "none";
            }
        })
        .catch(error => {
            // Este .catch() captura errores de la propia solicitud fetch (ej. problema de red, URL incorrecta)
            console.error('Error en la solicitud Fetch o respuesta no exitosa:', error);
            document.getElementById("overlay").style.display = "none";
        });

    // Función para calcular el valor dinámico para la primera barra, usando las tarifas obtenidas
    function calcularValorDinamico1(distancia) {
        let amount = 0;
        console.log(tarifasValores)
        // Usamos las tarifas dinámicas dependiendo del rango de la distancia
        if (distancia <= 1.5) {
            amount = distancia * tarifasValores[12].tarifasValores1; // Usar tarifa de la primera barra
        } else if (distancia <= 2.5) {
            amount = ((distancia - 1.5) * tarifasValores[13].tarifasValores1) + (1.5 * tarifasValores[12].tarifasValores1);
        } else if (distancia <= 4) {
            amount = ((distancia - 2.5) * tarifasValores[14].tarifasValores1) + (1 * tarifasValores[13].tarifasValores1) + (1.5 * tarifasValores[12].tarifasValores1);
        } else if (distancia <= 6) {
            amount = ((distancia - 4) * tarifasValores[15].tarifasValores1) + (1.5 * tarifasValores[14].tarifasValores1) + (1 * tarifasValores[13].tarifasValores1) + (1.5 * tarifasValores[12].tarifasValores1);
        }

        return parseFloat(amount.toFixed(1));    
    }

    // Función para calcular el valor dinámico para la segunda barra
    function calcularValorDinamico2(distancia) {
        let amount = 0;

        // Usamos las tarifas dinámicas de tarifasValores1 para la segunda barra
        if (distancia <= 2) {
            amount = distancia * tarifasValores[12].tarifasValores2; // Usar tarifa de la primera barra
        } else if (distancia <= 4) {
            amount = ((distancia - 2) * tarifasValores[13].tarifasValores2) + (2 * tarifasValores[12].tarifasValores2);
        } else if (distancia <= 6) {
            amount = ((distancia - 4) * tarifasValores[14].tarifasValores2) + (1 * tarifasValores[13].tarifasValores2) + (2 * tarifasValores[12].tarifasValores2);
        } else if (distancia <= 8) {
            amount = ((distancia - 6) * tarifasValores[15].tarifasValores2) + (2 * tarifasValores[14].tarifasValores2) + (1 * tarifasValores[13].tarifasValores2) + (2 * tarifasValores[12].tarifasValores2);
        }

        return parseFloat(amount.toFixed(1));    
    }


    function calcularValorBatch(distancia) {
            let amount = 0;
            const valorAdicional2 = menu2.value; 
            console.log(valoresEstaticos[8].estatico1)

            if (distancia <= 1.5) {
                if (valorAdicional2 == "1"){
                    amount += distancia * valoresEstaticos[8].estatico1;
                } else if (valorAdicional2 == "2"){
                    amount += distancia * valoresEstaticos[9].estatico1; 
                } else if (valorAdicional2 == "3"){
                    amount += distancia * valoresEstaticos[10].estatico1; 
                } else if (valorAdicional2 == "4"){
                    amount += distancia * valoresEstaticos[11].estatico1; 
                } 
            } else if (distancia <= 2.5) {
                if (valorAdicional2 == "1"){
                    amount += distancia * valoresEstaticos[8].estatico1;
                } else if (valorAdicional2 == "2"){
                    amount += distancia * valoresEstaticos[9].estatico1; 
                } else if (valorAdicional2 == "3"){
                    amount += distancia * valoresEstaticos[10].estatico1; 
                } else if (valorAdicional2 == "4"){
                    amount += distancia * valoresEstaticos[11].estatico1; 
                } 
            } else if (distancia <= 4) {
                if (valorAdicional2 == "1"){
                    amount += distancia * valoresEstaticos[8].estatico1;
                } else if (valorAdicional2 == "2"){
                    amount += distancia * valoresEstaticos[9].estatico1; 
                } else if (valorAdicional2 == "3"){
                    amount += distancia * valoresEstaticos[10].estatico1; 
                } else if (valorAdicional2 == "4"){
                    amount += distancia * valoresEstaticos[11].estatico1; 
                } 
            } else if (distancia <= 8) {
                if (valorAdicional2 == "1"){
                    amount += distancia * valoresEstaticos[8].estatico1;
                } else if (valorAdicional2 == "2"){
                    amount += distancia * valoresEstaticos[9].estatico1; 
                } else if (valorAdicional2 == "3"){
                    amount += distancia * valoresEstaticos[10].estatico1; 
                } else if (valorAdicional2 == "4"){
                    amount += distancia * valoresEstaticos[11].estatico1; 
                } 
            }
            return parseFloat(amount.toFixed(1))
        }

    // Función para actualizar los valores en la sección activa
    function actualizarValores() {
        if (!seccionActiva) return;
    
        // Obtener elementos específicos para la sección activa
        const distanciaLocal = parseFloat(seccionActiva.querySelector('.distanceLocal-1').value) || 0;
        const distanciaUsuario = parseFloat(seccionActiva.querySelector('.distanceUser-1').value) || 0;
    
        const valorDinamico1 = calcularValorDinamico1(distanciaLocal);
        const valorDinamico2 = calcularValorDinamico2(distanciaUsuario);
        const valorBatch = calcularValorBatch(distanciaUsuario);
    
        seccionActiva.querySelector('.valor-dinamico1-1').textContent = `$${valorDinamico1}`;
        seccionActiva.querySelector('.valor-dinamico2-2').textContent = `$${valorDinamico2}`;
        seccionActiva.querySelector('.valorbatch').textContent = `$${valorBatch}`;
        seccionActiva.querySelector('.distancia1').textContent = `${distanciaLocal} km`;
        seccionActiva.querySelector('.distancia2').textContent = `${distanciaUsuario} km`;
    
        // Llamar a los valores estáticos según la sección activa
        const valores = valoresEstaticos[seccionActiva.dataset.seccion];
    
        // Si los valores están definidos, sumarlos
        let resultadoFinal = 0;
        if (valores) {
            resultadoFinal = valores.estatico1 + valores.estatico2 + valorDinamico1 + valorDinamico2 + valorBatch;
        }
    
        // Añadir el valor adicional
        resultadoFinal += valorAdicionalActual; // Asegúrate de que `valorAdicionalActual` está correctamente calculado
    
        // Actualizar el resultado final
        seccionActiva.querySelector('.resultado-claro span').textContent = `$${resultadoFinal.toFixed(1)}*`;
    }
    

    // Función para actualizar el resultado con el valor adicional seleccionado
    function actualizarResultado() {

        const valorSeleccionado2 = menu2.value;
        const valoresAdicionales = {
            "1": valoresEstaticos[1].extraPorDO,
            "2": valoresEstaticos[2].extraPorDO,
            "3": valoresEstaticos[3].extraPorDO,
            "4": valoresEstaticos[4].extraPorDO,
            "5": valoresEstaticos[5].extraPorDO,
            "6": valoresEstaticos[6].extraPorDO
        };
        const valorAdicional = valoresAdicionales[valorSeleccionado2] || 0;

        // Actualizar valor adicional actual
        valorAdicionalActual = valorAdicional;

        // Seleccionar todos los elementos con la clase 'valorAdicional'
        const valorAdicionalElementos = document.querySelectorAll('.valorAdicional');
        
        // Iterar sobre cada elemento y actualizar su contenido
        valorAdicionalElementos.forEach(elemento => {
            elemento.textContent = `$${valorAdicional}`;
        });

        if (seccionActiva) {
            // Recalcular y actualizar valores
            actualizarValores();
        }
    }


    // Función para mostrar la sección activa basada en el menú desplegable
    function mostrarSeccion() {
            const valorSeleccionado = menu.value;

            seccionActiva = document.getElementById(`seccion${valorSeleccionado}`);

            // Ocultar todas las secciones y mostrar solo la activa
            document.querySelectorAll('.seccion').forEach(seccion => {
                seccion.style.display = seccion === seccionActiva ? 'block' : 'none';
            });

            // Actualizar valores si se muestra una sección
            if (seccionActiva) {
                actualizarValores();
            }
        }

    // Función para mostrar/ocultar la imagen
    document.getElementById('mostrarImagenBtn').addEventListener('click', function() {
            var imagenContainer = document.getElementById('imagenContainer');
            var icono = this.querySelector('i'); // Selecciona el ícono dentro del botón
            // Alternar entre mostrar y ocultar la imagen
            if (imagenContainer.style.display === 'none' || imagenContainer.style.display === '') {
            imagenContainer.style.display = 'block';
            this.innerHTML = '<i class="fa-solid fa-arrow-up"></i> Extra exclusivo para riders nuevos'; // Cambia el texto e ícono del botón
            } else {
            imagenContainer.style.display = 'none';
            this.innerHTML = '<i class="fa-solid fa-arrow-down"></i> Extra exclusivo para riders nuevos'; // Cambia el texto e ícono del botón
        }
    });

    // Inicializar los colores de las barras y actualizar el resultado
    sliders.forEach(slider => {
        const seccion = slider.closest('.seccion').id.replace('seccion', '');
        slider.addEventListener('input', () => {
            updateBar(slider, seccion);
            actualizarValores();
        });
        updateBar(slider, seccion); // Inicializar el color
    });

    // Asignar eventos a los menús desplegables
    menu.addEventListener('change', mostrarSeccion);
    menu2.addEventListener('change', actualizarResultado);

    // Mostrar la sección inicial y llamar a la función de actualización para establecer los valores iniciales
    mostrarSeccion(); // Mostrar sección inicial al cargar la página
    actualizarResultado(); // Asegurarse de que el resultado se actualice con el valor adicional

    // Función para renderizar la primera tabla
    function renderTable1() {
        const tableBody = document.querySelector('#tableBody');
        const diasSemana = [
            "<h5 class='dia-semana'>Lunes a viernes</h5><h6 class='horario'>07:00 a 20:00</h6>",
            "<h5 class='dia-semana'>Lunes a jueves</h5><h6 class='horario'>20:00 a finalización</h6>",
            "<h5 class='dia-semana'>Viernes a domingo</h5><h6 class='horario'>20:00 a finalización</h6>",
            "<h5 class='dia-semana'>Sábado y domingo</h5><h6 class='horario'>07:00 a 20:00</h6>",
            "<h5 class='grupos'>Grupo 1</h5>",
            "<h5>Grupo 2</h5>",
            "<h5>Grupo 3</h5>",
            "<h5>Grupo 4</h5>",
        ];
    
        tableBody.innerHTML = ''; 
        const fragment = document.createDocumentFragment(); 
    
        data.slice(-diasSemana.length).forEach((record, index) => {
            const row = document.createElement('tr');
            row.classList.add(index % 2 === 0 ? 'fila-par' : 'fila-impar');
    
            // Mantener alineación agregando una celda vacía en las primeras 4 filas (Días de la semana)
            if (index < 4) {  
                const emptyCell = document.createElement('td');
                emptyCell.classList.add('adicional-vacia'); 
                row.appendChild(emptyCell);
            }
    
            // Agregar "Adicional por grupo" solo en la fila de Grupo 1
            if (index === 4) {  
                const adicionalCell = document.createElement('td');
                adicionalCell.textContent = 'Adicional por grupo';
                adicionalCell.setAttribute('rowspan', 4);
                adicionalCell.classList.add('adicional-cell');
                row.appendChild(adicionalCell);
            }
    
            // Celda de Día/Grupo
            const diaCell = document.createElement('td');
            diaCell.innerHTML = diasSemana[index];
            row.appendChild(diaCell);
    
            // Celda de Retiro solo para los días de la semana, grupos no deben tener valores
            if (index < 4) { 
                const retiroCell = document.createElement('td');
                retiroCell.textContent = `$${record.retiro}`;
                retiroCell.classList.add('numeros-Km');
                row.appendChild(retiroCell);
            } else {
                row.appendChild(document.createElement('td'));
            }
    
            // Celda de Entrega para todos
            const entregaCell = document.createElement('td');
            entregaCell.textContent = `$${record.entrega}`;
            entregaCell.classList.add('numeros-Km');
            row.appendChild(entregaCell);
    
            fragment.appendChild(row);
        });
    
        tableBody.appendChild(fragment);
    }
    

    function renderTable2() {
        const tableBody2 = document.querySelector('#tableBody2'); 
        const tramos = [
            "<h5 class='tramo'>Tramo 1</h5>",
            "<h5 class='tramo'>Tramo 2</h5>",
            "<h5 class='tramo'>Tramo 3</h5>",
            "<h5 class='tramo'>Tramo 4</h5>",
            "<h5 class='grupos'>Grupo 1</h5>",
            "<h5>Grupo 2</h5>",
            "<h5>Grupo 3</h5>",
            "<h5>Grupo 4</h5>",
        ];
    
        tableBody2.innerHTML = ''; 
        const fragment = document.createDocumentFragment();
    
        data.slice(-tramos.length).forEach((record, index) => {
            const row = document.createElement('tr');
            row.classList.add(index % 2 === 0 ? 'fila-par' : 'fila-impar');
    
            // Celda vacía en las primeras 4 filas para mantener alineación
            if (index < 4) {  
                const emptyCell = document.createElement('td');
                emptyCell.classList.add('adicional-vacia'); 
                row.appendChild(emptyCell);
            }
    
            // Agregar "Adicional por grupo" en Grupo 1 y extenderlo a los demás grupos
            if (index === 4) {  
                const adicionalCell = document.createElement('td');
                adicionalCell.textContent = 'Adicional por grupo';
                adicionalCell.setAttribute('rowspan', 4); // Se extiende a Grupo 1, 2, 3 y 4
                adicionalCell.classList.add('adicional-cell');
                row.appendChild(adicionalCell);
            }
    
            // Celda de Tramo/Grupo
            const tramoCell = document.createElement('td');
            tramoCell.innerHTML = tramos[index];
            row.appendChild(tramoCell);
    
            // Celda de Retiro solo para los tramos de distancia, grupos no deben tener valores
            if (index < 4) { 
                const retiroCell = document.createElement('td');
                retiroCell.textContent = record.retiro_km ? `$${record.retiro_km}` : '-';
                retiroCell.classList.add('numeros-Km');
                row.appendChild(retiroCell);
            } else {
                row.appendChild(document.createElement('td'));
            }
    
            // Celda de Entrega para todos
            const entregaCell = document.createElement('td');
            entregaCell.textContent = record.entrega_km ? `$${record.entrega_km}` : '-';
            entregaCell.classList.add('numeros-Km');
            row.appendChild(entregaCell);
    
            fragment.appendChild(row);
        });
    
        // Agregar resumen al final
        const summaryRow = document.createElement('tr');
        summaryRow.classList.add('summary-row');
        const adicional = document.createElement('td');
        adicional.setAttribute('colspan', 4);
        adicional.textContent = 'Extra por hora de publicidad: bicicleta $9 y moto o auto $15';
        summaryRow.appendChild(adicional);
        fragment.appendChild(summaryRow);
    
        tableBody2.appendChild(fragment);
    }
    

    
});


