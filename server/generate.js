
const seedrandom = require('seedrandom');
const shuffle = require('shuffle-array');
const range = require('node-range');

const sentences = require('./sentences');

module.exports = generate;

function generate (params, seed, callback) {
  const {version} = params;
  const rng = seedrandom(seed);
  const minLength = version === 1 ? 400 : 2000;
  const maxLength = minLength + 50;
  const cipherSubst = shuffle(range(0, 26).toArray(), {copy: true, rng: rng});
  const decipherSubst = inverseSubst(cipherSubst);
  const clearText = sentences.generate(rng, minLength, maxLength, version == 1).toLowerCase();
  const cipherText = applySubstitution(cipherSubst, clearText);
  const task = {version, cipherText, hints: {}};
  const full_task = {params, seed, clearText, cipherText, cipherSubst, decipherSubst};
  callback(null, {task, full_task});
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
