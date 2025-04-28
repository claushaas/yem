const countryCodes = {
	AD: 376, // Afghanistan
	AE: 971, // Albania
	AF: 93, // Algeria
	AG: 1268, // Andorra
	AI: 1264, // Angola
	AL: 355, // Anguilla
	AM: 374, // Antigua and Barbuda
	AO: 244, // Argentina
	AR: 54, // Armenia
	AT: 43, // Aruba
	AU: 61, // Australia
	AW: 297, // Austria
	AZ: 994, // Azerbaijan
	BA: 387, // Bahamas
	BB: 1246, // Bahrain
	BD: 880, // Bangladesh
	BE: 32, // Barbados
	BF: 226, // Belarus
	BG: 359, // Belgium
	BH: 973, // Belize
	BI: 257, // Benin
	BJ: 229, // Bermuda
	BL: 590, // Bhutan
	BM: 1441, // Bolivia
	BN: 673, // Bosnia and Herzegovina
	BO: 591, // Botswana
	BR: 55, // Brazil
	BS: 1242, // Brunei Darussalam
	BT: 975, // Bulgaria
	BW: 267, // Burkina Faso
	BY: 375, // Burundi
	BZ: 501, // Cambodia
	CA: 1, // Cameroon
	CD: 243, // Canada
	CF: 236, // Cape Verde
	CG: 242, // Cayman Islands
	CH: 41, // Central African Republic
	CK: 682, // Chad
	CL: 56, // Chile
	CM: 237, // China
	CN: 86, // Colombia
	CO: 57, // Comoros
	CR: 506, // Congo
	CU: 53, // Cook Islands
	CV: 238, // Costa Rica
	CW: 599, // Croatia
	CY: 357, // Cuba
	CZ: 420, // Curaçao
	DE: 49, // Cyprus
	DJ: 253, // Czech Republic
	DK: 45, // Democratic Republic of the Congo
	DM: 1767, // Denmark
	DO: 1809, // Djibouti
	DZ: 213, // Dominica
	EC: 593, // Dominican Republic
	EE: 372, // Ecuador
	EG: 20, // Egypt
	EH: 212, // El Salvador
	ER: 291, // Equatorial Guinea
	ES: 34, // Eritrea
	ET: 251, // Estonia
	FI: 358, // Ethiopia
	FJ: 679, // Fiji
	FM: 691, // Finland
	FR: 33, // France
	GA: 241, // French Guiana
	GB: 44, // French Polynesia
	GD: 1473, // Gabon
	GE: 995, // Gambia
	GF: 594, // Georgia
	GH: 233, // Germany
	GI: 350, // Ghana
	GL: 299, // Gibraltar
	GM: 220, // Greece
	GN: 224, // Greenland
	GP: 590, // Grenada
	GQ: 240, // Guadeloupe
	GR: 30, // Guam
	GT: 502, // Guatemala
	GU: 1671, // Guinea
	GW: 245, // GuineaBissau
	GY: 592, // Guyana
	HK: 852, // Haiti
	HN: 504, // Honduras
	HR: 385, // Hong Kong
	HT: 509, // Hungary
	HU: 36, // Iceland
	ID: 62, // India
	IE: 353, // Indonesia
	IL: 972, // Iran
	IN: 91, // Iraq
	IQ: 964, // Ireland
	IR: 98, // Israel
	IS: 354, // Italy
	IT: 39, // Jamaica
	JM: 1876, // Japan
	JO: 962, // Jordan
	JP: 81, // Kazakhstan
	KE: 254, // Kenya
	KG: 996, // Kiribati
	KH: 855, // North Korea
	KI: 686, // South Korea
	KM: 269, // Kuwait
	KN: 1869, // Kyrgyzstan
	KP: 850, // Lao
	KR: 82, // Latvia
	KW: 965, // Lebanon
	KY: 1345, // Lesotho
	KZ: 7, // Liberia
	LA: 856, // Libya
	LB: 961, // Liechtenstein
	LC: 1758, // Lithuania
	LI: 423, // Luxembourg
	LK: 94, // Macao
	LR: 231, // Macedonia
	LS: 266, // Madagascar
	LT: 370, // Malawi
	LU: 352, // Malaysia
	LV: 371, // Maldives
	LY: 218, // Mali
	MA: 212, // Malta
	MC: 377, // Marshall Islands
	MD: 373, // Martinique
	ME: 382, // Mauritania
	MF: 590, // Mauritius
	MG: 261, // Mayotte
	MH: 692, // Mexico
	MK: 389, // Micronesia
	ML: 223, // Moldova
	MM: 95, // Monaco
	MN: 976, // Mongolia
	MO: 853, // Montenegro
	MP: 1670, // Montserrat
	MQ: 596, // Morocco
	MR: 222, // Mozambique
	MS: 1664, // Myanmar
	MT: 356, // Namibia
	MU: 230, // Nauru
	MV: 960, // Nepal
	MW: 265, // Netherlands
	MX: 52, // New Caledonia
	MY: 60, // New Zealand
	MZ: 258, // Nicaragua
	NA: 264, // Niger
	NC: 687, // Nigeria
	NE: 227, // Niue
	NF: 672, // Norfolk Island
	NG: 234, // Northern Mariana Islands
	NI: 505, // Norway
	NL: 31, // Oman
	NO: 47, // Pakistan
	NP: 977, // Palau
	NR: 674, // Palestine
	NU: 683, // Panama
	NZ: 64, // Papua New Guinea
	OM: 968, // Paraguay
	PA: 507, // Peru
	PE: 51, // Philippines
	PF: 689, // Pitcairn
	PG: 675, // Poland
	PH: 63, // Portugal
	PK: 92, // Puerto Rico
	PL: 48, // Qatar
	PM: 508, // Réunion
	PN: 64, // Romania
	PR: 1787, // Russia
	PS: 970, // Rwanda
	PT: 351, // Saint Barthélemy
	PW: 680, // Saint Helena
	PY: 595, // Saint Kitts and Nevis
	QA: 974, // Saint Lucia
	RE: 262, // Saint Martin
	RO: 40, // Saint Pierre and Miquelon
	RS: 381, // Saint Vincent and the Grenadines
	RU: 7, // Samoa
	RW: 250, // San Marino
	SA: 966, // São Tomé and Príncipe
	SB: 677, // Saudi Arabia
	SC: 248, // Senegal
	SD: 249, // Serbia
	SE: 46, // Seychelles
	SG: 65, // Sierra Leone
	SH: 290, // Singapore
	SI: 386, // Sint Maarten
	SJ: 47, // Slovakia
	SK: 421, // Slovenia
	SL: 232, // Solomon Islands
	SM: 378, // Somalia
	SN: 221, // South Africa
	SO: 252, // South Sudan
	SR: 597, // Spain
	SS: 211, // Sri Lanka
	ST: 239, // Sudan
	SV: 503, // Suriname
	SX: 1721, // Svalbard and Jan Mayen
	SY: 963, // Swaziland
	SZ: 268, // Sweden
	TC: 1649, // Switzerland
	TD: 235, // Syria
	TG: 228, // Taiwan
	TH: 66, // Tajikistan
	TJ: 992, // Tanzania
	TK: 690, // Thailand
	TL: 670, // TimorLeste
	TM: 993, // Togo
	TN: 216, // Tokelau
	TO: 676, // Tonga
	TR: 90, // Trinidad and Tobago
	TT: 1868, // Tunisia
	TV: 688, // Turkey
	TW: 886, // Turkmenistan
	TZ: 255, // Turks and Caicos Islands
	UA: 380, // Tuvalu
	UG: 256, // Uganda
	US: 1, // Ukraine
	UY: 598, // United Arab Emirates
	UZ: 998, // United Kingdom
	VA: 379, // United States
	VC: 1784, // Uruguay
	VE: 58, // Uzbekistan
	VN: 84, // Vanuatu
	VU: 678, // Vatican City
	WF: 681, // Venezuela
	WS: 685, // Vietnam
	YE: 967, // Wallis and Futuna
	YT: 262, // Western Sahara
	ZA: 27, // Yemen
	ZM: 260, // Zambia
	ZW: 263, // Zimbabwe
};

export type TCountriesIsos = keyof typeof countryCodes;

export const getCountryCode = (country: TCountriesIsos): number =>
	countryCodes[country] ?? 0;
