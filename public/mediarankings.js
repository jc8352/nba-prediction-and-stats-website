
function sortTable(n, dir) {
	var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
	table = document.getElementById("takepct-table");
	switching = true;
	var last = false;
	while (switching) {
		switching = false;
		rows = table.rows;
		if (rows.length <= 2) {return;}
		for (i = 1; i < (rows.length-1); i++) {
			shouldSwitch = false;
			x = rows[i].getElementsByTagName("TD")[n];
			y = rows[i+1].getElementsByTagName("TD")[n];
			if (n== 1) {
				x = x.getElementsByTagName("span")[0];
				y = y.getElementsByTagName("span")[0];
				x = prep_name(x.innerHTML);
				y = prep_name(y.innerHTML);
			}
			else if (n == 2) {
				x = x.innerHTML;
				y = y.innerHTML;
			}
			else if (n == 3) {
				x = rows[i].getElementsByTagName("TD")[4];
				y = rows[i+1].getElementsByTagName("TD")[4];
				x = prep_pct(x.innerHTML);
				y = prep_pct(y.innerHTML);
			}
			else if (n == 4) {
				x = parseInt(x.innerHTML);
				y = parseInt(y.innerHTML);
			}
			else if (n == 5) {
				x = (x.innerHTML[0] == "↓") ? (parseFloat(x.innerHTML.slice(1)))*-1:(parseFloat(x.innerHTML.slice(1)));
				y = (y.innerHTML[0] == "↓") ? (parseFloat(y.innerHTML.slice(1)))*-1:(parseFloat(y.innerHTML.slice(1)));
			}
			else if (n == 6) {
				x = prep_gain(x.innerHTML);
				y = prep_gain(y.innerHTML);
			}
			else {
				x = x.getElementsByTagName('span')[0];
				y = y.getElementsByTagName('span')[0];
				x = prep_rank(x.innerHTML);
				y = prep_rank(y.innerHTML);
			}
			if (dir == "asc") {
				if (x > y) {
					shouldSwitch = true;
					break;
				}
			}
			else if (dir == "desc") {
				if (x < y) {
					shouldSwitch = true;
					break;
				}
			}
		}
		if (shouldSwitch) {
			rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
			switching = true;
			switchcount++;
		}
		else {
			if (switchcount == 0 && dir == "asc") {
				dir = "desc";
				switching = true;
				if (last) {return;}
				last = true;
			}
			else if (switchcount == 0 && dir == "desc") {
				dir = "asc";
				switching = true;
				if (last) {return;}
				last = true;
			}
		}
	}
}

function addRankings() {
	var table = document.getElementById("takepct-table");
	rows = table.rows;
	for (i = 1; i < rows.length; i++) {
		var media_member = rows[i].getElementsByClassName("ranking")[0];
		media_member.innerHTML = i+'. ';
	}
}

function prep_gain(gain_string) {
	if (gain_string[0] == '-') {
		return parseFloat(gain_string.slice(2))*-1;
	}
	else {
		return parseFloat(gain_string.slice(1));
	}
}

function prep_pct(pct_string) {
	let dash_loc = pct_string.indexOf("-");
	let wins = parseInt(pct_string);
	let losses = parseInt(pct_string.slice(dash_loc+1));
	return (losses+wins==0) ? 0 : wins/(losses+wins)+wins*.000001;
}

function prep_rank(rank_string) {
	var period_index = rank_string.indexOf(".");
	return parseInt(rank_string.slice(0, period_index));
}

function prep_name(name_string) {
	let space_loc = name_string.indexOf(" ");
	if (space_loc == -1) {
		return name_string;
	}
	else {
		var firstName = name_string.slice(0, space_loc);
		var space_loc2 = name_string.slice(space_loc+1).indexOf(" ");
		if (space_loc2 == -1) {
			var lastName = name_string.slice(space_loc+1);
			return lastName+firstName;
		}
		else {
			var middleInitial = name_string.slice(space_loc+1, space_loc+space_loc2+1);
			var lastName = name_string.slice(space_loc+space_loc2+2);
			return lastName+firstName+middleInitial;
		}
	}
}



