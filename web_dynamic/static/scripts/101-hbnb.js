// untill the window and DOM is ready
$(function () {
    /* Get all places */
    places_filters();

    /* get the status of the connection */
    $.get("http://localhost:5001/api/v1/status/", function (response) {
        if (response.status === "OK") {
            $("#api_status").addClass("available")
        }
        else {
            $("#api_status").removeClass("available")
        }
    })

    let states = {}
    let cities = {}
    let amenities = {}

    /****** States *********/
    /* go through all the checkbox if they are already checked, uncheck them */
    $('.locations .popover ul li h2 input').each(function () {
        if (this.checked) {
            this.checked = false;
        }
    })

    /* listen to changes of the checkbox */
    $('.locations .popover ul li h2 input').change(function () {

        if (this.checked) {
            states[$(this).attr('data-id')] = $(this).attr('data-name');
        }
        else {
            delete states[$(this).attr('data-id')]
        }

        $(".filters .locations h4").text(Object.values(states).join(', '));
        /* if there are no states checked but cities are display them */
        if (Object.keys(states).length === 0 && Object.keys(cities).length !== 0) {
            $(".filters .locations h4").text(Object.values(cities).join(', '));
        }
    });

    /****** Cities *********/
    /* go through all the checkbox if they are already checked, uncheck them */
    $('.locations .popover ul li ul li input').each(function () {
        if (this.checked) {
            this.checked = false;
        }
    })

    /* listen to changes of the checkbox */
    $('.locations .popover ul li ul li input').change(function () {

        if (this.checked) {
            cities[$(this).attr('data-id')] = $(this).attr('data-name');
        }
        else {
            delete cities[$(this).attr('data-id')]
        }

        if (Object.keys(states).length === 0) {
            $(".filters .locations h4").text(Object.values(cities).join(', '));
        }
    });

    /****** Amenities *********/
    /* go through all the checkbox if they are already checked, uncheck them */
    $('.amenities .popover li input').each(function () {
        if (this.checked) {
            this.checked = false;
        }
    })

    /* listen to changes of the checkbox */
    $('.amenities .popover li input').change(function () {

        if (this.checked) {
            amenities[$(this).attr('data-id')] = $(this).attr('data-name');
        }
        else {
            delete amenities[$(this).attr('data-id')]
        }

        $(".filters .amenities h4").text(Object.values(amenities).join(', '));
    })

    /****** Button Search *********/
    /* Get places based on states, citise, amenities filter when button clicked */
    $("button").on("click", function () {
        /* remove all children from places first */
        $(".places").empty()

        places_filters({
            "states": Object.keys(states),
            "cities": Object.keys(cities),
            "amenities": Object.keys(amenities)
        });
    })
});

/* make a request to get the places based on amenities */
function places_filters(filter_search = {}) {
    $.ajax({
        url: 'http://localhost:5001/api/v1/places_search/',
        type: 'POST',
        contentType: 'application/json', // Specify content type as JSON
        data: JSON.stringify(filter_search), // Send an empty JSON object as the data
        success: function (response) {
            response.forEach(place => createPlace(place));
        }
    });
}

/* a function to create a place article */
function createPlace(place) {
    const article = $("<article>");
    const div_title = $("<div>").addClass("title_box");
    const div_info = $("<div>").addClass("information");
    const div_desc = $("<div>").addClass("description");
    const div_reviews = $("<div>").addClass("reviews");

    /* title */
    let place_name = $("<h2>");
    place_name.text(place.name)

    let price_night = $("<div>");
    price_night.addClass("price_by_night");
    price_night.text(`$${place.price_by_night}`);
    div_title.append(place_name, price_night);

    /* info */
    let max_guest = $("<div>");
    max_guest.addClass("max_guest");
    max_guest.text(`${place.max_guest} Guest${place.max_guest === 1 ? '' : 's'}`);
    div_info.append(max_guest);

    let number_rooms = $("<div>");
    number_rooms.addClass("number_rooms");
    number_rooms.text(`${place.number_rooms} Bedroom${place.number_rooms === 1 ? '' : 's'}`)
    div_info.append(number_rooms);

    let number_bathrooms = $("<div>");
    number_bathrooms.addClass("number_bathrooms");
    number_bathrooms.text(`${place.number_bathrooms} Bathroom${place.number_bathrooms === 1 ? '' : 's'}`);
    div_info.append(number_bathrooms);

    /* description */
    div_desc.html(place.description);

    /* Reviews */
    const review_title = $("<h2>").text(("Reviews"));
    const span = $("<span>").text("show");
    span.on("click", function () {
        if (span.text() === "show") {
            get_reviews(div_reviews, place.id)
            span.text("hide");
        }
        else {
            $(".reviews ul").remove();
            span.text("show");
        }
    });
    review_title.append(span);
    div_reviews.append(review_title);

    /* add children */
    article.append(div_title);
    article.append(div_info);
    article.append(div_desc);
    article.append(div_reviews);

    $(".places").append(article);
}

/* get reviews for place */
function get_reviews(div_reviews, place_id) {
    $.ajax({
        url: `http://localhost:5001/api/v1/places/${place_id}/reviews`,
        type: 'GET',
        success: function (response) {
            create_review(div_reviews, response)
        }
    });
}
/* create Reviews for place */
function create_review(div_reviews, place_reviews) {
    const ul = $("<ul>")

    place_reviews.forEach(review => {
        const user_info = $("<h3>");
        /* get user */
        $.get(`http://localhost:5001/api/v1//users/${review.user_id}`, (user) => {
            user_info.text(`From ${user.first_name} ${user.last_name} the ${format_date(review.updated_at)}`);
        })

        const pr = $("<p>").html(review.text);
        ul.append($("<li>").append(user_info, pr));
    })

    div_reviews.append(ul);
}

/* format review date */
function format_date(reviewIsoDate) {

    let reviewDate = new Date(reviewIsoDate)
    // Get day, month, and year from the reviewDate
    var day = reviewDate.getDate();
    var monthIndex = reviewDate.getMonth() + 1;
    var year = reviewDate.getFullYear();

    var monthNames = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ];

    // Get the suffix for the day (e.g., "st", "nd", "rd", "th")
    var daySuffix = (day >= 11 && day <= 13) ? "th" : ["th", "st", "nd", "rd"][day % 10] || "th";

    // Construct the formatted date string
    var formattedDate = day + daySuffix + " " + monthNames[monthIndex] + " " + year;

    return (formattedDate);
}