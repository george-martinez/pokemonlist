/* References */
const listBox = document.querySelector(".list-box");
const listAddBtn = document.querySelector(".list-button");
const inputFilter = document.querySelector(".pokemon-filter");
const pokemonCountDOM = document.getElementById("pokemonCountDOM");
const pokemonInput = document.getElementById("pokemonInput");
const pokemonInputBox = document.getElementById("pokemonInputBox");
const pokemonAutoCompleteList = document.getElementById("pokemonAutoCompleteList");
const inventory = document.querySelector(".inventory");
const inventoryBtn = document.querySelector(".inventory-button");
const inventoryDetails = document.querySelector(".inventory-details");
const questionSymbol = document.querySelector(".question-symbol");
const questionSymbolDetails = document.getElementById("questionSymbolDetails");

let savedPokemons = [];
const allPokemonsArr = [];
const qPokemonToShow = 10;
const POKEMONSPERPAGE = 5;
let currentPage = 0;
let idCount = 0;
let pokemonCount = 0;

const pokemonColors = {
    electric: '#F7D02C',
    normal: '#A8A77A',
    fire: '#EE8130',
    grass: '#7AC74C',
    fighting: '#C22E28',
    water: '#6390F0',
    poison: '#A33EA1',
    ice: '#96D9D6',
    flying: '#A98FF3',
    ground: '#E2BF65',
    bug: '#A6B91A',
    psychic: '#F95587',
    dragon: '#6F35FC',
    rock: '#B6A136',
    ghost: '#735797',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD'
}

questionSymbol.addEventListener("click", () => questionSymbolDetails.classList.toggle("invisible"));

inventoryBtn.addEventListener("click", () => {
    inventoryDetails.classList.toggle("invisible");
});

/* Inventory Functions */
const removeFromInventory = (type) => {
    let id = document.getElementById(`${type.toLowerCase()}`);
    let idAux = Number(id.innerHTML) - 1;
    id.innerHTML = `${idAux}`;
}

const addToInventory = (types) => {
    for (let i = 0; i < types.length; i++) {
        let id = document.getElementById(`${types[i].type.name}`);
        let idAux = Number(id.innerHTML) + 1;
        id.innerHTML = `${idAux}`;
    }
}


/* Returns the first line of a string. */
const cutFirstLine = (string) => {
    let stringAux = '';

    for (let i = 0; i < string.length; i++) {
        if (string[i] != '\n') {
            stringAux = stringAux.concat(string[i]);
        } else {
            i = string.length;
        }
    }

    return stringAux;
}


const sortPokemons = (e) => {
    let items = listBox.childNodes;
    let itemsArr = [];

    for (let i in items) {
        if (items[i].className == 'pokemon-card') { // get rid of the whitespace text nodes
            itemsArr.push(items[i]);
        }
    }

    if (e.target.value == 'name') { //replace to name  

        itemsArr.sort((a, b) => {
            if (a.children[2].innerText < b.children[2].innerText) {                 //a is less than b by some ordering criterion
                return -1;
            }
            if (a.children[2].innerText > b.children[2].innerText) {               //a is greater than b by the ordering criterion
                return 1;
            }
            // a must be equal to b
            return 0;
        });

    } else if (e.target.value == 'id') {

        itemsArr.sort((a, b) => {
            if (a.id < b.id) {                 //a is less than b by some ordering criterion
                return -1;
            }
            if (a.id > b.id) {               //a is greater than b by the ordering criterion
                return 1;
            }
            // a must be equal to b
            return 0;
        });

    } else if (e.target.value == 'type') {

        itemsArr.sort((a, b) => {
            if (a.children[3].innerHTML < b.children[3].innerHTML) {                 //a is less than b by some ordering criterion
                return -1;
            }
            if (a.children[3].innerHTML > b.children[3].innerHTML) {               //a is greater than b by the ordering criterion
                return 1;
            }
            // a must be equal to b
            return 0;
        });

    }

    if (e.target.value == 'name' || e.target.value == 'id' || e.target.value == 'type') {
        for (let i = 0; i < itemsArr.length; ++i) {
            listBox.appendChild(itemsArr[i]);
        }
        refreshPage();
    }
}

