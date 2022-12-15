let explosionRunning = false;
let explosionParticles = [];

class ExplosionParticle {
	constructor(x, y, energy, explosionRadius) {
		this.x = x; // the x position of this particle
		this.y = y; // the y position of this particle

		const angle = Math.random() * 2 * Math.PI;
		const speed = (energy * explosionRadius) / 50 + Math.random() * 0.4 + 0.5;
		this.velX = speed * Math.cos(angle); // the x velocity of this particle
		this.velY = speed * Math.sin(angle); // the y velocity of this particle
		this.radius = Math.ceil((1 - energy) * 16) + 4; // the radius of this particle
		this.life = (1 - energy) * 60 + 30; // how many frames this particle will live for

		// set the particle color based on its energy
		if (energy < 0.2) {
			this.color = "#757068";
		} else if (energy < 0.4) {
			this.color = "#d94a3b";
		} else if (energy < 0.6) {
			this.color = "#e66f25";
		} else if (energy < 0.9) {
			this.color = "#d48817";
		} else if (energy < 0.98) {
			this.color = "#ebb73f";
		} else {
			this.color = "#ebc878";
		}
	}

	draw(context) {
		context.fillStyle = this.color;
		if (this.life > 20) {
			context.globalAlpha = 1;
		} else {
			context.globalAlpha = this.life / 20;
		}
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 7);
		context.fill();
	}

	move() {
		this.x += this.velX;
		this.y += this.velY;

		this.velX *= 0.97;
		this.velY *= 0.97;
	}
}

function createExplosion(cellX, cellY, radius) {
	const cellSize = $("#board").width() / board.length;
	const x = (cellX + 0.5) * cellSize + 10;
	const y = (cellY + 0.5) * cellSize + 10;
	const numParticles = 80;

	for (let i = 1; i <= numParticles; i++) {
		const energy = Math.min(1, Math.max(0, Math.sqrt(i / numParticles) + Math.random() * 0.2 - 0.1));
		explosionParticles.push(
			new ExplosionParticle(x + Math.random() * 10 - 5, y + Math.random() * 10 - 5, energy, radius)
		);
	}

	if (!explosionRunning) {
		explosionRunning = true;
		requestAnimationFrame(updateExplosion);
	}
}

function updateExplosion() {
	const canvas = $("#explosion-canvas")[0];
	const context = canvas.getContext("2d");

	context.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < explosionParticles.length; i++) {
		const p = explosionParticles[i];
		p.draw(context);
		p.move();

		// check if the particle has died
		p.life--;
		if (p.life <= 0) {
			explosionParticles.splice(i, 1);
			i--;
		}
	}

	// keep simulating if there are particles remaining
	if (explosionParticles.length > 0) {
		requestAnimationFrame(updateExplosion);
	} else {
		context.clearRect(0, 0, canvas.width, canvas.height);
		explosionRunning = false;
	}
}
