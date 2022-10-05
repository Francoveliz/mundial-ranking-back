function getProbabilityOfWinning(rating1, rating2) {
	return (
		(1.0 * 1.0) /
		(1 + 1.0 * Math.pow(10, (1.0 * (rating1 - rating2)) / 400))
	);
}

function getEloRating({ winner, looser }) {
	const K = 32;
	const looserProbabilityOfWin = getProbabilityOfWinning(winner, looser);
	const winnerProbabilityOfWin = getProbabilityOfWinning(looser, winner);
	const winnerElo = Math.round(winner + K * (1 - winnerProbabilityOfWin));
	const looserElo = Math.round(looser + K * (0 - looserProbabilityOfWin));
	return [winnerElo, looserElo];
}

module.exports = getEloRating;
