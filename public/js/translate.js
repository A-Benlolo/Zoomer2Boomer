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

        // If the term is not in the dictionary, try to fetch the translation
        if(isEmpty(currQuery)) {
            currQuery = await scrapeDefinition(currTerm);
            // If the scrap was unsuccessful, add the to the unknown list and append the token
            if(!currQuery) {
                document.getElementById("unknownlist").innerHTML += currTerm + "<br/>";
                workingSentence += " " + tokens[i];
            }
            // Else, append the scrapped definition and add it to the translation list
            else {
                document.getElementById("translationlist").innerHTML += currTerm + " = " + currQuery + "*<br/>";
                workingSentence+= " " + currQuery;
                
                // If there is punctuation, add it
                if(currTerm != tokens[i])
                    workingSentence += tokens[i].charAt(tokens[i].length - 1);
            }
        }

        // If the term is in the dictionary, append the translation
        else {
            // If the term is slang, add it to the translation list
            if(`${currQuery[0].isSlang}` == 1) {
                document.getElementById("translationlist").innerHTML += currQuery[0].term + " = " + currQuery[0].translation + "<br/>";
                workingSentence += " " + currQuery[0].translation;

                // If there is punctuation, add it
                if(currTerm != tokens[i])
                    workingSentence += tokens[i].charAt(tokens[i].length - 1);
            }
            else
                workingSentence += " " + tokens[i];

        }
    }

    // Remove the first character of the final sentece, since it is a space
    workingSentence = workingSentence.substring(1);
    document.getElementById("formal").value = workingSentence;

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
        tokens[i] = tokens[i].replace("'", "\'")
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
