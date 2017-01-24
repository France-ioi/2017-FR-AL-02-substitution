
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
    task.hints[toLetter(rank)] = toLetter(decipherSubst[rank]);
    break;
  case 'clear':
    task.hints[toLetter(cipherSubst[rank])] = toLetter(rank);
    break;
  }
  task.highestPossibleScore = getHighestPossibleScore(task.version, task.hints);
  callback(null, {success: true, task: task});
};

function toLetter (rank) {
  return String.fromCharCode(65 + rank);
}

function getHighestPossibleScore (version, hints) {
  const maximumScore = version === 1 ? 150 : 100;
  const hintCost = 10;
  const nHints = Object.keys(hints).length;
  return Math.max(0, maximumScore - nHints * hintCost);
}
