var generate = require("./generate");

/* prefer JSON config file at project root?  depend on NODE_ENV? */
module.exports.config = {
  cache_task_data: false
};

module.exports.taskData = function (args, callback) {
  // hints array
  const hintsRequested = getHintsRequested(args.task.hints_requested);
  const {publicData} = generateTaskData(
    args.task.params,
    args.task.random_seed,
    hintsRequested
  );
  callback(null, publicData);
};

module.exports.requestHint = function (args, callback) {
  const request = args.request;
  const hints_requested = args.task.hints_requested
    ? JSON.parse(args.task.hints_requested)
    : [];
  for (var hintRequest of hints_requested) {
    if (hintRequest === null) {
      /* XXX Happens, should not. */
      /* eslint-disable-next-line no-console */
      console.log("XXX", args.task.hints_requested);
      continue;
    }
    if (typeof hintRequest === "string") {
      hintRequest = JSON.parse(hintRequest);
    }
    if (hintRequestEqual(hintRequest, request)) {
      return callback(new Error("hint already requested"));
    }
  }
  callback(null, args.request);
};

module.exports.gradeAnswer = function (args, task_data, callback) {
  try {
    // hints array
    const hintsRequested = getHintsRequested(args.answer.hints_requested);

    const {
      publicData: {version, hints},
      privateData: {clearText}
    } = generateTaskData(
      args.task.params,
      args.task.random_seed,
      hintsRequested
    );

    const sumbittedText = JSON.parse(args.answer.value).clearText;

    const wrongMap = new Map();
    for (let iChar = 0; iChar < clearText.length; iChar += 1) {
      const correctCode = clearText.charCodeAt(iChar);
      const submittedCode = sumbittedText.charCodeAt(iChar);
      if (correctCode !== submittedCode && !wrongMap.has(correctCode)) {
        wrongMap.set(correctCode, submittedCode);
      }
    }
    const nErrors = wrongMap.size;
    const is_solution = nErrors <= 4;
    const feedback = is_solution ? nErrors : false;
    const highestPossibleScore = getHighestPossibleScore(version, hints);
    let score = is_solution ? highestPossibleScore * (1 - 0.25 * nErrors) : 0;
    score = score < 0 ? 0 : score;

    let message = "";
    if (feedback === 0) {
      message = " Votre réponse est exacte.";
    } else if (feedback > 0) {
      message = ` Votre réponse a ${feedback} erreur${
        feedback === 1 ? "" : "s"
      }.`;
    } else if (feedback === false) {
      message = " Votre réponse est incorrecte.";
    }

    callback(null, {
      score,
      message
    });
  } catch (error) {
    callback(error, null);
  }
};

/**
 * task methods
 */
function getHintsRequested (hints_requested) {
  return (hints_requested ? JSON.parse(hints_requested) : []).filter(
    hr => hr !== null
  );
}

function generateTaskData (params, random_seed, hintsRequested) {
  const {publicData, privateData} = generate(params, random_seed);
  const {cipherSubst, decipherSubst} = privateData;
  const hints = grantHints(cipherSubst, decipherSubst, hintsRequested);
  publicData.hints = hints;
  publicData.highestPossibleScore = getHighestPossibleScore(
    publicData.version,
    publicData.hints
  );
  return {publicData, privateData};
}

function hintRequestEqual (h1, h2) {
  return h1.rank === h2.rank && h1.source === h2.source;
}

function grantHints (cipherSubst, decipherSubst, hintRequests) {
  const hints = {};
  hintRequests.forEach(request => {
    const {rank, source} = request;
    switch (source) {
      case "cipher":
        hints[toCipherLetter(rank)] = toClearLetter(decipherSubst[rank]);
        break;
      case "clear":
        hints[toCipherLetter(cipherSubst[rank])] = toClearLetter(rank);
        break;
    }
  });

  return hints;
}

function getHighestPossibleScore (version, hints) {
  const maximumScore = version === 1 ? 150 : 100;
  const hintCost = 10;
  const nHints = Object.keys(hints).length;
  return Math.max(0, maximumScore - nHints * hintCost);
}

function toCipherLetter (rank) {
  return String.fromCharCode(65 + rank);
}

function toClearLetter (rank) {
  return String.fromCharCode(97 + rank);
}

// 100 - 10 * nIndices - 25 * nErreurs
