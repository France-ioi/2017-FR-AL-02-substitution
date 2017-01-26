
const seedrandom = require('seedrandom');
const shuffle = require('shuffle-array');
const range = require('node-range');

const dictionary = require('./words');
const sentences = require('./sentences');

module.exports = generate;

function generate (params, seed, callback) {
  const {version} = params;
  const rng = seedrandom(seed);
  const minLength = version === 1 ? 400 : 2000;
  const maxLength = minLength + 50;
  const cipherSubst = shuffle(range(0, 26).toArray(), {copy: true, rng: rng});
  const decipherSubst = inverseSubst(cipherSubst);
  const clearText = genTextFromSentences(rng, minLength, maxLength, version == 1).toLowerCase();
  const cipherText = applySubstitution(cipherSubst, clearText);
  const task = {version, cipherText, hints: {}};
  const full_task = {params, seed, clearText, cipherText, cipherSubst, decipherSubst};
  callback(null, {task, full_task});
}

function cleanUpSpecialChars(str, withSpaces) {
    str = str.replace(/[ÀÁÂÃÄÅ]/g,"A");
    str = str.replace(/[àáâãäå]/g,"a");
    str = str.replace(/[ÈÉÊË]/g,"E");
    str = str.replace(/[èéêë]/g,"e");
    str = str.replace(/[îï]/g,"i");
    str = str.replace(/[ôö]/g,"o");
    str = str.replace(/[ùüû]/g,"u");
    str = str.replace(/[Ç]/g,"C");
    str = str.replace(/[ç]/g,"c");
    str = str.replace(/['-]/g," ");
    str = str.replace(/[^a-zA-Z ]/gi,''); // final clean up
    if (!withSpaces) {
       str = str.replace(/[ ]/g,"");
    }
    return str.toUpperCase();
}

function genTextFromSentences(rng, minLength, maxLength, withSpaces) {
   var curLength = 0;
   var text = "";
   while (curLength < maxLength - 50) {
      var iSentence = Math.trunc(rng() * sentences.length);
      var sentence = cleanUpSpecialChars(sentences[iSentence], withSpaces);
      if (sentence.length > (maxLength - curLength - 20)) {
         continue;
      }
      text += sentence;
      if (withSpaces) {
         text += " ";
      }
      curLength += sentence.length;
   }
   var iLastSentence = Math.trunc(rng() * sentences.length);
   for (var iDelta = 0; iDelta < sentences.length; iDelta++) {
      var iSentence = (iLastSentence + iDelta) % sentences.length;
      var sentence = cleanUpSpecialChars(sentences[iSentence], withSpaces);
      var newLength = curLength + sentence.length;
      if ((newLength >= minLength) && (newLength <= maxLength)) {
         text += sentence;
         return text;
      }
   }
   console.log("Error : unable to generate sentences of correct length");
   return text;
}

function generateRandomText (rng, maxWords, separator) {
  const minLength = dictionary[0][0].length;
  const maxLength = dictionary[dictionary.length - 1][0].length;
  const words = [];
  while (words.length < maxWords) {
    const groupIndex = Math.trunc(rng() * (maxLength - minLength + 1));
    const groupWords = dictionary[groupIndex];
    const word = groupWords[Math.trunc(rng() * (groupWords.length + 1))];
    words.push(word);
  }
  return words.join(separator);
}

function applySubstitution (subst, clearText) {
  const cipher = [];
  for (let iLetter = 0; iLetter < clearText.length; iLetter++) {
    const charIndex = clearText.charCodeAt(iLetter) - 97;
    if (charIndex < 0 || charIndex >= 26) {
      cipher.push(clearText.charAt(iLetter));
    } else {
      cipher.push(String.fromCharCode(65 + subst[charIndex]));
    }
  }
  return cipher.join('');
}

function inverseSubst (subst) {
  const result = subst.slice();
  subst.forEach(function (j, i) {
    result[j] = i;
  });
  return result;
}

// Run this module directly with node to test it.
if (require.main === module) {
   generate({version: 1}, 42, function (err, result) {
      if (err) throw err;
      console.log(result);
   });
}
