import '../HomeMobile.css';
import React, { useState } from 'react';
import GooglePlacesAutocomplete, { geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateRight, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-simple-toasts';

export default function HomeMobile () {
    const [city, setCity] = useState(null);                     // Estado nombre de ciudad
    const [cityWeather, setCityWeather] = useState(null);       // Estado clima de ciudad
    const [isVisible, setIsVisible] = useState(false);          // Estado control de vistas

    const keyGoogle = 'AIzaSyBX4gFMavVm_ursO1U8ZOHkrJH-BF4nLPA';
    const keyWeather = 'fc8ff9f409f52b1cc6757e25a0ceac04';

    // Función para consultar el clima y exportar datos
    async function queryWeather ({ lat, lng }) {
        try {
            if (lat & lng) {
                var urlWeather = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&lang=es&appid=${keyWeather}`;
                var data = await (await fetch(urlWeather)).json();
        
                var urlGoogle = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=0&key=${keyGoogle}`;
                var dateTime = await (await fetch(urlGoogle)).json();

                if (data.cod == '200') {
                    let dateNow = new Date();                                                               // Time actual
                    let timestampNow = dateNow.getTime();                                                   // Timestamp actual local
                    let timestampUtc = timestampNow + 10800000;                                             // -3GMT = 10800, *1000 mseg a seg
                    let timestampCity = timestampUtc + dateTime.dstOffset*1000 + dateTime.rawOffset*1000;   // Timestamp UTC + horario de verano + GMT
                    let timeCity = new Date(timestampCity);                                                 // Timestamp de la ciudad buscada
            
                    let hour = timeCity.getHours();                     // Agregar 0 a la izquierda en horas
                    if (hour < 10) { hour = '0' + hour; };
                    let minutes = timeCity.getMinutes();                // Agregar 0 a la izquierda en minutos
                    if (minutes < 10) { minutes = '0' + minutes; };
            
                    let time = `${hour}:${minutes} hs.`;
                    let date = `${timeCity.getDate()}/${timeCity.getMonth()}/${timeCity.getFullYear()}`; 
                    
                    var weather = {                                     // Objeto resultante, objetivo
                        sky:        data.weather[0].description,
                        icon:       data.weather[0].icon,
                        temp:       data.main.temp.toFixed(1),
                        feels_like: data.main.feels_like.toFixed(1),
                        temp_max:   data.main.temp_max.toFixed(1),
                        temp_min:   data.main.temp_min.toFixed(1),
                        humidity:   data.main.humidity,
                        pressure:   data.main.pressure,
                        windSpeed:  (data.wind.speed * 3600) / 1000,            // mts/seg --> km/h
                        visibility: data.visibility / 1000,                     // mts --> kms
                        time:       time,
                        date:       date,
                    };
            
                    setCityWeather(weather);
                    setIsVisible(true);
                } else {
                    toast('Fuera de servicio, intente más tarde.', 1500);       // Api no responde, !=200
                };
            } else {
                toast('Error al cargar la ciudad, intente con otra.', 1500);    // Lat o Lng incorrectos
            };
        } catch (error) {
            toast('Error al cargar la ciudad.', 1500);
            toast('Lo sentimos, intente más tarde.', 1500);
        };
    };

    // Función para obtener la geolocalización de la ciudad ingresada
    function getCityData () {
        try {
            if (!city) {
                toast('Seleccione una ciudad por favor.', 1500);        // No ingresó ciudad
            } else {
                try {
                    geocodeByPlaceId(city.value.place_id)
                    .then(results => getLatLng(results[0]))
                    .then(({ lat, lng }) =>
                        queryWeather({ lat, lng })
                    );
                } catch (error) {
                    toast('Fuera de servicio, intente más tarde.', 1500);
                };
            };
        } catch (error) {
            toast('Error al cargar la ciudad.', 1500);
            toast('Lo sentimos, intente más tarde.', 1500);
        };
    };

    // Función para resetear condiciones y retornar a vista principal
    function reset () {
        setCity(null);
        setIsVisible(false);
    };

    // Condicional que maneja las vistas
    if (!isVisible) {
        return (
            <div id='containerMob'>
                <div id='cardMob'>
                    <h3 id='titleMob'> ¡ Seleccione una ciudad para consultar el clima ! </h3>
                    
                    <div id='inputContainerMob'>
                        <GooglePlacesAutocomplete
                            apiKey={keyGoogle}
                            apiOptions={{ language: 'es' }}
                            selectProps={{
                                city,
                                onChange: setCity,
                            }}
                        />
                    </div>

                    <button id='btnMob' onClick={() => getCityData()}> Consultar </button>        
                </div>
            </div>
        );    
    } else {
        return (
            <div id='modalScreenMob'>
                <div id='modalCardMob'>
                    <div id='modalHeaderMob'>
                        <div id='iconContainerMob'>
                            <FontAwesomeIcon
                                icon={faArrowRotateRight}
                                id='iconsMob'
                                onClick={() => getCityData()}
                            />
                        </div>

                        <h3 id='titleMob'> {city.label} </h3>

                        <div id='iconContainerMob'>
                            <FontAwesomeIcon
                                icon={faCircleXmark}
                                id='iconsMob'
                                onClick={() => reset()}
                            />
                        </div>
                    </div>

                    <div id='cardBodyMob'>
                        <div id='temperatureMob'>
                            <div>
                                <img src={`http://openweathermap.org/img/wn/${cityWeather.icon}@2x.png`} id='weatherIconsMob'/>
                            </div>
                            {cityWeather.temp} <span id='celsiusMob'> °C </span>
                        </div>
                        
                        <div id='dateTimeContainerMob'>
                            <div id='dateTimeMob'>
                                <div>
                                    {cityWeather.time}
                                </div>
                                <div>
                                    {cityWeather.date}
                                </div>
                                <div>
                                    {cityWeather.sky}.
                                </div>
                                <div>
                                    Humedad: {cityWeather.humidity}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id='detailsMob'>
                        <div id='dataMob'>
                            <div className='itemData'> Sensación Térmica: {cityWeather.feels_like} °C </div>
                            <div className='itemData'> Temperatura Mínima: {cityWeather.temp_min} °C </div>
                            <div className='itemData'> Temperatura Máxima: {cityWeather.temp_max} °C </div>
                            <div className='itemData'> Viento: {cityWeather.windSpeed} km/h </div>
                            <div className='itemData'> Presión: {cityWeather.pressure} hPa </div>
                            <div className='itemData'> Visibilidad: {cityWeather.visibility} km </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
};
