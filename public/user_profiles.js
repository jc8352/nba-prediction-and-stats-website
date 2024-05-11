function swapNodes(n1, n2) {

    var p1 = n1.parentNode;
    var p2 = n2.parentNode;
    var i1, i2;

    if ( !p1 || !p2 || p1.isEqualNode(n2) || p2.isEqualNode(n1) ) return;

    for (var i = 0; i < p1.children.length; i++) {
        if (p1.children[i].isEqualNode(n1)) {
            i1 = i;
        }
    }
    for (var i = 0; i < p2.children.length; i++) {
        if (p2.children[i].isEqualNode(n2)) {
            i2 = i;
        }
    }

    if ( p1.isEqualNode(p2) && i1 < i2 ) {
        i2++;
    }
    p1.insertBefore(n2, p1.children[i1]);
    p2.insertBefore(n1, p2.children[i2]);
}

function reverseDates() {
	var table, rows;
	table = document.getElementById("takes-table");
	rows = table.rows;
	for (i = 1; i < (rows.length+1)/2; i++) {
		swapNodes(rows[i], rows[rows.length-i]);
	}
}

//n=col number dir= ascending or descending
function sortTable(n, dir) {
	var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
	var last = false;
	table = document.getElementById("takes-table");
	switching = true;
	while (switching) {
		switching = false;
		rows = table.rows;
		if (rows.length <= 2) {return;}
		for (i = 1; i < (rows.length-1); i++) {
			shouldSwitch = false;
			x = rows[i].getElementsByTagName("TD")[n];
			y = rows[i+1].getElementsByTagName("TD")[n];
			if (n == 1 || n == 0) {
				x = rows[i].getElementsByTagName("TD")[0].getElementsByTagName('p')[0];
				y = rows[i+1].getElementsByTagName("TD")[0].getElementsByTagName('p')[0];
				x = prep_date(x.innerHTML);
				y = prep_date(y.innerHTML);
			}
			else if (n == 2) {
				x = prep_odds(x.innerHTML);
				y = prep_odds(y.innerHTML);
			}
			else if (n == 3) {
				x = prep_result(x.innerHTML);
				y = prep_result(y.innerHTML);
			}
			else if (n == 5 || n == 6) {
				if (n == 6) {
					x = rows[i].getElementsByTagName("TD")[5];
					y = rows[i+1].getElementsByTagName("TD")[5];
				}
				x = prep_pct(x.innerHTML);
				y = prep_pct(y.innerHTML);
			}
			else if (n == 7 || n == 8) {
				x = prep_gain(x.innerHTML);
				y = prep_gain(y.innerHTML);
			}
			else {
				x = x.innerHTML.toLowerCase();
				y = y.innerHTML.toLowerCase();
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

function prep_date(date_string) {
	return parseInt(date_string);
}

function prep_pct(pct_string) {
	let dash_loc = pct_string.indexOf("-");
	let wins = parseInt(pct_string);
	let losses = parseInt(pct_string.slice(dash_loc+1));
	return wins/(losses+wins)+wins*.000001;
}

function prep_gain(gain_string) {
	if (gain_string[0] == '-') {
		return parseFloat(gain_string.slice(2))*-1;
	}
	else if (gain_string[0] == '+') {
		return parseFloat(gain_string.slice(2));
	}
	else {
		return parseFloat(gain_string.slice(1));
	}
}

function prep_result(result_string) {
	if (result_string == "Right") {
		return 1;
	}
	else if (result_string == "In Progress") {
		return 2;
	}
	else {
		return 3;
	}
}

function prep_odds(odds_string) {
	if (odds_string == "N/A") {
		return 0;
	}
	else {
		return parseInt(odds_string);
	}
}




