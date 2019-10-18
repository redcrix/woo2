import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Service } from '../../../providers/service/service';
import { Values } from '../../../providers/service/values';
import { ModalController } from 'ionic-angular';
import { EditAddressForm } from '../edit-address-form/edit-address-form';

@Component({
    templateUrl: 'address.html',
})
export class Address {
    addresses: any;
    address: any;
    status: any;
    form: any;
    constructor(public modalCtrl: ModalController, public nav: NavController, public service: Service, public values: Values) {
        this.service.getAddress()
            .then((results) => this.addresses = results);
    }
    editAddress() {
        this.nav.push(EditAddressForm, this.addresses);
    }
    changeAddress(){
        let modal = this.modalCtrl.create(EditAddressForm, this.addresses);
            modal.onDidDismiss(data => {
                console.log(data);
             this.addresses = this.values.form;
             this.service.saveAddress(this.addresses)
                 .then((results) => {});
            });
        modal.present();
    }
}