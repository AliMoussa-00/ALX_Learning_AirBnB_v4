// untill the window and DOM is ready
$(function () {
    /* Get all places */
    places_filters();

    let amenities = {}

    /* let's go through all the checkbox to see if they are already checked and add them to the list*/
    $('.amenities .popover li input').each(function () {
        if (this.checked) {
            amenities[$(this).attr('data-id')] = $(this).attr('data-name');
        }
    })
    if (amenities) {
        $(".filters .amenities h4").text(Object.values(amenities).join(', '));
    }

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

    $.get("http://localhost:5001/api/v1/status/", function (response) {
        if (response.status === "OK") {
            $("#api_status").addClass("available")
        }
        else {
            $("#api_status").removeClass("available")
        }
    })

    /****** States *********/
    let states = {}
    let cities = {}

    /* let's go through all the checkbox of states if they are already checked add them to the list*/
    $('.locations .popover ul li h2 input').each(function () {
        if (this.checked) {
            states[$(this).attr('data-id')] = $(this).attr('data-name');
        }
    })
    if (states) {

        $(".filters .locations h4").text(Object.values(states).join(', '));
    }

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

    /* let's go through all the checkbox of cities if they are already checked add them to the list*/
    $('.locations .popover ul li ul li input').each(function () {
        if (this.checked) {
            cities[$(this).attr('data-id')] = $(this).attr('data-name');
        }
    })
    if (cities && Object.keys(states).length === 0) {
        $(".filters .locations h4").text(Object.values(cities).join(', '));
    }

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

    article.append(div_title);
    article.append(div_info);
    article.append(div_desc);

    $(".places").append(article);
}