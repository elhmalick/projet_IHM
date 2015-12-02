



/* global google */

var map;
var markers = []
var position
//call by google for map creation
function initMap() {
    getLocation(printMap)
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

// get places

    getPlaces(position, 500,printPlaces)



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

// not implemented
function getPlaces(position,rayon, cb )
{


      // Specify location, radius and place types for your Places API search.
  var request = {
    location: position,
    radius: rayon,
    types: ['store']
  };
     var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function(results,status){
	var places = [];
	 if (status === google.maps.places.PlacesServiceStatus.OK) {
    		for (var i = 0; i < results.length; i++) {
      			places[places.length]={name:results[i].name,position:results[i].geometry.location,description:"",type:"Restaurant"}
           }
	   	
	   cb(places)
         }
         else //message d'erreur
         {}
	});

}
//print a list of places
function printPlaces(places)
{
   // speechText("On a trouvé " + places.length + " places");
    for (var i in places) 
    {
        printPlace(places[i], +i + 1)
        //speechText("Place " + (+i+1));
        //speechText(places[i].name);
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
    marker.placeData=place
    markers[num] = marker


    var infowindow = new google.maps.InfoWindow({
        content: "<div > <h2> " + place.type + "</h2> <p>" + place.description + "</p> </div>"

    });
    list.innerHTML += "<div class=\"place-info\" onmouseover=\"bounce(" + num + ")\" onmouseout=\"stopBounce(" + num + ")\" onclick=\"select("+num+")\" ><h3> " + num + " : " + place.name + "</h3> <h4> " + place.type + "</h4> <p>" + place.description + "</p> </div>"


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
  var msg_speech = new SpeechSynthesisUtterance();
  msg_speech.lang = 'fr-FR';
  msg_speech.text = text;
  speechSynthesis.speak(msg_speech);
}

function select(num)
{
    var list =document.getElementById("list") 
    list.innerHTML=""
      direction = new google.maps.DirectionsRenderer({
    map   : map,
    panel : list// Dom element pour afficher les directions d'itinéraire
  });
  var request = {
            origin      : position,
            destination : markers[num].placeData.position,
            travelMode  : google.maps.DirectionsTravelMode.DRIVING // WALKING, BICYCLING
        }
        var directionsService = new google.maps.DirectionsService(); // Service de calcul d'itinéraire
        directionsService.route(request, function(response, status){ // Envoie de la requête pour calculer le parcours
            if(status == google.maps.DirectionsStatus.OK){
                direction.setDirections(response); // Trace l'itinéraire sur la carte et les différentes étapes du parcours
            }
        });
}
