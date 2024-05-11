function convertDate(date) {
	return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
}

var sum_games = 0;
var sum_stat = 0;

function accumulateAvg(game_stat) {
	sum_games++;
	sum_stat+=game_stat;
	return sum_stat/sum_games;
}

document.getElementById("team-ppg-div").addEventListener("click", teamPointGraphs);
function teamPointGraphs() {
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(drawChart);
	function drawChart() {
		if (document.getElementById("statProgressionChart").style.display != 'block') {
    		document.getElementById("statProgressionChart").style.display = 'block';
    		document.getElementById("statBarChart").style.display = 'none';
    	}
		sum_games = 0;
		sum_stat = 0;
		let data_arr = team_stats.game_logs.map(game_log => [convertDate(new Date(game_log.game_date)), accumulateAvg(game_log.points)]);
		data_arr.unshift(['Date', 'Team Points']);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
		title: 'Team PPG over Time',
		//height: 450,
		//width: 550,
		vAxis: {minValue: 100, maxValue: 120}
		};

    	let chart = new google.visualization.LineChart(document.getElementById('statProgressionChart'));

    	chart.draw(data, options);
    	
	}

	google.charts.load("current", {packages:['corechart']});
	google.charts.setOnLoadCallback(drawBarChart);

	function drawBarChart() {
		if (document.getElementById("teamBarChart").style.display != 'block') {
    		document.getElementById("teamBarChart").style.display = 'block';
    	}
		let data_arr = team_stats.game_logs.map(game_log => [homeAway[game_log.location]+" "+game_log.opponent, game_log.points]);
		data_arr.unshift(['Game', 'Team Points']);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
			title: 'Team Points by Game',
			//height: 450,
			//width: 550,
			vAxis: {minValue: 100, maxValue: 120}
		};

		var chart = new google.visualization.ColumnChart(document.getElementById("teamBarChart"));
		chart.draw(data, options);
	}

}


document.getElementById("ptdiff-div").addEventListener("click", teamDiffGraphs);
function teamDiffGraphs() {
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(drawChart);
	function drawChart() {
		if (document.getElementById("statProgressionChart").style.display != 'block') {
    		document.getElementById("statProgressionChart").style.display = 'block';
    		document.getElementById("statBarChart").style.display = 'none';
    	}
		sum_games = 0;
		sum_stat = 0;
		let data_arr = team_stats.game_logs.map(game_log => [convertDate(new Date(game_log.game_date)), accumulateAvg(game_log.point_differential)]);
		data_arr.unshift(['Date', 'Team Point Differential']);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
		title: 'Team Point Differential over Time',
		//height: 450,
		//width: 515,
		vAxis: {minValue: -10, maxValue: 10}
		};

    	let chart = new google.visualization.LineChart(document.getElementById('statProgressionChart'));

    	chart.draw(data, options);
    	
	}

	google.charts.load("current", {packages:['corechart']});
	google.charts.setOnLoadCallback(drawBarChart);

	function drawBarChart() {
		if (document.getElementById("teamBarChart").style.display != 'block') {
    		document.getElementById("teamBarChart").style.display = 'block';
    	}
		let data_arr = team_stats.game_logs.map(game_log => [homeAway[game_log.location]+" "+game_log.opponent, game_log.point_differential]);
		data_arr.unshift(['Game', 'Team Point Differential']);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
			title: 'Team Point Differential by Game',
			//height: 450,
			//width: 515,
			vAxis: {minValue: -20, maxValue: 20}
		};

		var chart = new google.visualization.ColumnChart(document.getElementById("teamBarChart"));
		chart.draw(data, options);
	}
}



var sum_made = 0;
var sum_total = 0;
function accumulatePct(made, total) {
	sum_made += made;
	sum_total += total;
	return sum_made/sum_total;
}

