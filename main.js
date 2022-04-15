/* References of Elements*/
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
const nextPageBtn = document.getElementById("nextPageButton");
const previousPageBtn = document.getElementById("previousPageButton");
const pageCountDOM = document.getElementById("pageCountDOM");
const currentPageDOM = document.querySelector(".current-page-count");
const lastPageDOM = document.querySelector(".last-page-count");
const sortBtn = document.getElementById("sortBtn");

/* Configuration */
const qPokemonToShow = 10;
const POKEMONSPERPAGE = 5;

/* Global variables */
let savedPokemons = [];
let currentPage = 0;
let idCount = 0;
let pokemonCount = 0;
const allPokemonsArr = [];

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

/* 
Process: Request all Pokemon Names and save them on the Array allPokemonsArr. 
*/
const getAllPokemons = () => {
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`)
        .then(response => response.json())
        .then(allPokemonsObject => {
            for (let i = 0; i < allPokemonsObject.count; i++) {
                allPokemonsArr[i] = allPokemonsObject.results[i].name;
            }
        });
}

getAllPokemons();


/* --------------------------------------------
                Inventory Functions
-----------------------------------------------*/
/* 
Receives: A pokemon type. 
Process: Substract one unit of the received type.
*/
const subtractFromInventory = (type) => {
    let id = document.getElementById(`${type.toLowerCase()}`);
    let idAux = Number(id.innerHTML) - 1;
    id.innerHTML = `${idAux}`;
}

/*
Receives: An Array of types or a type. 
Process: Add the types to inventory.
*/
const addToInventory = (types) => {
    for (let i = 0; i < types.length; i++) {
        let id = document.getElementById(`${types[i].type.name}`);
        let idAux = Number(id.innerHTML) + 1;
        id.innerHTML = `${idAux}`;
    }
}

/*
Receives: A string to cut. 
Returns: The first line of the string, before a jumpline. 
*/
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

/* 
Receives: The click event of the selected type of sort.
Process: Sorts and refresh all pages.
*/
const sortPokemons = (e) => {
    let items = listBox.childNodes;
    let itemsArr = [];

    for (let i in items) {
        if (items[i].className == 'pokemon-card') { // get rid of useless nodes
            itemsArr.push(items[i]);
        }
    }

    if (e.target.value == 'name') {

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

/* 
Process: Get all pokemons from local storage and append them to DOM.
*/
const showLocalStorage = () => {
    let pokemon;
    if (window.localStorage.length >= 2) {
        for (let i = 0; i < (window.localStorage.length); i++) {
            if (window.localStorage.key(i) != 'idAccumulator') {
                pokemon = JSON.parse(window.localStorage.getItem(`${window.localStorage.key(i)}`));
                addPokemon(pokemon, true);
            }
        }
    }
}

/* 
Process: Get all pokemon types from API and append them with value 0 to Inventory.
*/
const setInventory = () => {
    let fetchPromise = fetch("https://pokeapi.co/api/v2/type").then(response => response.json()).then(data => {
        for (let i = 0; i < data.count; i++) {
            let newElement = document.createElement("p");
            newElement.innerHTML = `Tipo ${data.results[i].name}:<strong id="${data.results[i].name}">0</strong>`;
            inventoryDetails.appendChild(newElement);

        }
    });

    return fetchPromise;
}

/* 
Receives: A node.
Process: Remove all the childs of a parent node.
*/
const removeChildsFromNode = (parent) => {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    };
}

/* 
Receives: ID of the clicked element on the autocompleted list. 
Process: Add clicked pokemon of the autocompleted list. 
*/
const addSelectedPokemon = (listId) => {
    let pokemon = {};
    pokemonInput.value = document.getElementById(listId).innerText;
    pokemon.nameFetch = document.getElementById(listId).innerText;
    pokemon.name = pokemon.nameFetch;
    addPokemon(pokemon, false);
}

/* Aux process of refreshPage */
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

/* 
Process: Main process to refresh the current page.
*/
const refreshPage = () => {
    let pokemonCollection = document.querySelectorAll(".pokemon-card");
    for (let i = 0; i < pokemonCollection.length; i++) {
        pokemonCollection[i].style.display = "none";
    }
    currentPageDOM.innerHTML = `${currentPage + 1}`;
    showCurrentPage();
}

/*
Process: Shakes the inventory when it's called.
*/
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

/* 
Receives: The ID of the element to erase.
Process: Erase the element of the specified ID and refresh the page.
*/
function eraseElement(idOfElement) {
    let elementToErase = document.getElementById(`${idOfElement}`);
    let pokemonCardTypes = elementToErase.childNodes[7].childNodes;

    /* Erase from Inventory */
    for (let i = 0; i < (pokemonCardTypes.length); i++) {
        if (pokemonCardTypes[i].className == 'list-pokemon-type flex-and-align') {
            subtractFromInventory(pokemonCardTypes[i].innerHTML);
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
    refreshPage();
    animateInventory();
}

/* 
Receives: A pokemon type.
Returns: The color for that type of pokemon.
*/
const setColor = (pokemonType) => {
    return pokemonColors[pokemonType];
}

/* 
Receives: A pokemon object and a boolean if it's from storage or not.
Returns: The corresponding ID for assigning to a pokemon.
*/
const assignPokemonID = (pokemon, fromStorage) => {
    if (fromStorage) {
        return pokemon.id;
    } else {
        return idCount;
    }
}

/* 
Process: Fires an error popup if a pokemon fetch gets failed.
*/
const errorHandler = (error) => {
    let texto = 
    `
    Asegurate de haber escrito un nombre o ID correcto.
    Codigo de error ->>> ${error}
    `;

    Swal.fire({
        title: '¡Ha ocurrido un error al añadir el pokemon!',
        text: texto,
        icon: 'error',
        confirmButtonText: 'OK'
    });
}

/* 
Receives: A string.
Returns: Same string with the first letter capitalized.
*/
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/* 
Receives: An array of pokemon types.
Returns: The HTML that must be shown on DOM.
*/
const getPokemonTypesHTML = (pokemonTypes) => {
    let str = '';

    for (let i = 0; i < pokemonTypes.length; i++) {
        str = str + `<div class="list-pokemon-type flex-and-align" style="color:${setColor(pokemonTypes[i].type.name)}">${capitalizeFirstLetter(pokemonTypes[i].type.name)}</div>`
    }

    return str;
}


/* 
Receives: +A pokemon object 
          +A boolean if it's from storage or not.
          +Whole fetch data of the pokemon from API.

Process: Sets the pokemon values and append it in the DOM.
*/
const addToDOM = (pokemon, fromStorage, fetchData) => {
    const elementToAdd = document.createElement("div");
    elementToAdd.setAttribute("class", "pokemon-card");
    elementToAdd.setAttribute("id", `${assignPokemonID(pokemon, fromStorage)}`);
    elementToAdd.style.display = "none";
    elementToAdd.style.backgroundColor = `${setColor(fetchData.types[0].type.name)}`;
    elementToAdd.innerHTML =
        `
            <span class="erase-btn" onclick="eraseElement('${assignPokemonID(pokemon, fromStorage)}')"><i class="fa-solid fa-trash-can"></i></span>
            
            <div>
                <img src="${fetchData.sprites.front_default}" alt="${capitalizeFirstLetter(fetchData.name)}">
            </div>
            
            <p class="list-pokemon-name flex-and-align">
                ${capitalizeFirstLetter(fetchData.name)}
            </p>
            
            <div class="pokemon-types-box">
                ${getPokemonTypesHTML(fetchData.types)}
            </div>
        `
        ;
    listBox.appendChild(elementToAdd);
}

/* 
Receives: A pokemon that will be getted from the API.
Returns: A promise that will have the information of the pokemon if it's fulfilled.
*/
const getPokemonFromAPI = (pokemon) => {
    let fetchPromise = fetch(`https://pokeapi.co/api/v2/pokemon/` + `${pokemon.nameFetch}`);
    return fetchPromise;
}


