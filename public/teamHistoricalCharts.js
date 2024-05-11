
const full_team_names = {'Heat': 'Miami Heat', 'Lakers': 'Los Angeles Lakers', 'Celtics': 'Boston Celtics', 
'Clippers': 'La Clippers', 'Nets': 'Brooklyn Nets', 'Hornets': 'Charlotte Hornets', 'Bulls': 'Chicago Bulls', 
'Hawks': 'Atlanta Hawks', 'Suns': 'Phoenix Suns', 'Mavericks': 'Dallas Mavericks', 'Nuggets': 'Denver Nuggets', 
'Pistons': 'Detroit Pistons', 'Warriors': 'Golden State Warriors', 'Rockets': 'Houston Rockets', 'Pacers': 'Indiana Pacers', 
'Grizzlies': 'Memphis Grizzlies', 'Bucks': 'Milwaukee Bucks', 'Timberwolves': 'Minnesota Timberwolves', 'Pelicans': 'New Orleans Pelicans', 
'Knicks': 'New York Knicks', 'Thunder': 'Oklahoma City Thunder', 'Magic': 'Orlando Magic', '76ers': 'Philadelphia 76ers', 'Trail Blazers': 'Portland Trail Blazers', 
'Kings': 'Sacramento Kings', 'Spurs': 'San Antonio Spurs', 'Raptors': 'Toronto Raptors', 'Jazz': 'Utah Jazz', 'Cavaliers': 'Cleveland Cavaliers', 'Wizards': 'Washington Wizards'};

var hist_team_colors = {'Miami Heat': '#98002e', 'Los Angeles Lakers': '#552583', 'Boston Celtics': '#007a33', 'La Clippers': '#c8102e', 'Los Angeles Clippers': '#c8102e', 'Brooklyn Nets': '#777D84', 'Charlotte Hornets': '#00788c', 'Chicago Bulls': '#ce1141', 'Atlanta Hawks': '#e03a3e', 'Phoenix Suns': '#e56020', 'Dallas Mavericks': '#00538c', 'Denver Nuggets': '#1d428a', 'Detroit Pistons': '#c8102e', 'Golden State Warriors': '#ffc72c', 'Houston Rockets': '#ce1141', 'Indiana Pacers': '#002d62', 'Memphis Grizzlies': '#5d76a9', 'Milwaukee Bucks': '#00471b', 'Minnesota Timberwolves': '#236192', 'New Orleans Pelicans': '#0c2340', 'New York Knicks': '#f58426', 'Oklahoma City Thunder': '#007ac1', 'Orlando Magic': '#0077c0', 'Philadelphia 76ers': '#006bb6', 'Portland Trail Blazers': '#e03a3e', 'Sacramento Kings': '#5a2d81', 'San Antonio Spurs': '#c4ced4', 'Toronto Raptors': '#ce1141', 'Utah Jazz': '#002b5c', 'Cleveland Cavaliers': '#860038', 'Washington Wizards': '#002b5c', 'Yes': '#44D62C', 'No': 'red'};


var takes = {};
fetch('/api/odds/historical/team/'+ team_name.split(" ").join(""))
.then(res => res.json())
.then(odds => {
	console.log(odds);
	var temp = "";
	var temp2 ="";
	for (i = 0; i < odds.length; i++) {
		let take_str = odds[i].take.split(" - ");
		take_str.shift();
		take_str = take_str.join(" - ");
		takes[take_str] = odds[i].take;
		if (i % 2 == 0) {
			if (odds[i].take != "Regular Season Wins Projections") {
				temp += "<div>"+take_str+" (as of "+convertDate(new Date(odds[i].current_odds.date))+"): "+"<span class='curr-odds' onclick='historicalGraphs(event)'>"+(odds[i].current_odds.pct*100).toFixed(1)+"%</span></div>";
			}
			else {
				takes[odds[i].take] = odds[i].take;
				temp += "<div>"+odds[i].take+" (as of "+convertDate(new Date(odds[i].current_odds.date))+"): "+"<span class='curr-odds-wins' onclick='historicalGraphs(event)'>"+odds[i].current_odds.projection.toFixed(1)+"</span></div>";
			}
		}
		else {
			if (odds[i].take != "Regular Season Wins Projections") {
				temp2 += "<div>"+take_str+" (as of "+convertDate(new Date(odds[i].current_odds.date))+"): "+"<span class='curr-odds' onclick='historicalGraphs(event)'>"+(odds[i].current_odds.pct*100).toFixed(1)+"%</span></div>";
			}
			else {
				takes[odds[i].take] = odds[i].take;
				temp2 += "<div>"+odds[i].take+" (as of "+convertDate(new Date(odds[i].current_odds.date))+"): "+"<span class='curr-odds-wins' onclick='historicalGraphs(event)'>"+odds[i].current_odds.projection.toFixed(1)+"</span></div>";
			}
		}
	}
	document.getElementById("team-odds").innerHTML = temp;
	document.getElementById("team-odds-2").innerHTML = temp2;
})

