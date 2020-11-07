async function doTranslation() {
    // Get the setence in the slang box.
    var slangText = document.getElementById("slang").value;

    // Clear the text in the formal box
    document.getElementById("formal").value = " ";

    // If the slang box is empty, return
    if(!slangText) {
        document.getElementById("formal").value = null;
        return;
    }

    // Get the individual words of the setence in all lowercase.
    var tokens = tokenize(slangText);

    // Put the first token into the formal box
    var response = await fetch('query/'+tokens[0]);
    var data = await response.json();
    if(!isEmpty(data))
        document.getElementById("formal").value = `${data[0].translation}`;
    else
        document.getElementById("formal").value = tokens[0];

    // Append the remaining tokens into the formal box
    for(var i = 1; i < tokens.length; i++) {
        response = await fetch('query/'+tokens[i]);
        data = await response.json();
        if(!isEmpty(data))
            document.getElementById("formal").value = document.getElementById("formal").value + " " + `${data[0].translation}`;
        else
            document.getElementById("formal").value = document.getElementById("formal").value + " " + tokens[i];
    }

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
        // Change all characters to lower case
        tokens[i] = tokens[i].toLowerCase();

        // Strip any punctuation
        tokens[i] = tokens[i].replace(/[^\w\s']|_/g, "");
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
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}