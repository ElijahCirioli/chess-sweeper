window.onload = () => {
	new Board(10, 10, { pawn: 12, rook: 6, knight: 8, king: 1, queen: 2, bishop: 4 });
};

document.oncontextmenu = (e) => {
	return false;
};
