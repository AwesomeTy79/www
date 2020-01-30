/* eslint-disable no-useless-catch */

const mariadb = require('mariadb');
const crypto = require('crypto');
const pool = mariadb.createPool({
	host: 'localhost',
	user: 'pi',
	password: 'tylerrelyt',
	connectionLimit: 5
});
exports.hashPassword = function (password, salt) {
	var hash = crypto.createHash('sha256');
	hash.update(password);
	hash.update(salt);
	return hash.digest('hex');
};
exports.signUp = async function (uname, pass) {
	let conn;
	try {
		var salt = require('crypto').randomBytes(48).toString('hex');
		var hash = exports.hashPassword(pass, salt);
		conn = await pool.getConnection();
		console.log(4);
		const rows = await conn.query('SELECT * from thebestwebsite.users');
		console.log(5);
		console.log(rows); //[ {val: 1}, meta: ... ]
		const res = await conn.query('INSERT INTO thebestwebsite.users (username, password, salt) VALUES (?, ?, ?);', [uname, hash, salt]);
		console.log(6);
		console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
		if (conn) return conn.close();
	} catch (err) {
		throw err;
	}
};