const sortBtn = document.getElementById("sortBtn");
sortBtn.addEventListener('click', sortPokemons)

const showLocalStorage = () => {
    let pokemon;
    if (window.localStorage.length >= 2) {
        for (let i = 0; i < (window.localStorage.length); i++) {
            if (window.localStorage.key(i) != 'idAccumulator') {
                pokemon = JSON.parse(window.localStorage.getItem(`${window.localStorage.key(i)}`));
                addElement(pokemon, true);
            }
        }
    }
}

/* Get all pokemon types and append them to Inventory */
const fillInventory = () => {
    fetch("https://pokeapi.co/api/v2/type").then(response => response.json()).then(data => {
        for (let i = 0; i < data.count; i++) {
            let newElement = document.createElement("p");
            newElement.innerHTML = `Tipo ${data.results[i].name}:<strong id="${data.results[i].name}">0</strong>`;
            inventoryDetails.appendChild(newElement);
        }
        showLocalStorage();
    });
}

/* Set/Fill inventory and show pokemons from LOCAL STORAGE */
window.addEventListener('DOMContentLoaded', (e) => {
    fillInventory();
    refreshPage();
});


const chargePokemonNamesInArr = (allPokemonsObject) => {
    for (let i = 0; i < allPokemonsObject.count; i++) {
        allPokemonsArr[i] = allPokemonsObject.results[i].name;
    }
}

/* Request all Pokemon Names. */
fetch(`https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`)
    .then(response => response.json())
    .then(allPokemonsItems => {
        let allPokemonsObject = allPokemonsItems;
        chargePokemonNamesInArr(allPokemonsObject);
    });

const removeChildsFromNode = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    };
}

const addSelectedPokemon = (listId) => {
    let pokemon = {
        nameFetch: ``,
        name: ``,
    }
    pokemonInput.value = document.getElementById(listId).innerText;
    pokemon.nameFetch = document.getElementById(listId).innerText;
    pokemon.name = pokemon.nameFetch;
    addElement(pokemon, false);
}

/* INPUT LISTENERS *

/* AUTOCOMPLETE */
pokemonInput.addEventListener("keyup", () => {
    let idAcc = 1000000;
    let idAccAux = idAcc;
    if (pokemonInput.value == '') {
        removeChildsFromNode(pokemonAutoCompleteList);
    } else {
        removeChildsFromNode(pokemonAutoCompleteList);
        for (let i = 0; i < allPokemonsArr.length; i++) {
            if (allPokemonsArr[i].includes(pokemonInput.value.toLowerCase())) {
                let newLi = document.createElement("li");
                newLi.setAttribute("id", `${idAcc}`);
                newLi.setAttribute("class", `autocomplete-item`);
                newLi.setAttribute("onclick", `addSelectedPokemon('${idAcc}')`);
                newLi.innerText = `${allPokemonsArr[i]}`;
                pokemonAutoCompleteList.appendChild(newLi);
                idAcc++;
            }
            if (idAcc >= (qPokemonToShow + idAccAux)) {
                i = allPokemonsArr.length;
            }
        }
    }
});

pokemonInput.addEventListener("keyup", (e) => {
    if (e.key == "Enter") {
        let pokemon = {
            nameFetch: `${(e.target.value.toLowerCase())}`,
            name: `${e.target.value}`,
        }

        if (pokemon) {
            addElement(pokemon, false);
        } else {
            alert("Debe insertar el nombre de un pokemon para anadirlo a la lista.");
        }
    }
});


if (window.localStorage.getItem("idAccumulator") != null) {
    idCount = parseInt(window.localStorage.getItem("idAccumulator"));
}


