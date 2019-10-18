import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number/ngx';

/**
 * Generated class for the PrivateDiningPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-private-dining',
  templateUrl: 'private-dining.html',
})
export class PrivateDiningPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,private callNumber: CallNumber) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PrivateDiningPage');
  }

  Phn_dialer(Numbr){
    this.callNumber.callNumber(Numbr, true)
    .then(res => console.log('Launched dialer!', res))
    .catch(err => console.log('Error launching dialer', err));
}

}
