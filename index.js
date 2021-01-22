const fs = require('fs');
const readXlsxFile = require('read-excel-file/node');

const BLANK = '';
const MENTOR_MAP_PATH = 'mentor-map';
const OUTPUT_FILE_PATH = './output/';
let lastRowMonth;

const mentorMap = fs.readFileSync(MENTOR_MAP_PATH, 'utf-8');

function getTodate() {
	const dateObj = new Date();
	const month = String(dateObj.getMonth() + 1).padStart(2, '0');
	const day = String(dateObj.getDate()).padStart(2, '0');
	const year = dateObj.getFullYear();
	const output = `${day}/${month}/${year}`;
	return output;
}

const generateRow = piraonDate => (row, i) => {
	const [A_month, B, C, D_firstName, E_lastName, F, G, H, I, J_amount, K, L, M, N_usmachta, O, P, Q_zokuiDate, R, S] = row;
	const mentorId = getMentorId(row);
	lastRowMonth = A_month;
	const result = [
		'2',
		getTodate(),
		B && B.toLocaleDateString ? B.toLocaleDateString('en-GB') : '',
		'1',
		BLANK,
		`תשלום לחודש ${A_month}`,
		BLANK,
		J_amount,
		BLANK,
		mentorId,
		E_lastName,
		D_firstName,
		BLANK,
		BLANK,
		17040001 + i,
		piraonDate,
		'9',
		N_usmachta,
		BLANK,
		BLANK,
		S,
		'1',
		BLANK,
		BLANK,
		'10',
		BLANK,
		J_amount,
		BLANK,
		BLANK,
		BLANK
	];
	return result;
}

const mentorsObject = {};
let lastMentorId = 0;

const buildMentorsObject = map => {
	map.split('\n').forEach(mentorRow => {
		const [, id, lName, fName] = /^(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|\r]+)\s*$/.exec(mentorRow) || [];
		mentorsObject[`${fName.trim()} ${lName.trim()}`] = id;
		lastMentorId = Math.max(lastMentorId, +id);
	})
}

function createMentor(fName, lName) {
	lastMentorId++;
	let key = `${fName} ${lName}`;
	mentorsObject[key] = lastMentorId;
	console.log(`
####

Mentor not found, Creating New -
Key: ${key}
ID: ${lastMentorId} 

####
`);
	fs.writeFileSync(MENTOR_MAP_PATH, `${mentorMap}
${lastMentorId} | ${lName.trim()} | ${fName.trim()}`);
	return lastMentorId;
}

const getMentorId = ([,,,fName,lName]) => {
	let key = `${fName} ${lName}`;
	if (mentorsObject[key]) {
		return mentorsObject[key];
	} else {
		createMentor(fName, lName);
	}
};

const processFile = (filename, piraonDate) => {
	readXlsxFile(`./input/${filename}`).then((rows) => {
		const result = rows
			.slice(1)
			.filter(([A, B]) => A !== null && B !== null)
			.map(generateRow(piraonDate));

		let fullFilePath = `${OUTPUT_FILE_PATH}${lastRowMonth}.csv`;
		fs.writeFileSync(fullFilePath, result.map(row => row.join(',')).join('\n'));

		console.log(`

Processing Completed Successfully
		
Output written to file: ${fullFilePath}`);

		process.exit(0);
	})
}

(async () => {
	if (!process.argv[2]) {
		console.log('Error - No input filename provided');
		process.exit();
	}
	if (!process.argv[3]) {
		console.log('Error - No תאריך פרעון provided');
		process.exit();
	}
	buildMentorsObject(mentorMap);
	processFile(process.argv[2], process.argv[3]);
})()

//
// דצמבר
// 06/12/2020 07:45
// המכון ללימודי חשיבה הכרתית עש ימימה ער
// ברכה
// הרשלום
// Brachahh@gmail.com
// 050-6617064
// הוראת קבע
// תשלום 15 מתוך 48
// 32.00
// 0.45
// 0.08
// 31.48
// 92872758
// ריצת הוראת קבע
// דמי חבר למכון ללימודי חשיבה הכרתית
// 10/01/2021
// Visa-ישראלי
// 4122

// [
// 	'דצמבר'
// 2020-12-28T01:18:03.000Z
// 'המכון ללימודי חשיבה הכרתית עש ימימה ער'
// 'ברכה'
// 'הרשלום'
// 'Brachahh@gmail.com'
// '050-6617064'
// 'הוראת קבע'
// 'ללא הגבלה'
// 72
// 1.008
// 0.17136
// 70.82064
// 95260336
// 'דרישת תשלום'
// 'דמי חבר למדריך'
// 2021-01-10T12:00:00.000Z
// 'Visa-ישראלי'
// 4122
// ],