const showCurrentPage = () => {
    let showCount = 0;

    let pokemonCollection = document.querySelectorAll(".pokemon-card");
    savedPokemons = [];
    for (let i = 0; i < pokemonCollection.length; i++) {
        savedPokemons.push(pokemonCollection[i]);
    }

    for (let i = (POKEMONSPERPAGE * currentPage); i < savedPokemons.length; i++) {
        if (showCount < POKEMONSPERPAGE) {
            savedPokemons[i].style.display = "flex";
            showCount++;
        } else {
            i = savedPokemons.length;
        }
    }

    if (pokemonCount % POKEMONSPERPAGE == 0) {
        if (pokemonCount >= POKEMONSPERPAGE) {
            lastPageDOM.innerHTML = `${Math.trunc(pokemonCount / POKEMONSPERPAGE)}`;
        } else {
            lastPageDOM.innerHTML = `${Math.trunc(pokemonCount / POKEMONSPERPAGE) + 1}`;
        }
        if ((currentPage >= Math.trunc(pokemonCount / POKEMONSPERPAGE) && currentPage > 0)) {
            currentPage--;
            refreshPage();
        }
    } else {
        lastPageDOM.innerHTML = `${Math.trunc(pokemonCount / POKEMONSPERPAGE) + 1}`;
    }
}

const refreshPage = () => {
    let pokemonCollection = document.querySelectorAll(".pokemon-card");
    for (let i = 0; i < pokemonCollection.length; i++) {
        pokemonCollection[i].style.display = "none";
    }
    currentPageDOM.innerHTML = `${currentPage + 1}`;
    showCurrentPage();
}



function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const animateInventory = () => {
    inventory.animate([
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px' },
        { transform: 'translateX(-3px)' },
        { transform: 'translateX(3px' },
        { transform: 'translateX(0)' },
    ], {
        duration: 800,
        iterations: 1,
    });
}

function eraseElement(idOfElement) {
    let elementToErase = document.getElementById(`${idOfElement}`);
    let pokemonCardTypes = elementToErase.childNodes[7].childNodes;

    /* Erase from Inventory */
    for (let i = 0; i < (pokemonCardTypes.length); i++) {
        if (pokemonCardTypes[i].className == 'list-pokemon-type flex-and-align') {
            removeFromInventory(pokemonCardTypes[i].innerHTML);
        }
    }

    /* Erase from DOM */
    elementToErase.remove();

    /* Erase from LocalStorage */
    window.localStorage.removeItem(`${idOfElement}`);
    if (window.localStorage.length <= 1) {
        idCount = 0;
        window.localStorage.clear();
    }

    pokemonCount--;
    refreshCountOfPokemon();
    showCurrentPage();
    animateInventory();
}

const setColor = (pokemonType) => {
    return pokemonColors[pokemonType];
}

const getPokemonID = (pokemon, fromStorage) => {
    if (fromStorage) {
        return pokemon.id;
    } else {
        return idCount;
    }
}

const errorHandler = (error) => {
    alert(
        `
            Ha ocurrido un error al añadir su pokemon.
            Codigo de Error: ${error}
        `
    );
}

const getPokemonType = (pokemonTypes) => {
    let str = '';

    for (let i = 0; i < pokemonTypes.length; i++) {
        str = str + `<div class="list-pokemon-type flex-and-align" style="color:${setColor(pokemonTypes[i].type.name)}">${capitalizeFirstLetter(pokemonTypes[i].type.name)}</div>`
    }

    return str;
}

