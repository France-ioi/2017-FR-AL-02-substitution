
const seedrandom = require('seedrandom');
const shuffle = require('shuffle-array');
const range = require('node-range');

const dictionary = require('./words');

module.exports = generate;

function generate (params, seed, callback) {
  const {version} = params;
  const rng = seedrandom(seed);
  const maxWords = 400;
  const cipherSubst = shuffle(range(0, 26).toArray(), {copy: true, rng: rng});
  const decipherSubst = inverseSubst(cipherSubst);
  const clearText = generateRandomText(rng, maxWords, version === 1 ? ' ' : '').toLowerCase();
  const cipherText = applySubstitution(cipherSubst, clearText);
  const task = {version, cipherText, hints: {}};
  const full_task = {params, seed, clearText, cipherText, cipherSubst, decipherSubst};
  callback(null, {task, full_task});
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
    const charIndex = clearText.charCodeAt(iLetter) - 65;
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
