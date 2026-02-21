const { createCanvas, loadImage } = require('canvas');
const { writeFileSync, existsSync, readFileSync } = require('node:fs');

const loadSaves = () => {
	if (!existsSync('./saves.json')) {
		writeFileSync('./saves.json', '{}');
		return {};
	}
	return JSON.parse(readFileSync('./saves.json'));
}
const dumpAs = (array, name) => {
	const values = loadSaves();
	values[name] = array;
	writeFileSync('./saves.json', JSON.stringify(values, null, 0));
}

const main = async() => {
	const image = await loadImage('board.jpg');
	
	const canvas = createCanvas(image.width, image.height);
	const ctx = canvas.getContext("2d");

	const array = [];

	const draw_point = (x, y, color) => {
		const dx = 174;
		const dy = 65;
		const size = 95;

		const posX = dx + x * size;
		const posY = dy + y * size;
		const radius = 25;

		if (color === 'white') {
			ctx.fillStyle = 'white';
		} else {
			ctx.fillStyle = 'black';
		}

		ctx.beginPath();
		ctx.arc(posX, posY, radius, 0, 2 * Math.PI);
		ctx.fill();
		ctx.lineWidth = 4;
		ctx.strokeStyle = "gray";
		ctx.stroke();
		ctx.closePath();
	}
	const draw_image = () => {
		array.forEach((el) => draw_point(el[0], el[1], el[2]));
	}
	const draw = (x, y, color) => {
		if (array.find(s => s[0] == x && s[1] == y && s[2] == color)) return false;
		array.push([x, y, color]);
	}
	const remove = (x, y, color) => {
		const i = array.findIndex(s => s[0] == x && s[1] == y && s[2] == (color == "w" ? "white" : "black"));
		if (i == -1) return false;

		array.splice(i, 1);
		return true;
	}
	const default_config = () => {
		let i = 0;
		while (i < 8) {
			let j = 0;
			while (j < 8) {
				if ((i + j) % 2 == 1) {
					if (j < 3) {
						draw(i, j, 'black');
					} else if (j >= 5) {
						draw(i, j, 'white');
					}
				}
				j++;
			}
			i++;
		}
	}
	const preview = () => {
		let k = 0;
		process.stdout.write("\x1b[90m    ");
		while (k++ < 8) process.stdout.write(`${k - 1}   `);
		process.stdout.write("\x1b[0m\n");

		const head = ((str) => {
			return "  ╔" + str.slice(1) + "╗";
		})(new Array(8).fill("╦═══").join(""));
		const tail = ((str) => {
			return "  ╚" + str.slice(1) + "╝";
		})(new Array(8).fill("╩═══").join(""));
		const splitter = ((str) => {
			return "  ╠" + str.slice(1) + "╣";
		})(new Array(8).fill("╬═══").join(""));
		console.log(head);

		let i = 0;
		while (i < 8) {
			let j = 0;

			if (i > 0) console.log(splitter);
			process.stdout.write(`\x1b[90m${i} \x1b[0m`);
			while (j < 8) {
				const pawn = array.find(x => x[0] == j && x[1] == i);

				if (!pawn) process.stdout.write("║   ");
				else process.stdout.write(`║ ${pawn[2] == "white" ? "W" : "B"} `);

				j++;
			}
			process.stdout.write("║\n");
			i++;
		}
		console.log(tail);
	}

	ctx.drawImage(image, 0, 0, image.width, image.height);

	const regex = /(?<remove>(r?))(?<x>\d)(?<y>\d)(?<col>(w|b))/i;

	process.stdout.write("> ");
	process.stdin.on('data', (data) => {
		const text = data.toString().trim();

		if (text == "default") {
			default_config();
			console.log("Added \x1b[32mdefault config\x1b[0m");
		}
		if (text == "preview") preview();

		if (text == "exit") process.exit(1);
		if (text == "clear") console.clear();
		if (text == "push") {
			draw_image();
			console.log(`\x1b[32m Added \x1b[33m${array.length}\x1b[32m points\x1b[0m`);
		}
		if (text.startsWith('dump ')) {
			const name = text.slice('dump '.length);
			dumpAs(array, name);

			console.log(`Dumped config as \x1b[91m${name}\x1b[0m`);
		}
		if (text.startsWith('load ')) {
			const name = text.slice('load '.length);
			const save = loadSaves()[name];

			if (!save) {
				console.log(`\x1b[31mCannot find \x1b[33m${name}\x1b[0m`);
			} else {
				array.splice(0, array.length);
				save.forEach(x => {
					draw(x[0], x[1], x[2])
				});

				console.log(`\x1b[32mLoaded \x1b[33m${array.length}\x1b[32m elements from \x1b[91m${name}\x1b[0m`);
			}
		}
		if (text == 'save') {
			writeFileSync("output.jpg", Buffer.from(canvas.toBuffer()))
			process.exit(0);
		}

		text.split(/ +/g).forEach((spl, index) => {
			const res = regex.exec(spl);

			if (!res) return;
			const x = res.groups.x;
			const y = res.groups.y;
			const col = res.groups.col;
			const rm = !!res.groups.remove;

			if (x < 0 || x >= 8) return console.log(`Skipping \x1b[33m${index}\x1b[0m for the x`);
			if (y < 0 || y >= 8) return console.log(`Skipping \x1b[33m${index}\x1b[0m for the y`);
			if (col != "w" && col != "b") return console.log(`Skipping \x1b[33m${index}\x1b[0m for the color`);

			if (rm) {
				if (!remove(x, y, col)) console.log(`\x1b[33m${index}\x1b[0m not removed because not found`);
				else console.log(`\x1b[33m${index}\x1b[32m removed\x1b[0m`);
			} else {
				draw(x, y, col === "w" ? "white" : "black");
				console.log(`Added \x1b[32m${x};${y} ${col}\x1b[0m`);
			}
		});

		process.stdout.write("> ");
	});

};

main();
