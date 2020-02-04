import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform } from 'ionic-angular';
//import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions } from '@ionic-native/google-maps';
import { CallNumber } from '@ionic-native/call-number/ngx';
declare var google: any;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {
    myLocation: any = {};
    marker: any;
    locations: any = [];
    //map: GoogleMap;
    @ViewChild('mapCanvas') mapElement: ElementRef;
    constructor(public platform: Platform,private callNumber: CallNumber) {
       // this.myLocation.lat = 34.0522;
       // this.myLocation.lng = -118.2437;

    this.locations = [{
        "name": "Foodies",
        "lat": 6.4455982,
        "lng": 3.459396,
        "center": true
      }];

    }
    ionViewDidLoad() {
        

        let mapEle = this.mapElement.nativeElement;
        let map = new google.maps.Map(mapEle, {
            center: this.locations.find((d: any) => d.center),
            zoom: 16
        });
        this.locations.forEach((markerData: any) => {
            let infoWindow = new google.maps.InfoWindow({
                content: `<h5>${markerData.name}</h5>`
            });
            let marker = new google.maps.Marker({
                position: markerData,
                map: map,
                title: markerData.name
            });
            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        });
        google.maps.event.addListenerOnce(map, 'idle', () => {
            mapEle.classList.add('show-map');
        });

        /*let mapOptions: GoogleMapOptions = {
            camera: {
                target: {
                    lat: this.myLocation.lat,
                    lng: this.myLocation.lng
                },
                zoom: 12,
                tilt: 30
            }
        };
        this.map = GoogleMaps.create('map_canvas', mapOptions);
        this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
            console.log('Map is ready!');
            this.map.addMarker({
                    title: 'Monona Terrace Convention Center',
                    animation: 'DROP',
                    draggable: true,
                    position: {
                        lat: this.myLocation.lat,
                        lng: this.myLocation.lng
                    }
                }).then(marker => {
                
            });
        });*/
    }


    Phn_dialer(Numbr){

 
        
        console.log();
        
        this.callNumber.callNumber(Numbr, true)
        .then(res => alert( JSON.stringify(res)))
        .catch(err => alert(JSON.stringify(err)));
    }

    Phn_dialer2(Numbr){

    window.open(`tel:`+Numbr, '_system');

    }
   
}