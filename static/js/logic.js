var earthquake_monthdata_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"
var tectonic_info_URL = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json"
//get data
d3.json(earthquake_monthdata_URL, function(data){
    createFeatures(data.features);
});

//Define the function to run each feature
function createFeatures(allearthquakeData){
    var m_earthquakes = L.geoJSON(allearthquakeData,{
        onEachFeature: function(feature,layer){
            layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: " + feature.properties.place +"</h3><hr><p>" + Date(feature.properties.time) + "</p>");
          },
          pointToLayer: function(feature, latlng){
            return new L.circle(latlng,
              {radius: getRadius(feature.properties.mag),
              fillColor: getColor(feature.properties.mag),
              fillOpacity: 0.7,
              color: "#379",
              stroke: true,
              weight: 0.8
            })
          }
    });
    createMap(m_earthquakes);
}

function createMap(m_earthquakes){
    //Define Map Layers

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/outdoors-v11",
        accessToken: API_KEY
      });
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
      });
      var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/dark-v10",
        accessToken: API_KEY
      });

    var baseMaps ={
        "Dark Map": darkmap,
        "Outdoors": outdoors,
        "Satellite": satellite
    };
    var tectonic_info = new.L.LayerGroup();

    var overlayMaps ={
        "Earthquakes": m_earthquakes,
        "Tectonic Plates Info": tectonic_info
    }

    var myMap = L.map("map",{
        center: [37.09, -95.71],
        zoom: 5,
        layers:[satellite,m_earthquakes,tectonic_info]
    });
    d3.json(tectonic_info_URL, function(tectonicinfo){
        L.geoJSON(tectonicinfo,{
            color:"red",
            weight:3
        })
        .addTo(tectonic_info);
    });
    //Add layer control to map
    L.control.layers(baseMaps,overlayMaps,{
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({
        position: "bottomright"
    });
    legend.onAdd = function(myMap){
        var gr = L.DomUtil.create("gr", "legend information"),
        impact_grades =[0,1,2,3,4,5],
        labels =[];
    for (var i=0; i<impact_grades.length; i++){
        gr.innerHTML +=
            '<i style="background:'+getColor(impact_grades[i] + 1) + '"></i>' +
            impact_grades[i] + (impact_grades[i +1] ? '&ndash;' + impact_grades[i+1]+'<br>':'+');
    }
    return gr;
    };
    legend.addTo(myMap);
}
function getColor(magnitude){
    if (magnitude > 5){
        return 'orange'
    }else if (magnitude > 4){
        return 'yellow'
    }else if (magnitude > 3){
        return 'pink'
    }else if (magnitude > 2){
        return 'lightgreen'
    }else if (magnitude > 1){
        return 'green'
    }else{
        return '#59C7CB'
    }
};
function getRadius(magnitude){
    return magnitude * 25000;
};