/* 
Receives: A pokemon and a boolean if it's from storage or not.
Process: Add the received pokemon and refresh the page.
*/
const addPokemon = (pokemon, fromStorage) => {
    const fetchPromise = getPokemonFromAPI(pokemon, fromStorage);

    fetchPromise.then((response) => response.json())
        .then((responseData) => {
            addToDOM(pokemon, fromStorage, responseData);
            if (!fromStorage) {
                let pokemonAux = {
                    nameFetch: `${responseData.name}`,
                    name: `${capitalizeFirstLetter(responseData.species.name)}`,
                    id: `${idCount}`,
                };
                window.localStorage.setItem(`${idCount}`, JSON.stringify(pokemonAux));
                idCount++;
                window.localStorage.setItem("idAccumulator", `${idCount}`);
            } else {
                document.getElementById(pokemon.id).childNodes[5].innerHTML = pokemon.name;
            }
            pokemonCount++;
            refreshCountOfPokemon();
            refreshPage();
            addToInventory(responseData.types);
        }).catch((error) => errorHandler(error));
}

/* --------------------------------------------
                EVENT HANDLERS
-----------------------------------------------*/

/* 
Fires an input to change the name of the clicked pokemon.
*/
async function changePokemonName (e) {
    const { value: newName }  = await Swal.fire({
        title: 'Inserta un nuevo nombre',
        input: 'text',
        inputLabel: 'Nuevo nombre',
        showCancelButton: true,
        inputAttributes: {
            autocomplete: 'off',
        },
        inputValidator: (value) => {
          if (!value) {
            return '¡Tienes que escribir algo!'
          }
        }
    });
    console.log(newName)
    if(newName != undefined){
        e.target.innerHTML = newName;
        let previous = JSON.parse(window.localStorage.getItem(e.target.parentNode.id));
        previous.name = newName;
        window.localStorage.setItem(`${e.target.parentNode.id}`, JSON.stringify(previous));
    }
}