const addToDOM = (pokemon, fromStorage, fetchData) => {
    const elementToAdd = document.createElement("div");
    elementToAdd.setAttribute("class", "pokemon-card");
    elementToAdd.setAttribute("id", `${getPokemonID(pokemon, fromStorage)}`);
    elementToAdd.style.display = "none";
    elementToAdd.style.backgroundColor = `${setColor(fetchData.types[0].type.name)}`;
    elementToAdd.innerHTML =
        `
            <span class="erase-btn" onclick="eraseElement('${getPokemonID(pokemon, fromStorage)}')"><i class="fa-solid fa-trash-can"></i></span>
            
            <div>
                <img src="${fetchData.sprites.front_default}" alt="${capitalizeFirstLetter(fetchData.name)}">
            </div>
            
            <p class="list-pokemon-name flex-and-align">
                ${capitalizeFirstLetter(fetchData.name)}
            </p>
            
            <div class="pokemon-types-box">
                ${getPokemonType(fetchData.types)}
            </div>
        `
        ;
    listBox.appendChild(elementToAdd);
}

const getPokemonFromAPI = (pokemon) => {
    let fetchPromise = fetch(`https://pokeapi.co/api/v2/pokemon/` + `${pokemon.nameFetch}`);
    return fetchPromise;
}

const addElement = (pokemon, fromStorage) => {
    const fetchPromise = getPokemonFromAPI(pokemon, fromStorage);

    fetchPromise.then((response) => response.json())
        .then((responseData) => {
            addToDOM(pokemon, fromStorage, responseData);
            if (!fromStorage) {
                let pokemonProperties = {
                    nameFetch: `${responseData.name}`,
                    name: `${capitalizeFirstLetter(pokemon.name)}`,
                    id: `${idCount}`,
                };
                window.localStorage.setItem(`${idCount}`, JSON.stringify(pokemonProperties));
                idCount++;
                window.localStorage.setItem("idAccumulator", `${idCount}`);
            } else {
                document.getElementById(pokemon.id).childNodes[5].innerHTML = pokemon.name;
            }
            pokemonCount++;
            refreshCountOfPokemon();
            showCurrentPage();
            addToInventory(responseData.types);
        }).catch((error) => errorHandler(error));
}

/* Event listeners / Event Handlers */

const changePokemonName = (e) => {
    let newName = prompt("Inserta un nuevo nombre");
    e.target.innerHTML = newName;
    let previous = JSON.parse(window.localStorage.getItem(e.target.parentNode.id));
    previous.name = newName;
    window.localStorage.setItem(`${e.target.parentNode.id}`, JSON.stringify(previous));
}

/* Doc Listener */
document.addEventListener("click", (e) => {

    if (e.target && e.target.className == "list-button flex-and-align") {
        pokemonInputBox.style.display = "flex";
        pokemonInput.focus();
    } else if ((e.target.id != "pokemonInput") && (e.target.id != "pokemonInputBox") && (e.target.className != "autocomplete-item")) {
        pokemonInputBox.style.display = "none";
        pokemonInput.value = "";
    }

    if (e.target && e.target.className == "list-pokemon-name flex-and-align") {
        changePokemonName(e);
    }

});

const pokemonFilter = (e) => {
    let pokemonArr = document.getElementsByClassName("pokemon-card");
    for (i = 0; i < pokemonArr.length; i++) {
        if (pokemonArr[i].children[2].innerText.toLowerCase().includes(e.target.value)) {
            pokemonArr[i].style.display = "flex";
        } else {
            pokemonArr[i].style.display = "none";
        }
    }

    if (e.target.value == '') {
        refreshPage();
    }
}

inputFilter.addEventListener("keyup", pokemonFilter);

const refreshCountOfPokemon = () => {
    pokemonCountDOM.innerText = `${pokemonCount}`;
}

const nextPage = document.getElementById("nextPageButton");
const previousPage = document.getElementById("previousPageButton");
const pageCountDOM = document.getElementById("pageCountDOM");
const currentPageDOM = document.querySelector(".current-page-count");
const lastPageDOM = document.querySelector(".last-page-count");

nextPage.addEventListener("click", () => {
    if (((POKEMONSPERPAGE * currentPage) + POKEMONSPERPAGE) < pokemonCount) {
        currentPage++;
        refreshPage();
    }
});

previousPage.addEventListener("click", () => {
    if (currentPage > 0) {
        currentPage--;
        refreshPage();
    }
});