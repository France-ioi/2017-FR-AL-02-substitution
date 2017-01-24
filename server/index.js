
const alkindiTaskServer = require('alkindi-task-lib/server');

alkindiTaskServer({
  webpackConfig: require('../webpack.config.js'),
  generate: require('./generate'),
  grantHint
});

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
};

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
