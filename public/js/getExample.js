let exampleEl = document.getElementById("example-slang");

getRandomSlang();

/**
 * Select a random slang term and set it as a suggestion for the user
 */
async function getRandomSlang() {
    var allSlang = await fetchAllSlang();
    var randomIndex = Math.floor(Math.random() * allSlang.length);
    exampleEl.innerHTML = "Not sure what to type? Try $"+allSlang[randomIndex].term+"$";
}

/**
 * Query the database for all slang terms.
 * 
 * @param {String} token The term to query for.
 * @returns The results of the query as a `JSON`.
 */
async function fetchAllSlang() {
    var response = await fetch('queryAllSlang/');
    var data = await response.json();
    
    return data;
}