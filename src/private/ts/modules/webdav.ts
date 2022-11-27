export function webdavToJson(split: string[], index: number): [ parsed: any, index: number ] {
	let object: any = {};
	do {
		let val;
		if (split[index][0] == "BEGIN") {
			let result = webdavToJson(split, index+1);
			object[split[index][1]] = result[0];
			index = result[1];
		} else {
			let keySplit: string[] = split[index][0].split(";");
			if (keySplit.length == 1) object[split[index][0]] = split[index][1];
			else object[keySplit.shift()!] = [ split[index][1], keySplit.join(";") ];
		}
	}
	while (split[++index][0] != "END");
	return [ object, index ];
}