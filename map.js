



/* global google */

var map
var markers = []
var position
var center
var direction
var numbPlace
var status = 1 //1 search 2 selected
var selected
var tempTest //TODO delete
//call by google for map creation
function initMap() {
    getLocation(printMap);
    listeningSpeak();
}

//print map centred on user
function printMap(positionLocal)
{
    // default if geoloc not supported

    position = {lat: positionLocal.coords.latitude || 45.15,
        lng: positionLocal.coords.longitude || 5.5}

//print map
    map = new google.maps.Map(document.getElementById('map'), {
        center: position,
        zoom: 15
    });
//print user position
    var h_icon = "./h_icon.png"
    var home = new google.maps.Marker({
        position: position,
        map: map,
        title: 'vous etes ici',
        icon: h_icon
    });

    center = new google.maps.Marker({
        position: position,
        map: map,
        draggable: true,
    });
    google.maps.event.addListener(center, 'dragend', function ()
    {
        getPlaces()
    });

// get places

    getPlaces()



}


//get location if possible
function getLocation(cb) {
    var info = document.getElementById("info")
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(cb);
    } else {
        info.innerHTML = "Geolocation is not supported by this browser.";
        cb()
    }
}

function setRange()
{
    document.getElementById("range_value").innerHTML = document.getElementById("range").value
    getPlaces()
}


function getPlaces( )
{


    // Specify location, radius and place types for your Places API search.
    var request = {
        location: center.getPosition(),
        radius: document.getElementById("range").value,
        types: ['restaurant'],
        rankby: "distance"
    };
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function (results, status) {
        var places = [];
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length && i < 9; i++) {
                places[places.length] = {name: results[i].name, position: results[i].geometry.location, description: "", type: "Restaurant"}
            }

            printPlaces(places)
        }
        else //message d'erreur
        {
            list.innerHTML = ""
            deleteMarkers()
        }
    });

}
//print a list of places
function printPlaces(places)
{
    //clean
    deleteMarkers()
    list.innerHTML = ""

    speechText("On a trouvé " + places.length + " places");
    for (var i in places)
    {
        printPlace(places[i], +i + 1)
        speechText("Place " + (+i + 1));
        speechText(places[i].name);
    }
}

//print a place
function printPlace(place, num)
{
    var list = document.getElementById("list")

    var marker = new google.maps.Marker({
        position: place.position,
        map: map,
        title: place.name,
        label: String(num)
    });
    numbPlace = place.length
    marker.placeData = place
    markers[num] = marker


    var infowindow = new google.maps.InfoWindow({
        content: "<div > <h2> " + place.type + "</h2> <p>" + place.description + "</p> </div>"

    });
    list.innerHTML += "<div class=\"place-info\" onmouseover=\"bounce(" + num + ")\" onmouseout=\"stopBounce(" + num + ")\" onclick=\"select(" + num + ")\" ><h2> " + num + " : " + place.name + "</h2> <h3> " + place.type + "</h3> <p>" + place.description + "</p> </div>"


    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });

}

function bounce(num)
{

    markers[num].setAnimation(google.maps.Animation.BOUNCE)
}

function stopBounce(num)
{

    markers[num].setAnimation(null)
}

function speechText(text) {

    if (!document.getElementById("mute").checked)
    {
        var msg_speech = new SpeechSynthesisUtterance();
        msg_speech.lang = 'fr-FR';
        msg_speech.text = text;
        speechSynthesis.speak(msg_speech);
    }
}

function cancelSpeak()
{
    speechSynthesis.cancel()
}

// Retourne si le mot indiqué est dans la string donné
function motDans(str, s)
{
    return str.indexOf(s) > -1;
}

function listeningSpeak()
{
    if (!document.getElementById("mute").checked)
    {
        var rec = new webkitSpeechRecognition();

        // Activation de la reconnaissance continue
        rec.continuous = true;
        rec.lang = 'fr-FR';
        rec.start();
        rec.onresult = function(e)
        {
            for (var i = e.resultIndex; i < e.results.length; ++i)
            {
                if (e.results[i].isFinal)
                {
                    var msg = e.results[i][0].transcript;
                    console.log('Recognised: ' + msg);
                    speechText(e.results[i][0].transcript);
                    if(motDans(msg,"sélection"))
                    {
                        speechText("ça fonctionne");
                        if(motDans(msg,"un"))
                        {
                            if(numbPlace >= 1)
                                select(1);
                        }
                        else if(motDans(msg,"deux"))
                        {
                            if(numbPlace >= 2)
                                select(2);
                        }
                        else if(motDans(msg,"trois"))
                        {
                            if(numbPlace >= 3)
                                select(3);
                        }
                        else if(motDans(msg,"quatre"))
                        {
                            if(numbPlace >= 4)
                                select(4);
                        }
                        else if(motDans(msg,"cinq"))
                        {
                            if(numbPlace >= 5)
                                select(5);
                        }
                        else if(motDans(msg,"six"))
                        {
                            if(numbPlace >= 6)
                                select(6);
                        }
                        else
                        {
                            speechText("Erreur de sélection");
                        }
                    }
                    else if(motDans(msg,"retour"))
                    {
                        backToSearch();
                    }
                    else if(motDans(msg,"recherche"))
                    {
                        backToSearch();
                        // faire recherche sur la map
                    }
                }
            }
        }
    }
}

function select(num)
{
    selected = num
    status = 2
    var list = document.getElementById("list")
    list.innerHTML = "<a onclick=\"backToSearch()\"> Back </a><br /><h2>" + markers[num].placeData.name + "</h2>"
    direction = new google.maps.DirectionsRenderer({
        map: map,
        panel: list// Dom element pour afficher les directions d'itinéraire
    });

    hideMarker()
    center.setVisible(false)
    var request = {
        origin: position,
        destination: markers[num].placeData.position,
        travelMode: google.maps.DirectionsTravelMode.DRIVING // WALKING, BICYCLING
    }
    var directionsService = new google.maps.DirectionsService(); // Service de calcul d'itinéraire
    directionsService.route(request, function (response, status) { // Envoie de la requête pour calculer le parcours
        if (status == google.maps.DirectionsStatus.OK) {
            direction.setDirections(response); // Trace l'itinéraire sur la carte et les différentes étapes du parcours
        }
    });
}

function hideMarker()
{
    for (var m in markers)
    {
        markers[m].setVisible(false)
    }
}

function deleteMarkers()
{
    for (var m in markers)
    {
        markers[m].setMap(null)
    }
    markers = []
}
//go to search mode
function backToSearch()
{
    if (direction)
    {
        direction.setMap(null)
    }
    center.setVisible(true)
    status = 1
    getPlaces()
}



function reset()
{
    deleteMarkers()
    if (direction)
    {
        direction.setMap(null)
    }
}

//save current
function save()
{
    var st
    if (status == 1)
    {
        st = {status: 1, range: range.value, center: center.position}
    }
    else
    {
        st = {status: 2, place: markers[selected].placeData}
    }
    temp = st
}

function load()
{
    reset()
    var st = temp
    if (st.status == 1)
    {
        center.setPosition(st.center)
        map.panTo(st.center)
        range.value = st.range
        range_value.innerHTML = st.range
        backToSearch()
    }
    else
    {
        printPlace(st.place, 0)
        select(0)
    }
}