document.getElementById("fgpct-div").addEventListener("click", teamFgGraphs);
function teamFgGraphs() {
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(drawChart);

	function drawChart() {
		if (document.getElementById("statProgressionChart").style.display != 'block') {
    		document.getElementById("statProgressionChart").style.display = 'block';
    		document.getElementById("statBarChart").style.display = 'none';
    	}
		sum_made = 0;
		sum_total = 0;
		let data_arr = team_stats.game_logs.map(game_log => [convertDate(new Date(game_log.game_date)), accumulatePct(game_log.fgm, game_log.fga)]);
		data_arr.unshift(['Date', 'Field Goal Percentage']);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
			title: 'Team FG% over Time',
			vAxis: {minValue: .4, maxValue: .52, format: 'percent'},
			//height: 450,
			//width: 515,
		};

    	let chart = new google.visualization.LineChart(document.getElementById('statProgressionChart'));

    	chart.draw(data, options);
    	
	}

	google.charts.load("current", {packages:['corechart']});
	google.charts.setOnLoadCallback(drawBarChart);

	function drawBarChart() {
		if (document.getElementById("teamBarChart").style.display != 'block') {
    		document.getElementById("teamBarChart").style.display = 'block';
    	}
		let data_arr = team_stats.game_logs.map(game_log => [homeAway[game_log.location]+" "+game_log.opponent, game_log.fgm, game_log.fga-game_log.fgm]);
		data_arr.unshift(['Game', 'Field Goals Made', 'Field Goals Missed']);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
			title: 'Team Field Goals by Game',
			vAxis: {minValue: 0, maxValue: 100},
			//height: 450,
			//width: 515,
			isStacked: true
		};

		var chart = new google.visualization.ColumnChart(document.getElementById("teamBarChart"));
		chart.draw(data, options);
	}
}


document.getElementById("tpct-div").addEventListener("click", teamThreeGraphs);
function teamThreeGraphs() {
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(drawChart);

	function drawChart() {
		if (document.getElementById("statProgressionChart").style.display != 'block') {
    		document.getElementById("statProgressionChart").style.display = 'block';
    		document.getElementById("statBarChart").style.display = 'none';
    	}
		sum_made = 0;
		sum_total = 0;
		let data_arr = team_stats.game_logs.map(game_log => [convertDate(new Date(game_log.game_date)), accumulatePct(game_log.tpm, game_log.tpa)]);
		data_arr.unshift(['Date', '3 Point Percentage']);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
			title: 'Team 3P% over Time',
			vAxis: {minValue: .3, maxValue: .4, format: 'percent'},
			//height: 450,
			//width: 515,
		};

    	let chart = new google.visualization.LineChart(document.getElementById('statProgressionChart'));

    	chart.draw(data, options);
    	
	}

	google.charts.load("current", {packages:['corechart']});
	google.charts.setOnLoadCallback(drawBarChart);

	function drawBarChart() {
		if (document.getElementById("teamBarChart").style.display != 'block') {
    		document.getElementById("teamBarChart").style.display = 'block';
    	}
		let data_arr = team_stats.game_logs.map(game_log => [homeAway[game_log.location]+" "+game_log.opponent, game_log.tpm, game_log.tpa-game_log.tpm]);
		data_arr.unshift(['Game', "3's Made", "3's Missed"]);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
			title: "Team 3's by Game",
			vAxis: {minValue: 0, maxValue: 50},
			//height: 450,
			//width: 515,
			isStacked: true
		};

		var chart = new google.visualization.ColumnChart(document.getElementById("teamBarChart"));
		chart.draw(data, options);
	}
}


document.getElementById("ftpct-div").addEventListener("click", teamFTGraphs);
function teamFTGraphs() {
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(drawChart);

	function drawChart() {
		if (document.getElementById("statProgressionChart").style.display != 'block') {
    		document.getElementById("statProgressionChart").style.display = 'block';
    		document.getElementById("statBarChart").style.display = 'none';
    	}
		sum_made = 0;
		sum_total = 0;
		let data_arr = team_stats.game_logs.map(game_log => [convertDate(new Date(game_log.game_date)), accumulatePct(game_log.ftm, game_log.fta)]);
		data_arr.unshift(['Date', 'Free Throw Percentage']);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
			title: 'Team FT% over Time',
			vAxis: {minValue: .7, maxValue: .9, format: 'percent'},
			//height: 450,
			//width: 515,
		};

    	let chart = new google.visualization.LineChart(document.getElementById('statProgressionChart'));

    	chart.draw(data, options);
    	
	}

	google.charts.load("current", {packages:['corechart']});
	google.charts.setOnLoadCallback(drawBarChart);

	function drawBarChart() {
		if (document.getElementById("teamBarChart").style.display != 'block') {
    		document.getElementById("teamBarChart").style.display = 'block';
    	}
		let data_arr = team_stats.game_logs.map(game_log => [homeAway[game_log.location]+" "+game_log.opponent, game_log.ftm, game_log.fta-game_log.ftm]);
		data_arr.unshift(['Game', "Free Throws Made", "Free Throws Missed"]);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
			title: "Team FTs by Game",
			vAxis: {minValue: 0, maxValue: 30},
			//height: 450,
			//width: 515,
			isStacked: true
		};

		var chart = new google.visualization.ColumnChart(document.getElementById("teamBarChart"));
		chart.draw(data, options);
	}
}


