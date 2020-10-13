function doTranslation() {
    // Get the setence in the slang box.
    var slangText = document.getElementById("slang").value;

    // If the slang box is empty, return
    if(!slangText) {
        document.getElementById("formal").value = null;
        return;
    }

    // Get the individual words of the setence in all lowercase.
    var tokens = tokenize(slangText);

    // This is only temporary
    // Set the text of the formal box to tokens on each line
    document.getElementById("formal").value = tokens[0];
    for(var i = 1; i < tokens.length; i++)
        document.getElementById("formal").value = document.getElementById("formal").value + "\n" + tokens[i];
    
}

/** 
 * @param str The string that will be tokenized.
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