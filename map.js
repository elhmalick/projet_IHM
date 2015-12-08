



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
        content: "<div > <h3> " + place.name + "</h3>  </div>"

    });
     list.innerHTML += "<div id=\"bordure\"class=\"place-info\" onmouseover=\"bounce(" + num + ")\" onmouseout=\"stopBounce(" + num + ")\" onclick=\"select(" + num + ")\" style=\"cursor: pointer;color:#\"  ><h3> " + num + " : " + place.name + "</h3>  </div>"
   
   //     list.innerHTML += "<button type=\"button\" class=\"btn btn-default\" id=\"bordure\"class=\"place-info\" onmouseover=\"bounce(" + num + ")\" onmouseout=\"stopBounce(" + num + ")\" onclick=\"select(" + num + ")\" > <h3> " + num + " : " + place.name + "</h3> </button>"

    
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

    if (document.getElementById("mute").checked)
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
                    if(motDans(msg,"sélection"))
                    {
                        if(motDans(msg,"un"))
                        {
                            select(1);
                        }
                        else if(motDans(msg,"2"))
                        {
                            select(2);
                        }
                        else if(motDans(msg,"3"))
                        {
                            select(3);
                        }
                        else if(motDans(msg,"4"))
                        {
                            select(4);
                        }
                        else if(motDans(msg,"5"))
                        {
                            select(5);
                        }
                        else if(motDans(msg,"6"))
                        {
                            select(6);
                        }
                        else if(motDans(msg,"7"))
                        {
                            select(7);
                        }
                        else if(motDans(msg,"8"))
                        {
                            select(8);
                        }
                        else if(motDans(msg,"9"))
                        {
                            select(9);
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
    list.innerHTML = "<button type=\"button\" class=\"btn btn-primary\" onclick=\"backToSearch()\"> Retour </button> <br /><h2>" + markers[num].placeData.name + "</h2>"
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
    
    var xhr = new XMLHttpRequest
    xhr.open("POST","http://geekompagny.ddns.net/mm/projet_IHM/save.php")
xhr.setRequestHeader ('Content-Type','application/x-www-form-urlencoded')
    xhr.send("user=titou&state="+escape(JSON.stringify(st)))
}

function load()
{
    reset()
        var xhr = new XMLHttpRequest
    xhr.open("GET","http://geekompagny.ddns.net/mm/projet_IHM/user/titou.json")
    xhr.onreadystatechange = function () {
    var st =JSON.parse(xhr.responseText)
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
        xhr.send()
}
