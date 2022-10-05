const express = require("express");
const app = express();
const port = 5000;
const { Sequelize, DataTypes } = require("sequelize");
const getEloRating = require("./utils/getEloloRating");

const sequelize = new Sequelize("database", "username", "password", {
	host: "localhost",
	dialect: "sqlite",
	storage: "./mauricio.db",
});

const test = async () => {
	try {
		await sequelize.authenticate();

		console.log("Connection has been established successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};

const Country = sequelize.define("Country", {
	name: Sequelize.STRING,
	flag: Sequelize.STRING,
	elo: Sequelize.NUMBER,
});

app.use(express.json());

app.get("/countries", async (req, res) => {
	try {
		const countries = await Country.findAll();
		const stringifyCountries = JSON.stringify(countries, null, 2);
		res.send(stringifyCountries);
	} catch (error) {
		console.log(error);
	}
});

app.get("/match", async (req, res) => {
	try {
		const matchCountries = await Country.findAll({
			order: sequelize.random(),
			limit: 2,
		});
		res.send(matchCountries);
	} catch (error) {
		console.log(error);
	}
});

app.post("/match", async (req, res) => {
	try {
		const { winnerId, looserId } = req.body;
		const winner = await Country.findOne({ where: { id: winnerId } });
		const looser = await Country.findOne({ where: { id: looserId } });
		const winnerEloBefore = winner.dataValues.elo;
		const LooserEloBefore = looser.dataValues.elo;
		const [winnerEloAfter, looserEloAfter] = getEloRating({
			winner: winnerEloBefore,
			looser: LooserEloBefore,
		});

		// await Country.update(
		// 	{ elo: winnerEloAfter },
		// 	{ where: { id: winnerId } }
		// );

		// await Country.update(
		// 	{ elo: looserEloAfter },
		// 	{ where: { id: looserId } }
		// );

		console.log("winner", winnerEloAfter, "looser", looserEloAfter);

		// !ADD PATCH QUERY FOR AFTER ELO

		res.send("exito");
	} catch (error) {
		console.log(error);
	}
});

Country.sync();

// Country.create({
// 	name: "Uruguay",
// 	flag: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Uruguay.svg/1200px-Flag_of_Uruguay.svg.png",
// 	elo: 1000,
// });

console.log("llega");

test();

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
