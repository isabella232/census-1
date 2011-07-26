var layers = 'mapbox.natural-earth-1,';
    layers += 'usa1-census-state-z2-5,';
    layers += 'usa2-census-counties-z6-9,';
    layers += 'usa3-census-tracts-contusa-z10-13,';
    layers += 'usa4-census-tracts-AK-z10-13,';
    layers += 'usa5-census-tracts-HI-z10-13,';
    layers += 'usa6-census-tracts-contusa-z14,';
    layers += 'usa7-census-tracts-AK-z14,';
    layers += 'usa8-census-tracts-HI-z14,';
    layers += 'mapbox.world-borders-dark';

function getTiles() {
    return [
        "http://a.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.png",
        "http://b.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.png",
        "http://c.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.png",
        "http://d.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.png"
        ];
};

function getGrids() {
    return [
        "http://a.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.grid.json",
        "http://b.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.grid.json",
        "http://c.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.grid.json",
        "http://d.tiles.mapbox.com/devseed/1.0.0/"+layers+"/{z}/{x}/{y}.grid.json"
        ];
};
var tilejson = {
    tilejson: '1.0.0',
    scheme: 'tms',
    tiles: getTiles(),
    grids: getGrids(),
    minzoom: 4,
    maxzoom: 12
};
var mm = com.modestmaps;
var m = new mm.Map('map', new wax.mm.connector(tilejson));
m.setCenterZoom(new mm.Location(39, -98), 5);
wax.mm.interaction(m, tilejson);
wax.mm.legend(m, tilejson).appendTo(m.parent);
wax.mm.zoomer(m, tilejson).appendTo(m.parent);

function geocode(location) {
    $.ajax({
        url: 'http://api.geonames.org/postalCodeLookupJSON?postalcode=' + location + '&country=US&username=tristen',
        type: 'json',
        success: function (resp) {
            if (resp.postalcodes[0]) {
                $.each(resp.postalcodes, function(value) {
                    m.setCenterZoom(new mm.Location(value.lat, value.lng), 12);
                });
            }
            else {
                errorBox('<p>The code you tried did not return a result.</p>');
            }
        }
    });
}

function errorBox(reason) {
    $('form.location-search').append('<div class="error">' + reason + '<a href="#" class="close">x</a><div>');
    $('a.close').click(function(e) {
        e.preventDefault();
        $('.error').remove();
    });
}

function locationHash() {
    if(location.hash) {
        var value = location.hash.split('#');
        geocode(value[1]);
    }
}

domReady(function () {
    locationHash();

    // Remove val on focus
    var input = $('.location-search input[type=text]'),
        inputTitle = 'Enter zip code here';

    input.blur(function() {
        if (input.val() === '') {
            input.val(inputTitle);
        }
    }).focus(function() {
        if (input.val() === inputTitle) {
            input.val('');
        }
    });

    $('form.location-search').submit(function (e){
        e.preventDefault();
        var inputValue = input.val(),
            zipValid = /^\d{5}$/.exec(inputValue);

        if (zipValid) {
            $('.error').remove();
            geocode(inputValue);
        }
        else {
            errorBox("<p>Must be a valid 5 digit zip code. <br /><small>e.g <em>20010</em></small></p>");
        }
    });
});