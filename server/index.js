
const express = require('express');
const path = require('path');
const alkindiTaskServer = require('alkindi-task-lib/server');

alkindiTaskServer({
  webpackConfig: require('../webpack.config.js'),
  generate: require('./generate'),
  gradeAnswer,
  grantHint,
  serverHook: function (app) {
    app.use('/images', express.static(path.resolve(path.dirname(__dirname), 'images')));
  }
});

function gradeAnswer (full_task, task, answer, callback) {
  const {clearText} = full_task;
  const sumbittedText = answer.clearText;
  const wrongMap = new Map();
  for (let iChar = 0; iChar < clearText.length; iChar += 1) {
    const correctCode = clearText.charCodeAt(iChar);
    const submittedCode = sumbittedText.charCodeAt(iChar);
    if (correctCode !== submittedCode && !wrongMap.has(correctCode)) {
      wrongMap.set(correctCode, submittedCode);
    }
  }
  const nErrors = wrongMap.size;
  const is_full_solution = nErrors === 0;
  const is_solution = nErrors <= 4;
  const feedback = is_solution ? nErrors : false;
  const highestPossibleScore = getHighestPossibleScore(task.version, task.hints);
  const score = is_solution ? highestPossibleScore * (1 - 0.25 * nErrors) : 0;
  callback(null, {
    success: true, feedback, score, is_solution, is_full_solution
  });
}

function grantHint (full_task, task, query, callback) {
  const {rank, source} = query;
  const {cipherSubst, decipherSubst} = full_task;
  switch (source) {
  case 'cipher':
    task.hints[toCipherLetter(rank)] = toClearLetter(decipherSubst[rank]);
    break;
  case 'clear':
    task.hints[toCipherLetter(cipherSubst[rank])] = toClearLetter(rank);
    break;
  }
  task.highestPossibleScore = getHighestPossibleScore(task.version, task.hints);
  callback(null, {success: true, task: task});
}

function toCipherLetter (rank) {
  return String.fromCharCode(65 + rank);
}
function toClearLetter (rank) {
  return String.fromCharCode(97 + rank);
}

function getHighestPossibleScore (version, hints) {
  const maximumScore = version === 1 ? 150 : 100;
  const hintCost = 10;
  const nHints = Object.keys(hints).length;
  return Math.max(0, maximumScore - nHints * hintCost);
}

// 100 - 10 * nIndices - 25 * nErreurs
