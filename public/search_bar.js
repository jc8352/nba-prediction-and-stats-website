

const userCardTemplate = document.querySelector("[data-user-template]");
const userCardContainer = document.querySelector("[data-user-cards-container");
const searchInput = document.querySelector("[data-search]");

var cards = 0;

searchInput.addEventListener("input", e => {
	const value = e.target.value;
	cards = document.getElementsByClassName("card").length;
	for (i = 0; i < cards; i++) {
			userCardContainer.removeChild(userCardContainer.children[1]);
	}
	if (value.length >= 1) {
		fetch("/api/usernames/"+value)
		.then(res => res.json())
		.then(data => {
			data.forEach(user => {
				const card = userCardTemplate.content.cloneNode(true).children[0];
				card.setAttribute("href", "/users/" + user._id);
				const username = card.querySelector("[data-username]");
				username.textContent = user.username;
				userCardContainer.append(card);
			})
		})	
	}
})

var search = document.getElementById("search");

var icon = document.getElementsByClassName("fa-search")[0];

$(document).on('mousedown', '#user-cards-div a', function (e) {
	e.preventDefault();
	return false;
});

icon.addEventListener("click", show);
function show() {
	
	var cards = document.getElementById("user-cards-div");

	if (search != document.activeElement) {
		search.focus();
		cards.classList.toggle("show-cards");

	}

}

search.addEventListener("focusout", show_users);

function show_users(e) {
	var cards = document.getElementById("user-cards-div");
	
	if (cards.classList.contains("show-cards")) {
		cards.classList.toggle("show-cards");
	}
	
}