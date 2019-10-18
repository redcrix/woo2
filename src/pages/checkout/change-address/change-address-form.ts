import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { CheckoutService } from '../../../providers/service/checkout-service';
import { Values } from '../../../providers/service/values';


@Component({
    templateUrl: 'change-address-form.html'
})
export class ChangeAddressForm {
    
    form: any;
    states: any;
    country: any;
    modeKeys:any;
    zone;

    constructor(public nav: NavController, public service: CheckoutService, params: NavParams, public values: Values) {
      console.log(params);
      this.form = params.data;
      this.form.billing_country = 'NG';
      // this.form = {
      //   billing_state: 'Lekki Phase 1'
      // }

      this.zone = {
        kind: 'key2'
      }

// this.country=params.data.billing_country;

// console.log(this.country);

      this.modeKeys = [
      {
        val : 'Lekki Phase 1'
      },
      {
        val : 'Lekki Phase 2'
      },
      {
        val : 'Victoria Island'
      },
      {
        val : 'Ikoyi'
      },
      {
        val : 'Obalende'
      },
      {
        val :'Niger'
      }
      
      ];

    

      console.log(this.form.state);
      this.values.form = params.data;
      //this.states = this.form.state[this.form.billing_country];
      // this.states = this.form.state['NG'];
    }
    getRegion(countryId) {
        this.states = this.form.state['NG'];
    }
    changeRegion(countryId) {
      console.log(countryId);
        this.form.billing_state = "";
        this.states = this.form.state['NG'];
    }
    saveAddress(){
      console.log(this.form);
      this.values.form = this.form;  
      this.nav.pop();
    }
    dismiss(){
      this.nav.pop();
    }

 
}