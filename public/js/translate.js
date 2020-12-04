var wordList = fetchAllTerms();

/**
 * Translate the contents of the slang text area and put it in the formal text area
 */
async function doTranslation() {
    // Get the setence in the slang box.
    var slangText = document.getElementById("slang").value;

    // Clear the text in the formal box and translation list
    reset();

    // If the slang box is empty, return
    if(!slangText)
        return;

    // Get the individual words of the setence in all lowercase.
    var tokens = tokenize(slangText);

    // Form the translated sentence
    var currQuery, workingSentence = "", currTerm;;
    for(var i = 0; i < tokens.length; i++) {
        // Create a clean version of the current term
        currTerm = tokens[i].toLowerCase().replace(/[^\w\s']|_/g, "");

        // If the current term was all special characters, continue
        if(!currTerm)
            continue;

        // Fetch the query of the current term
        currQuery = await fetchQuery(currTerm);

        // If the term is requested to be defined as slang
        if(tokens[i].startsWith('$') && tokens[i].replace(/(~|`|!|@|#|$|%|^|&|\*|\(|\)|{|}|\[|\]|;|:|\"|'|<|,|\.|>|\?|\/|\\|\||-|_|\+|=)/g,"").endsWith('$'))
            workingSentence = await forceSlangDefinition(tokens[i], currTerm, workingSentence, currQuery);

        // If the term is not in the dictionary, try to fetch the translation
        else if(isEmpty(currQuery)) {
            currQuery = await scrapeDefinition(currTerm);

            // If the scrap was unsuccessful, add the to the unknown list and append the token
            if(!currQuery) {
                updatedUnknownList(currTerm);
                workingSentence = workingSentence.concat(" ", tokens[i]);
            }
            // Else, append the scrapped definition and add it to the translation list
            else {
                updateTranslationList(currTerm, currQuery, true);
                workingSentence = workingSentence.concat(" ", currQuery);
                workingSentence = addPunctuation(workingSentence, tokens[i], currTerm);
            }
        }

        // If the term is in the dictionary, append the translation
        else {
            // If the term is slang, add it to the translation list
            if(`${currQuery[0].isSlang}` == 1) {
                updateTranslationList(currQuery[0].term, currQuery[0].translation, false);
                workingSentence = workingSentence.concat(" ", currQuery[0].translation);
                workingSentence = addPunctuation(workingSentence, tokens[i], currTerm);
            }
            else
                workingSentence += " " + tokens[i];

        }

        // Set the working sentence to the formal text
        if(workingSentence.startsWith(" "))
            workingSentence = workingSentence.substring(1);
        document.getElementById("formal").value = workingSentence;
    }

    // Add the disclaimer if UrbanDictionary translations were used
    if(document.getElementById("translationlist").innerHTML.includes("*"))
        document.getElementById("translationlist").innerHTML += "<br/>Definitions with * were fetched <br/> from UrbanDictionary <br/>";
}

/**
 * Clear the text in the formal box and translation list
 */
function reset() {
    document.getElementById("formal").value = "";
    document.getElementById("translationlist").textContent = null;
    document.getElementById("unknownlist").textContent = null;
}

/** 
 * @param {string} str The string that will be tokenized.
 * @returns A `String[]` of all words in lowercase.
 */
function tokenize(str) {
    // Split the sentence 
    var tokens = str.match(/\S+/g) || [];

    // For each word in the setence...
    for(var i = 0; i < tokens.length; i++) {
        // Sanitize the input to prevent sql injection
        tokens[i] = tokens[i].replace(/\"/g, "");
        tokens[i] = tokens[i].replace(/\'/g, "");
        tokens[i] = tokens[i].replace(/\`/g, "");
    }

    return tokens;
}

/**
 * Determines if a JSON object is empty
 * 
 * @param {JSON} obj The JSON being checked.
 * @returns Whether or not the JSON object is empty
 */
function isEmpty(obj) {
    for(var prop in obj)
        if(obj.hasOwnProperty(prop))
            return false;

    return true;
}

/**
 * Query the database for some term.
 * 
 * @param {String} token The term to query for.
 * @returns The results of the query as a `JSON`.
 */
async function fetchQuery(token) {
    var response = await fetch('query/'+token);
    var data = await response.json();
    
    return data;
}

async function fetchAllTerms() {
    var response = await fetch('query/" OR 1=1 -- c');
    var data = await response.json();
    var allTerms = {}
    for(var i = 0; i < data.length; i++)
        allTerms[i] = data[i].translation;
    
    return allTerms;
}

/**
 * Scrape a defintion of a term from UrbanDictionary
 * 
 * @param {String} term The term to autodefine.
 * 
 * @returns The scrapped definition of term, or null if none was found
 */
async function scrapeDefinition(term) {
    // Probably some fetch
    var response = await fetch('scrape/'+term);
    var data = await response.text();

    // Return the definition
    return data;
}

/**
 * Update the translations list to include a new translation.
 * 
 * @param {String} term The word being translated.
 * @param {String} translation The translation of term.
 * @param {boolean} isScraped If the translation was scraped from UrbanDictionary.
 */
function updateTranslationList(term, translation, isScraped) {
    if(isScraped)
        document.getElementById("translationlist").innerHTML += term + " = " + translation + "*<br/>";
    else
        document.getElementById("translationlist").innerHTML += term + " = " + translation + "<br/>";
}

/**
 * Update the unknown list to include a new term.
 * 
 * @param {String} term The unknown term.
 */
function updatedUnknownList(term) {
    document.getElementById("unknownlist").innerHTML += term + "<br/>";
}

/**
 * Add punctuation to the end of a sentence if it was originally there.
 * 
 * @param {string} sentence The translated sentence.
 * @param {string} original The term before sanitization.
 * @param {string} updated The term after sanitization.
 * 
 * @returns {string} The updated sentence.
 */
function addPunctuation(sentence, original, updated) {
    if(updated != original.toLowerCase() && !original.endsWith("$"))
        return (sentence + original.charAt(original.length - 1));
    return sentence;
}

/**
 * Force the slang definition of a term.
 * 
 * @param {string} original The term before sanitization.
 * @param {string} updated The term after sanitization.
 * @param {string} sentence The translated sentence
 * @param {JSON} query The JSON array from a query
 * 
 * @returns The updated sentence.
 */
async function forceSlangDefinition(original, updated, sentence, query) {
    // Keep track of if a definition has been found
    var foundDef = false;

    // Check the database
    if(!isEmpty(query)) {
        // Check for a saved slang definition
        for(var j = 0; j < query.length; j++) {
            foundDef = (`${query[j].isSlang}` == 1);
            if(foundDef) {
                updateTranslationList(query[j].term, query[j].translation, false);
                sentence = sentence.concat(" ", query[j].translation);
                sentence = addPunctuation(sentence, original, updated);
                break;
            }
        }
    }

    // Check for a scraped definition
    if(!foundDef) {
        query = await scrapeDefinition(updated);
        
        // If the scrap was unsuccessful, add the to the unknown list and append the token
        if(!query) {
            updatedUnknownList(updated);
            sentence = sentence.concat(" ", updated);
        }
        // Else, append the scrapped definition and add it to the translation list
        else {
            updateTranslationList(updated, query, true);
            sentence = sentence.concat(" ", query);
            sentence = addPunctuation(sentence, original, updated);
        }
    }

    return sentence;
}