/* Get Current Location */
window.onload = getLocation; 
function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(locationSuccess, locationError, geo_options);
    }else{
        console.log("현재 위치 없음")
    }
};
// getLocation
var latitude, longitude;
function locationSuccess(p){
    latitude = p.coords.latitude,
    longitude = p.coords.longitude;
    initialize();
}
// locationSuccess
function locationError(error){
    var errorTypes = {
        0 : "에러 확인",
        1 : "허용 안눌렀음",
        2 : "위치가 안잡힘",
        3 : "응답시간 지남"
    };
    var errorMsg = errorTypes[error.code];
}
// locationError
var geo_options = {
  enableHighAccuracy: true,
  maximumAge        : 30000,
  timeout           : 27000
};
// geo_options
var map;
let service;
function initialize() {
    var myLatLng = new google.maps.LatLng(latitude, longitude);
    var mapOptions = {
        zoom: 16,
        center: myLatLng
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(
        { location: myLatLng, radius: 2000, type: 'hospital' },
        (results, status, pagination) => {
            if (status !== "OK" || !results) return;
            createMarker(results, map);
            if (pagination && pagination.hasNextPage) {
                getNextPage = () => {
                    pagination.nextPage();
                }
            }
        }
    );
}
function createMarker(places, map) {
    for (const place of places) {
        if (place.geometry && place.geometry.location) {
            //console.log(place);//
            console.log(place.rating);//
            var contentString = place.name;
            if(place.rating == 'undefined') {
                contentString += '<br>(별점 없음)<br>';
            } else {
                contentString += '<br>평점: ' + place.rating + '점<br>';
            }
                //place.vicinity + '<br><br><a href="' +
                //place.website + '">바로 가기</a>';
            const infowindow = new google.maps.InfoWindow({
                content: contentString,
            });
            const marker = new google.maps.Marker({
                map,
                title: place.name,
                position: place.geometry.location,
            });
            marker.addListener("click", () => {
                infowindow.open({
                    map,
                    anchor: marker,
                    shouldFocus: false,
                });
            });
        }
    }
}
