document.getElementById('setTerm').onkeypress = function(e) {
    var event = e || window.event;
    var charCode = event.which || event.keyCode;
    if ( charCode == '13' ) {
        setLocation();
        return false;
    }
};

function setLocation() {
    event.preventDefault();
    makeRequestForMap(document.getElementById("setTerm").value);
}

function viewPhotos(){
    makeRequestForPhotos(currentKey);
}

var currentKey = {};

setPoints = function(results){
    document.getElementById("info").innerHTML = "View Photos from Flickr!";
    results.forEach(function(key){
        var myLatLng = {lat: key.lat, lng: key.lon};
        var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            title: key.name
        });
        google.maps.event.addDomListener(marker, 'click', function() {
            currentKey = key;
            document.getElementById("info").style.display = "block";
            document.getElementById("descrip").style.display = "block";
            document.getElementById("title").innerHTML = key.name;
            var descrip = "No Description Available";
            if(key.description != null) descrip = key.description;
            document.getElementById("descrip").innerHTML = descrip;
            removePhotos();
        });
    });

    try {
        map.setCenter({lat: results[0].lat, lng: results[0].lon});
        map.setZoom(11);
    } catch(err){
        alert("City not found. Please try again.");
    }
};

makeRequestForMap = function(place) {
    var cityPart = place.split(' ').join('+');
    var url = "https://trailapi-trailapi.p.mashape.com/?limit=50&q[city_cont]=" + cityPart + "&radius=1200";
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.setRequestHeader('X-Mashape-Key', 'JwTKoEqkTbmsh3eqT0fBweCHYIAUp1h1GCbjsnkh59Bok0iqOC');
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status >= 200 && req.status < 400) {
                var response = JSON.parse(req.responseText);
                setPoints(response.places);

            } else {
                alert("Failed to load " + req.status);
            }
        }
    };
    req.send();
};

makeRequestForPhotos = function(place){
    var placeName = place.name.split(' ').join('+');
    var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&" +
        "api_key=2ef88ff6ca46f56cbf9339d76bd44254&tags=" + placeName + "&format=json&nojsoncallback=1=1";
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status >= 200 && req.status < 400) {
                var response = JSON.parse(req.responseText);
                console.log (response);
                var photoUrlArr = response.photos.photo.map(function(key){
                    return "https://farm" + key.farm + ".staticflickr.com/" + key.server + "/" + key.id +
                        "_" + key.secret + ".jpg";
                });

                setPhotos(photoUrlArr);

            } else {
                alert("Failed to load " + req.status);
            }
        }
    };
    req.send();
};

var map;
function initializeMap() {
    var mapProp = {
        center:new google.maps.LatLng(36.1700,-119.7462),
        zoom:5,
        mapTypeId:google.maps.MapTypeId.ROADMAP
    };
    map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
}

google.maps.event.addDomListener(window, 'load', initializeMap);

function setPhotos(arr){
    var list = document.getElementById("photoTable");
    console.log(arr);
    for (var i in arr) {
        if(i%3==0){
            var row = document.createElement("tr");
            list.appendChild(row);
        }
        var item = document.createElement("td");
        row.appendChild(item);
        var photo = document.createElement("img");
        photo.src = arr[i];
        photo.className = "img-table";
        item.appendChild(photo);
    }
}

function removePhotos(){
    var myNode = document.getElementById("photoTable");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}