function historicalGraphs(event) {
	let div_take = event.target.parentNode.innerText.split(" (as of")[0];
	let take = takes[div_take];
	console.log(take);
	take = take.split(" - ").join("@");
	take = take.split(" ").join("&");
	take = take.split("/").join("X");
	console.log(take);
	console.log(event.target.parentNode.innerText.split(" (as of"));
	let participant = full_team_names[team_name].split(" ").join("2");
	if (div_take.split(" - ")[0] == "To Reach the Playoffs") {participant = "Yes";}
	if (participant == "La2Clippers" && div_take == "Regular Season Wins Projections") {participant = "Los2Angeles2Clippers";}
	console.log(participant);
	fetch('/api/odds/historical/history/team/'+take+'/'+participant)
	.then(res => res.json())
	.then(odds => {
		google.charts.load('current', {'packages':['corechart']});
		google.charts.setOnLoadCallback(drawChart);

		function drawChart() {
			if (document.getElementById("statProgressionChart").style.display != 'block') {
	    		document.getElementById("statProgressionChart").style.display = 'block';
	    		document.getElementById("statBarChart").style.display = 'none';
	    	}
	    	let graph_format = 'percent';
	    	let graph_title = div_take+' Odds over Time';
	    	let line_title = 'Odds';
	    	let graph_min = 0;
	    	let graph_max = 1;
	    	if (div_take == 'Regular Season Wins Projections') {
	    		graph_format = '';
	    		graph_title = 'Projected Wins over Time';
	    		line_title = 'Projection';
	    		graph_min = 0;
	    		graph_max = 60;
	    	}
			let data_arr = odds.all_odds[0].participant_odds.map(odd => [/*convertDate(new Date(odd.date))*/ new Date(odd.date), (div_take!='Regular Season Wins Projections') ? odd.pct:odd.projection]);
			data_arr.unshift(['Date', line_title]);
			let data = google.visualization.arrayToDataTable(data_arr);
			let options = {
				title: graph_title,
				vAxis: {minValue: graph_min, maxValue: graph_max, format: graph_format},
				hAxis: {format: 'M/d/yy'},
				explorer: {maxZoomOut: 1, keepInBounds: true, zoomDelta: 1.1}
				//tooltip: {format: 'MMM/dd/yyyy'}
				//height: 450,
				//width: 515,
			};

			var date_formatter = new google.visualization.DateFormat({ 
    			pattern: "MMM d, yyyy"
			}); 
			date_formatter.format(data, 0);

	    	let chart = new google.visualization.LineChart(document.getElementById('statProgressionChart'));

	    	chart.draw(data, options);
	    	
		}
	});

	fetch('/api/odds/historical/current/'+take)
	.then(res => res.json())
	.then(odds => {
		google.charts.load("current", {packages:['corechart']});
		if (div_take == 'Regular Season Wins Projections') {
			google.charts.setOnLoadCallback(drawBarChart);
		}
		else {
			google.charts.setOnLoadCallback(drawDonutChart);
		}

		console.log(odds);

		function drawDonutChart() {
			if (document.getElementById("teamBarChart").style.display != 'block') {
	    		document.getElementById("teamBarChart").style.display = 'block';
	    	}
	    	let dates = odds.map(odd => odd.current_odds.date).sort();
	    	let current_date = dates[dates.length-1];
	    	let chart_colors = odds.map(odd => hist_team_colors[odd.participant]);
			let data_arr = odds.map(odd => [odd.participant, (odd.current_odds.date==current_date) ? odd.current_odds.pct:0]);
			//console.log(data_arr);
			data_arr.unshift(['Team', 'Odd']);
			let data = google.visualization.arrayToDataTable(data_arr);
			let options = {
				title: div_take+' Current Odds',
				//vAxis: {minValue: 0, maxValue: 15},
				//height: 450,
				//width: 515,
				pieHole: .4,
				colors: chart_colors,
				//isStacked: true
			};

			var chart = new google.visualization.PieChart(document.getElementById("teamBarChart"));
			chart.draw(data, options);
		}

		function drawBarChart() {
			if (document.getElementById("teamBarChart").style.display != 'block') {
	    		document.getElementById("teamBarChart").style.display = 'block';
	    	}
			let data_arr = odds.map(odd => [odd.participant, odd.current_odds.projection, hist_team_colors[odd.participant]]);
			data_arr.unshift(['Team', 'Projection', { role: "style" }]);
			let data = google.visualization.arrayToDataTable(data_arr);
			let options = {
				title: 'Regular Season Wins Projections',
				//vAxis: {minValue: 0, maxValue: 15},
				//height: 450,
				//width: 515,
				//isStacked: true
			};

			var chart = new google.visualization.ColumnChart(document.getElementById("teamBarChart"));
			chart.draw(data, options);
		}
	});
}


/*
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
			height: 450,
			width: 515,
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
			height: 450,
			width: 515,
			//isStacked: true
		};

		var chart = new google.visualization.ColumnChart(document.getElementById("teamBarChart"));
		chart.draw(data, options);
	}
}*/