document.getElementById("ts-div").addEventListener("click", teamTSGraphs);
function teamTSGraphs() {
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(drawChart);

	function drawChart() {
		if (document.getElementById("statProgressionChart").style.display != 'block') {
    		document.getElementById("statProgressionChart").style.display = 'block';
    		document.getElementById("statBarChart").style.display = 'none';
    	}
		sum_made = 0;
		sum_total = 0;
		let data_arr = team_stats.game_logs.map(game_log => [convertDate(new Date(game_log.game_date)), accumulatePct(game_log.fgm+.5*game_log.tpm+.5*game_log.ftm, game_log.fga+.44*game_log.fta)]);
		data_arr.unshift(['Date', 'Team True Shooting Percentage']);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
			title: 'Team TS% over Time',
			vAxis: {minValue: .5, maxValue: .65, format: 'percent'},
			//height: 450,
			//width: 515,
		};

    	let chart = new google.visualization.LineChart(document.getElementById('statProgressionChart'));

    	chart.draw(data, options);
    	
	}

	google.charts.load("current", {packages:['corechart']});
	google.charts.setOnLoadCallback(drawBarChart);

	function drawBarChart() {
		if (document.getElementById("teamBarChart").style.display != 'block') {
    		document.getElementById("teamBarChart").style.display = 'block';
    	}
		let data_arr = team_stats.game_logs.map(game_log => [homeAway[game_log.location]+" "+game_log.opponent, game_log.points, (game_log.fgm+.5*game_log.tpm+.5*game_log.ftm)/(game_log.fga+.44*game_log.fta)]);
		data_arr.unshift(['Game', 'Points', 'TS']);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
			title: 'Team Points and True Shooting Percentage by Game',
			//vAxis: {minValue: 0, maxValue: 15},
			series: {
				0: {tagetAxisIndex: 0},
				1: {targetAxisIndex: 1}
			},
			vAxes: {
				0: {title: 'Points', minValue: 0, maxValue: 120},
				1: {title: 'TS%', minValue: 0, maxValue: 1, format: 'percent'}
			},
			//height: 450,
			//width: 515,
			//isStacked: true
		};

		var chart = new google.visualization.ColumnChart(document.getElementById("teamBarChart"));
		chart.draw(data, options);
	}
}


document.getElementById("efg-div").addEventListener("click", teamEfgGraphs);
function teamEfgGraphs() {
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(drawChart);

	function drawChart() {
		if (document.getElementById("statProgressionChart").style.display != 'block') {
    		document.getElementById("statProgressionChart").style.display = 'block';
    		document.getElementById("statBarChart").style.display = 'none';
    	}
		sum_made = 0;
		sum_total = 0;
		let data_arr = team_stats.game_logs.map(game_log => [convertDate(new Date(game_log.game_date)), accumulatePct(game_log.fgm+.5*game_log.tpm, game_log.fga+.44)]);
		data_arr.unshift(['Date', 'Team Effective Field Goal Percentage']);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
			title: 'Team EFG% over Time',
			vAxis: {minValue: .5, maxValue: .65, format: 'percent'},
			//height: 450,
			//width: 515,
		};

    	let chart = new google.visualization.LineChart(document.getElementById('statProgressionChart'));

    	chart.draw(data, options);
    	
	}

	google.charts.load("current", {packages:['corechart']});
	google.charts.setOnLoadCallback(drawBarChart);

	function drawBarChart() {
		if (document.getElementById("teamBarChart").style.display != 'block') {
    		document.getElementById("teamBarChart").style.display = 'block';
    	}
		let data_arr = team_stats.game_logs.map(game_log => [homeAway[game_log.location]+" "+game_log.opponent, game_log.points-game_log.ftm, (game_log.fgm+.5*game_log.tpm)/(game_log.fga)]);
		data_arr.unshift(['Game', 'Points', 'EFG%']);
		let data = google.visualization.arrayToDataTable(data_arr);
		let options = {
			title: 'Team Points minus Free Throws and Effective Field Goal Percentage by Game',
			//vAxis: {minValue: 0, maxValue: 15},
			series: {
				0: {tagetAxisIndex: 0},
				1: {targetAxisIndex: 1}
			},
			vAxes: {
				0: {title: 'Points', minValue: 0, maxValue: 120},
				1: {title: 'EFG%', minValue: 0, maxValue: 1, format: 'percent'}
			},
			//height: 450,
			//width: 515,
			//isStacked: true
		};

		var chart = new google.visualization.ColumnChart(document.getElementById("teamBarChart"));
		chart.draw(data, options);
	}
}