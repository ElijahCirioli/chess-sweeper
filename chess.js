function getMoves(type, cell) {
	switch (type) {
		case "pawn":
			return getMovesPawn(cell);
		case "knight":
			return getMovesKnight(cell);
		case "bishop":
			return getMovesBishop(cell, false);
		case "rook":
			return getMovesRook(cell, false);
		case "queen":
			return getMovesQueen(cell, false);
		case "king":
			return getMovesKing(cell);
	}
	return [];
}

function getMineCount(cell) {
	return getCount(cell, "hasMine");
}

function getFlagCount(cell) {
	return getCount(cell, "hasFlag");
}

function getVisibleMoves(cell) {
	switch (cell.getPiece()) {
		case "pawn":
			return getMovesPawn(cell);
		case "knight":
			return getMovesKnight(cell);
		case "bishop":
			return getMovesBishop(cell, true);
		case "rook":
			return getMovesRook(cell, true);
		case "queen":
			return getMovesQueen(cell, true);
		case "king":
			return getMovesKing(cell);
	}
	return [];
}

function getCount(cell, stopFunction) {
	if (!cell.hasPiece()) {
		return 0;
	}

	const type = cell.getPiece();
	if (type === "pawn" || type === "knight" || type === "king") {
		let count = 0;
		const moves = getMoves(type, cell);
		for (const m of moves) {
			if (board[m.y][m.x][stopFunction]()) {
				count++;
			}
		}
		return count;
	}

	switch (type) {
		case "bishop":
			return getCountBishop(cell, stopFunction);
		case "rook":
			return getCountRook(cell, stopFunction);
		case "queen":
			return getCountQueen(cell, stopFunction);
	}
	return 0;
}

function canMove(x, y) {
	if (x < 0 || x >= board.length) {
		return false;
	}
	if (y < 0 || y >= board.length) {
		return false;
	}
	return !board[y][x].hasPiece();
}

function getLineMoves(moves, x, y, xDir, yDir, stopOnFlag) {
	for (let i = 1; true; i++) {
		const m = { x: x + i * xDir, y: y + i * yDir };
		if (canMove(m.x, m.y)) {
			if (stopOnFlag && board[m.y][m.x].hasFlag()) {
				return;
			}
			moves.push(m);
		} else {
			return;
		}
	}
}

function getMovesPawn(cell) {
	const moves = [];
	for (let xOffset = -1; xOffset <= 1; xOffset += 2) {
		for (let yOffset = -1; yOffset <= 1; yOffset += 2) {
			const m = { x: cell.getX() + xOffset, y: cell.getY() + yOffset };
			if (canMove(m.x, m.y)) {
				moves.push(m);
			}
		}
	}
	return moves;
}

function getMovesKnight(cell) {
	const moves = [];
	for (let xOffset = -2; xOffset <= 2; xOffset++) {
		for (let yOffset = -2; yOffset <= 2; yOffset++) {
			if (Math.abs(xOffset) + Math.abs(yOffset) === 3) {
				const m = { x: cell.getX() + xOffset, y: cell.getY() + yOffset };
				if (canMove(m.x, m.y)) {
					moves.push(m);
				}
			}
		}
	}
	return moves;
}

function getMovesBishop(cell, stopOnFlag) {
	const moves = [];
	getLineMoves(moves, cell.getX(), cell.getY(), 1, 1, stopOnFlag);
	getLineMoves(moves, cell.getX(), cell.getY(), 1, -1, stopOnFlag);
	getLineMoves(moves, cell.getX(), cell.getY(), -1, 1, stopOnFlag);
	getLineMoves(moves, cell.getX(), cell.getY(), -1, -1, stopOnFlag);
	return moves;
}

function getMovesRook(cell, stopOnFlag) {
	const moves = [];
	getLineMoves(moves, cell.getX(), cell.getY(), 0, 1, stopOnFlag);
	getLineMoves(moves, cell.getX(), cell.getY(), 0, -1, stopOnFlag);
	getLineMoves(moves, cell.getX(), cell.getY(), 1, 0, stopOnFlag);
	getLineMoves(moves, cell.getX(), cell.getY(), -1, 0, stopOnFlag);
	return moves;
}

function getMovesQueen(cell, stopOnFlag) {
	return getMovesRook(cell, stopOnFlag).concat(getMovesBishop(cell, stopOnFlag));
}

function getMovesKing(cell) {
	const moves = [];
	for (let xOffset = -1; xOffset <= 1; xOffset++) {
		for (let yOffset = -1; yOffset <= 1; yOffset++) {
			if (xOffset === 0 && yOffset === 0) {
				continue;
			}
			const m = { x: cell.getX() + xOffset, y: cell.getY() + yOffset };
			if (canMove(m.x, m.y)) {
				moves.push(m);
			}
		}
	}
	return moves;
}

function getCountBishop(cell, stopFunction) {
	let count = 0;
	for (let xDir = -1; xDir <= 1; xDir += 2) {
		for (let yDir = -1; yDir <= 1; yDir += 2) {
			const moves = [];
			getLineMoves(moves, cell.getX(), cell.getY(), xDir, yDir, false);
			for (const m of moves) {
				if (board[m.y][m.x][stopFunction]()) {
					count++;
					break;
				}
			}
		}
	}
	return count;
}

function getCountRook(cell, stopFunction) {
	let count = 0;
	for (let xDir = -1; xDir <= 1; xDir++) {
		for (let yDir = -1; yDir <= 1; yDir++) {
			if ((xDir !== 0 && yDir !== 0) || (xDir === 0 && yDir === 0)) {
				continue;
			}

			const moves = [];
			getLineMoves(moves, cell.getX(), cell.getY(), xDir, yDir, false);
			for (const m of moves) {
				if (board[m.y][m.x][stopFunction]()) {
					count++;
					break;
				}
			}
		}
	}
	return count;
}

function getCountQueen(cell, stopFunction) {
	return getCountBishop(cell, stopFunction) + getCountRook(cell, stopFunction);
}
