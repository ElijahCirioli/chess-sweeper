function getMoves(type, cell) {
	switch (type) {
		case "pawn":
			return getMovesPawn(cell);
		case "knight":
			return getMovesKnight(cell);
		case "bishop":
			return getMovesBishop(cell);
		case "rook":
			return getMovesRook(cell);
		case "queen":
			return getMovesQueen(cell);
		case "king":
			return getMovesKing(cell);
	}
	return [];
}

function getMineCount(cell) {}

function getMovesPawn(cell) {}

function getMovesKnight(cell) {}

function getMovesBishop(cell) {}

function getMovesRook(cell) {}

function getMovesQueen(cell) {}

function getMovesKing(cell) {}
