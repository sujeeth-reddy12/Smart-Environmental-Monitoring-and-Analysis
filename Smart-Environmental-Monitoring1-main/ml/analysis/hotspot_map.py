import pandas as pd
import folium
from geopy.geocoders import Nominatim
import time


# Load dataset

df = pd.read_csv(
    "data/processed/forecast_dataset.csv"
)


# City-wise average AQI

city_aqi = (
    df.groupby("City")["AQI"]
    .mean()
    .reset_index()
)


print(city_aqi.head())


# Initialize geocoder

geolocator = Nominatim(
    user_agent="aqi_hotspot_map"
)


# Create India map

m = folium.Map(
    location=[22.5, 78.9],
    zoom_start=5
)



# AQI color function

def get_color(aqi):

    if aqi <= 100:
        return "green"

    elif aqi <= 200:
        return "orange"

    else:
        return "red"



# Add every city

for index, row in city_aqi.iterrows():

    city = row["City"]
    aqi = row["AQI"]


    try:

        location = geolocator.geocode(
            city + ", India"
        )


        if location:

            lat = location.latitude
            lon = location.longitude


            folium.CircleMarker(

                location=[
                    lat,
                    lon
                ],

                radius=min(max(aqi/40, 8), 25),

                popup=(
                    f"<b>{city}</b><br>"
                    f"AQI: {aqi:.2f}"
                ),

                color=get_color(aqi),

                fill=True,

                fill_color=get_color(aqi)

            ).add_to(m)


            print(
                city,
                "added"
            )


        else:

            print(
                city,
                "location not found"
            )


        # Avoid geocoder overload

        time.sleep(1)


    except Exception as e:

        print(
            city,
            "error"
        )


# ---------------------------------
# Add AQI Legend
# ---------------------------------

legend_html = """

<div style="
position: fixed;
bottom: 50px;
left: 50px;
width: 220px;
height: 130px;
background-color: white;
border:2px solid grey;
z-index:9999;
font-size:14px;
padding:10px;
">

<b>AQI Pollution Level</b><br><br>

<span style="color:green;">●</span>
0 - 100 : Good<br>

<span style="color:orange;">●</span>
101 - 200 : Moderate<br>

<span style="color:red;">●</span>
200+ : Poor

</div>

"""


m.get_root().html.add_child(
    folium.Element(legend_html)
)
# Save map

m.save(
    "pollution_hotspot_map.html"
)


print(
    "Complete hotspot map generated!"
)