const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const { Sequelize } = require("sequelize");
const getEloRating = require("./utils/getEloloRating");

const sequelize = new Sequelize("database", "username", "password", {
	host: "localhost",
	dialect: "sqlite",
	storage: "./countries.db",
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

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});

app.get("/countries", async (req, res) => {
	try {
		const countries = await Country.findAll({ order: [["elo", "DESC"]] });
		res.json(countries);
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

		await Country.update(
			{ elo: winnerEloAfter },
			{ where: { id: winnerId } }
		);

		await Country.update(
			{ elo: looserEloAfter },
			{ where: { id: looserId } }
		);

		res.status(200).send("success");
	} catch (error) {
		console.log(error);
	}
});

Country.sync();

// Country.create({
// 	name: "República de Corea",
// 	flag: "https://cdn.pixabay.com/photo/2012/04/10/23/02/south-korea-26819_960_720.png",
// 	elo: 1000,
// });

// Country.destroy({
// 	where: {
// 		id: 4,
// 	},
// });
console.log("llega");

test();

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
