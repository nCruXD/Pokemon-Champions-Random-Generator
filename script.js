// --- CONFIGURACIÓN Y VARIABLES GLOBALES ---
let baseDeDatos = {};
const grid = document.getElementById("pokemon-grid");
const btn = document.getElementById("random-btn");
const checkMega = document.getElementById("mega-toggle");
const checkSecondMega = document.getElementById("second-mega-toggle");
const regSelector = document.getElementById("reg-selector");

checkMega.addEventListener("change", () => {
    checkSecondMega.disabled = !checkMega.checked;
    if (!checkMega.checked) checkSecondMega.checked = false;
});

// Diccionario para nombres bonitos
const nombresEnEspanol = {
    'tauros': 'Tauros',
    'tauros-paldea-combat-breed': 'Tauros (Variedad Combate)',
    'tauros-paldea-blaze-breed': 'Tauros (Variedad Llama)',
    'tauros-paldea-aqua-breed': 'Tauros (Variedad Agua)',
    'ninetales-alola': 'Ninetales (Alola)',
    'raichu-alola': 'Raichu (Alola)',
    'arcanine-hisui': 'Arcanine (Hisui)',
    'morpeko-full-belly': 'Morpeko',
    'basculegion-male': 'Bascugelion (Macho)',
    'basculegion-female': 'Bascugelion (Hembra)',
    'meowstic-male': 'Meowstic (Macho)',
    'meowstic-female': 'Meowstic (Hembra)',
    'lycanroc-midday': 'Lycanroc (Diurno)',
    'lycanroc-midnight': 'Lycanroc (Nocturno)',
    'lycanroc-dusk': 'Lycanroc (Crepuscular)',
    'aegislash-shield': 'Aegislash',
    'mimikyu-disguised': 'Mimikyu',
    'maushold-family-of-four': 'Maushold',
    'gourgeist-average': 'Gourgeist',
};

// Cargar del JSON
async function init() {
    try {
        const res = await fetch('data.json');
        if (!res.ok) throw new Error("No se pudo cargar el archivo");
        baseDeDatos = await res.json();
        console.log("Datos cargados correctamente");
    } catch (error) {
        console.error("Error al cargar data.json:", error);
    }
}
init();

async function getEspecie(id) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    return data.species.name;
}

async function getImageUrl(id) {
    const urlHome = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
    const urlArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(urlHome);
        img.onerror = () => resolve(urlArtwork);
        img.src = urlHome;
    });
}

// --- LÓGICA PRINCIPAL DEL BOTÓN ---
btn.addEventListener("click", async () => {
    if (!baseDeDatos.catalogo_maestro) {
        alert("Los datos aún no se han cargado, espera un segundo.");
        return;
    }

    grid.innerHTML = "<p>Construyendo equipo...</p>";
    
    // 1. Obtener pools según regulación
    const regValue = regSelector.value;
    let poolNormal, poolMega;

    if (regValue === "todos") {
        poolNormal = baseDeDatos.catalogo_maestro.normales;
        poolMega = baseDeDatos.catalogo_maestro.megas;
    } else {
        const reg = baseDeDatos.regulaciones[regValue];
        poolNormal = reg.permitidos;
        poolMega = reg.megas_permitidas;
    }

    let seleccionados = [];
    let especiesUsadas = new Set();

    // 2. Selección de Mega
    if (checkMega.checked && poolMega && poolMega.length > 0) {
        const randomMega = poolMega[Math.floor(Math.random() * poolMega.length)];
        seleccionados.push(randomMega);
        especiesUsadas.add(await getEspecie(randomMega));
    // Elegir segunda Mega si aplica
        if (checkSecondMega.checked && poolMega.length > 1) {
            let randomMega2;
            let intentos = 0;
            // Bucle para asegurar que la segunda Mega sea distinta
            do {
                randomMega2 = poolMega[Math.floor(Math.random() * poolMega.length)];
                intentos++;
            } while (randomMega2 === randomMega && intentos < 10);
            
            seleccionados.push(randomMega2);
            especiesUsadas.add(await getEspecie(randomMega2));
        }
    }

    // Selección del resto
    const poolMezclado = [...poolNormal].sort(() => 0.5 - Math.random());

    for (const item of poolMezclado) {
        if (seleccionados.length >= 6) break;
        
        const especie = await getEspecie(item);
        if (!especiesUsadas.has(especie)) {
            seleccionados.push(item);
            especiesUsadas.add(especie);
        }
    }

    // Renderizado
    grid.innerHTML = "";
    for (const id of seleccionados) {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const data = await res.json();
            const finalImageUrl = await getImageUrl(data.id);
            
            const nombreFormateado = nombresEnEspanol[data.name] 
                ? nombresEnEspanol[data.name].toUpperCase() 
                : data.name.replace(/-/g, ' ').toUpperCase();

            const card = document.createElement("div");
            card.className = "poke-card";
            card.innerHTML = `
                <img src="${finalImageUrl}" alt="${data.name}">
                <h3>${nombreFormateado}</h3>
            `;
            grid.appendChild(card);
        } catch (error) {
            console.error("Error al cargar la tarjeta:", id);
        }
    }
});

const regImage = document.getElementById("reg-image");

//  imagen
const imagenesRegulacion = {
    "todos": "img/Estandar.jpg",
    "reg_1": "img/M-A.jpg",
    "reg_2": "img/Estandar.jpg"
};

regSelector.addEventListener("change", () => {
    const seleccion = regSelector.value;
    
    // Cambia la imagen según el selector
    if (imagenesRegulacion[seleccion]) {
        regImage.src = imagenesRegulacion[seleccion];
    } else {
        regImage.src = "img/Estandar.jpg"; // Imagen de respaldo
    }
});