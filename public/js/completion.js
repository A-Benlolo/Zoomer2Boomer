const slangContainer = document.querySelector(".slang-container");
const slangTextArea = document.getElementById("slang");
const suggestionEl = document.querySelector(".suggestion-container");
  
var wordsArray;
let suggestedWord = "";
let suggestedWordsArray = [];
let currentWordIndex = 0;
let insertText = false;

slangTextArea.addEventListener("input", e => {
	// Ensure empty space was not added
	if (e.data != " ")
		insertText = true;
	else {
		suggestionEl.innerHTML = "";
		return;
	}

	if (insertText == false)
		slangTextArea.value = "";
 
	// Get the text in the box
	let inputValue = e.target.value;

	// Get the last word of the text
	let inputValueTokens = inputValue.match(/\S+/g) || [];
	let inputValueFinalToken = ""
	if(inputValueTokens.length != 0)
		inputValueFinalToken = (inputValueTokens[inputValueTokens.length - 1])

	// Get all potential completetions of the last word
	suggestedWordsArray = filterArray(wordsArray, inputValueFinalToken, true);

	// Get the first suggested word
	suggestedWord = suggestedWordsArray[0];
 
	// Construct the suggested sentence
	let suggestedSentence = "";
	for(var i = 0; i < inputValueTokens.length - 1; i++)
		suggestedSentence += inputValueTokens[i] + " ";
	suggestedSentence += suggestedWord;

	// Display the sentence with the suggested word
	if (suggestedWord != undefined) {
		suggestionEl.innerHTML = suggestedSentence;
	}
 
	// Do show anything in the input
	if (inputValue.length == 0 || suggestedWordsArray.length == 0) {
		suggestionEl.innerHTML = "";
	}
 
	// Restart the text area
	if (slangTextArea.value.length == 0) {
		insertText = false;
	}
});
 
slangTextArea.addEventListener("keydown", e => {
	// Complete the word by pressing tab
	if (suggestedWord != undefined && suggestedWord != "") {
		if (e.code == "Tab") {
			e.preventDefault();
			// Get deconstructed sentence
			let inputValueTokens = slangTextArea.value.match(/\S+/g) || [];

			// Construct the suggested sentence
			let suggestedSentence = "";
				for(var i = 0; i < inputValueTokens.length - 1; i++)
					suggestedSentence += inputValueTokens[i] + " ";
			suggestedSentence += suggestedWord;

			// Apply the constructed sentence
			slangTextArea.value = suggestedSentence;
			suggestionEl.innerHTML = "";
		}
	}
});

fetchAllTerms()

function filterArray(array, item, reverse = false) {
	if (reverse) {
		return array
		.filter(word => compareTwoStrings(word, item))
		.sort((a, b) => a.length - b.length);
	} else {
		return array
		.filter(word => compareTwoStrings(word, item))
		.sort((a, b) => b.length - a.length);
	}
}
 
function compareTwoStrings(string, subString) {
	let temp = string.split("", subString.length).join("");
	if (subString == temp) return subString;
}

/**
 * Get all the terms from the database by using cheeky SQL injection
 * 
 * @returns An array of all terms in the dabase.
 */
async function fetchAllTerms() {
    var response = await fetch('queryAll');
    var data = await response.json();
    var allTerms = []
    for(var i = 0; i < data.length; i++)
        allTerms[i] = data[i].term;
	
	wordsArray = allTerms;
}