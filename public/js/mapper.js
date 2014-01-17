(function (global) {
    global.initMap = function () {
        var gmaps = google.maps;
        var lat_lng = new gmaps.LatLng(30.246571, -97.774307);
        var map_options = {
            center: lat_lng,
            zoom: 12
        };
        var map = new gmaps.Map(document.getElementById('map-canvas'), map_options);
        var marker = new gmaps.Marker({
            position: lat_lng,
            visible: true
        });
        marker.setMap(map);

        return {
            updatePosition: function (lat, long) {
                var lat_lng = new gmaps.LatLng(lat, long);
                marker.setPosition(lat_lng);
            }
        };
    };
})(window);