/* 
Receives: A keyup event from input filter.
Process: Filter pokemons that match with the current input value.
*/
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

/* 
Process: Refresh the count of pokemons.
*/
const refreshCountOfPokemon = () => {
    pokemonCountDOM.innerText = `${pokemonCount}`;
}


/* 
Process: Moves to next page.
*/
const toNextPage = () => {
    if (((POKEMONSPERPAGE * currentPage) + POKEMONSPERPAGE) < pokemonCount) {
        currentPage++;
        refreshPage();
    }
}

/* 
Process: Moves to previous page.
*/
const toPreviousPage = () => {
    if (currentPage > 0) {
        currentPage--;
        refreshPage();
    }
}

/* 
Process: Shows a list of pokemons below the input that match with the current input value.
*/
const autoComplete = () => {
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
}

/* 
Process: Adds the pokemon written on input or a clicked one from autocomplete list.
*/
const addFromInput = (e) => {
    if (e.key == "Enter") {
        if(e.target.value != ''){
            let pokemon = {
                nameFetch: `${(e.target.value.toLowerCase())}`,
                name: `${e.target.value}`,
            }
            addPokemon(pokemon, false);
        }else{
            Swal.fire({
                title: 'Error!',
                text: '¡Debes insertar el nombre o ID de un pokemon para añadirlo a la lista!',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }
}

/* --------------------------------------------
                EVENT LISTENERS
-----------------------------------------------*/

nextPageBtn.addEventListener("click", () => toNextPage());

previousPageBtn.addEventListener("click", () => toPreviousPage());

inputFilter.addEventListener("keyup", pokemonFilter);

questionSymbol.addEventListener("click", () => questionSymbolDetails.classList.toggle("invisible"));

inventoryBtn.addEventListener("click", () => inventoryDetails.classList.toggle("invisible"));

sortBtn.addEventListener('click', sortPokemons);

pokemonInput.addEventListener("keyup", () => autoComplete());

pokemonInput.addEventListener("keyup", addFromInput);

/*
DOC LISTENER 
+Displays and hide input button.
+Fires changePokemonName process when a pokemon name it's clicked.
*/
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

/* Sets inventory and show pokemons from LOCAL STORAGE */
window.addEventListener('DOMContentLoaded', (e) => {
    if (window.localStorage.getItem("idAccumulator") != null) {
        idCount = parseInt(window.localStorage.getItem("idAccumulator"));
    }
    let inventorySetted = setInventory();
    inventorySetted.then(() => showLocalStorage());
    refreshPage();
});