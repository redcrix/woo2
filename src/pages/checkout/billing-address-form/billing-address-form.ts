import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { CheckoutService } from '../../../providers/service/checkout-service';
import { Functions } from '../../../providers/service/functions';
import { Values } from '../../../providers/service/values';
import { ModalController } from 'ionic-angular';
import { OrderSummary } from '../order-summary/order-summary';
import { TermsCondition } from '../terms-condition/terms-condition';
import { ChangeAddressForm } from '../change-address/change-address-form';
import { TranslateService } from '@ngx-translate/core';
import {  LoadingController } from 'ionic-angular/index';

@Component({
    templateUrl: 'billing-address-form.html'
})
export class BillingAddressForm {
    billingAddressForm: any;
    billing: any;
    regions: any;
    status: any;
    errorMessage: any;
    address: any;
    form: any;
    states: any;
    OrderReview: any;
    loginData: any;
    id: any;
    couponStatus: any;
    showCreateAccont: boolean = false;
    buttonSubmit: boolean = false;
    buttonSubmitLogin: boolean = false;
    PlaceOrder: any;
    buttonText1: any;
    LogIn: any;
    mydate: any;
    time: any;
    date: any;
    selectedDate: any;
    shipping: any;
    order: any;
    buttonText : any;
    chosen_shipping: any;
    hour: any;
    showPasswordEnable: boolean = false;
    lan: any = {};
    CheckOut_on_payment = false;
    loadingPopup:any;

    constructor(private loadingCtrl: LoadingController,public translate: TranslateService, public modalCtrl: ModalController, public iab: InAppBrowser, public nav: NavController, public service: CheckoutService, params: NavParams, public functions: Functions, public values: Values) {
        
        this.loadingPopup = this.loadingCtrl.create({
            content: 'Loading data...'
          });

          


        this.PlaceOrder = "Place Order";
        this.buttonText1 = "Apply";
        this.LogIn = "LogIn";
        this.loginData = [];
        this.form = params.data;
        this.billing = {};
        this.billing.save_in_address_book = true;
        this.form.shipping = true;
        this.shipping = {};
        this.shipping.save_in_address_book = true;
        this.getRegion(this.form.billing_country);
        this.hour = new Date().getHours();
        this.hour = this.hour + 1;
        this.validateAddressForm();
    }

    ngOnInit() {

        // console.log('CHECK BILLING METHOD = = '+ JSON.stringify(this.form));

        console.log('CHECK BILLING METHOD = = '+ JSON.stringify(this.form.payment));

        this.translate.get(['Success', 'LoginSuccessMessage', 'ErrorTitle', 'ErrorMessage', 'Status']).subscribe(translations => {
            this.lan.Success = translations.Success;
            this.lan.LoginSuccessMessage = translations.LoginSuccessMessage;
            this.lan.ErrorTitle = translations.ErrorTitle;
            this.lan.ErrorMessage = translations.ErrorMessage;
            this.lan.Status = translations.Status;
        })
    }

    getRegion(countryId) {
        this.states = this.form.state[countryId];
        this.service.updateOrderReview(this.form)
            .then((results) => this.handleOrderReviews(results));
    }
    handleOrderReviews(results){
      this.OrderReview = results; 
      this.form.chosen_shipping = this.OrderReview.chosen_shipping;
    }
    changeRegion(countryId) {
        this.form.billing_state = "";
        this.states = this.form.state[countryId];
    }
    checkout() {
        this.buttonSubmit = true;
        this.PlaceOrder = "Placing Order";

        this.loadingPopup.present();
       
        console.log(this.form.payment_method);
        console.log(this.form.payment[this.form.payment_method].id);


        if (this.form.shipping) {
            this.form.shipping_first_name = this.form.billing_first_name;
            this.form.shipping_last_name = this.form.billing_last_name;
            this.form.shipping_company = this.form.billing_company;
            this.form.shipping_address_1 = this.form.billing_address_1;
            this.form.shipping_address_2 = this.form.billing_address_2;
            this.form.shipping_city = this.form.billing_city;
            this.form.shipping_country = this.form.billing_country;
            this.form.shipping_state = this.form.billing_state;
            this.form.shipping_postcode = this.form.billing_postcode;
        }
        if (this.form.payment_method == 'bacs' || this.form.payment_method == 'cod') {
            this.service.checkout(this.form)
                .then((results) => this.handleBilling(results));
        }
        else if (this.form.payment_method == 'stripe') {
            this.service.getStripeToken(this.form)
                .then((results) => this.handleStripeToken(results));
        }

        else if (this.form.payment_method == 'cheque') {

            this.service.checkout(this.form)
            .then((results) => this.handleBilling(results));


            // this.handle_PayStack();
            // this.getPayStackToken(this.form);

            // if(this.CheckOut_on_payment){

            //     alert('This To Be Work?');
              
            // }
            // .then((results) => this.handleStripeToken(results));


            console.log('Custom payment - -');
            // this.service.checkout(this.form)
            // .then((results) => this.handleBilling(results));

            // this.ChargeCard();

        }


        else {


            this.service.checkout(this.form)
                .then((results) => this.handlePayment(results));

                setTimeout(() => {
                    this.loadingPopup.dismiss();
                  }, 6000);

        }
    }
    handlePayment(results) {
        if (results.result == 'success') {
            var options = "location=no,hidden=yes,toolbar=yes";
            let browser = this.iab.create(results.redirect, '_blank', options);
            browser.show();
            browser.on('loadstart').subscribe(data => {
                if (data.url.indexOf('order-received') != -1 && data.url.indexOf('?key=wc_order') != -1) {
                    this.values.cart = [];
                    this.values.count = 0;
                    var str = data.url;
                    var pos1 = str.lastIndexOf("/order-received/");
                    var pos2 = str.lastIndexOf("/?key=wc_order");
                    var pos3 = pos2 - (pos1 + 16);
                    var order_id = str.substr(pos1 + 16, pos3);
                    this.nav.push(OrderSummary, order_id);
                    browser.hide();
                }
                else if (data.url.indexOf('cancel_order=true') != -1 || data.url.indexOf('cancelled=1') != -1 || data.url.indexOf('cancelled') != -1) {
                    browser.close();
                    this.buttonSubmit = false;
                }    
            });
            browser.on('exit').subscribe(data => {
                this.buttonSubmit = false;
            });
        }
        else if (results.result == 'failure') {
            this.functions.showAlert(this.lan.Status, results.messages);
            this.buttonSubmit = false;
        }
    }
    checkoutStripe() {
        this.buttonSubmit = true;
        this.PlaceOrder = "Placing Order";
        this.service.getStripeToken(this.form)
            .then((results) => this.handleStripeToken(results));
    }
    handleStripeToken(results) {
        if (results.error) {
            this.buttonSubmit = false;
            this.PlaceOrder = "Place Order";
            this.functions.showAlert(this.lan.ErrorTitle, results.error.message);
        }
        else {
            this.service.stripePlaceOrder(this.form, results)
                .then((results) => this.handleBilling(results));
                this.buttonSubmit = false;
        }
    }

    handle_PayStack(results){
        if (results.error) {
            this.buttonSubmit = false;
            this.PlaceOrder = "Place Order";
            this.functions.showAlert(this.lan.ErrorTitle, results.error.message);
        }
        else {
            this.service.stripePlaceOrder(this.form, results)
                .then((results) => this.handleBilling(results));
                this.buttonSubmit = false;
        }
    }
    handleBilling(results) {
        if (results.result == "success") {
            var str = results.redirect;
            var pos1 = str.lastIndexOf("order-received/");
            var pos2 = str.lastIndexOf("?key=wc_order");
            var pos3 = pos2 - (pos1 + 15);
            var order_id = str.substr(pos1 + 15, pos3);
            this.nav.push(OrderSummary, order_id);
        }
        else if (results.result == "failure") {
            this.functions.showAlert(this.lan.ErrorTitle, results.messages);
        }
        this.buttonSubmit = false;
        this.PlaceOrder = "Place Order";
    }
    login() {
        if (this.validateForm()) {
            this.buttonSubmitLogin = true;
            this.LogIn = "Please Wait";
            this.service.login(this.form)
                .then((results) => this.handleResults(results));
        }
    }
    validateForm() {
        if (this.form.username == undefined || this.form.username == "") {
            return false
        }
        if (this.form.password == undefined || this.form.password == "") {
            return false
        }
        else {
            return true
        }
    }
    handleResults(results) {
        this.buttonSubmitLogin = false;
        this.LogIn = "LogIn";
        this.form.shipping = true;
        if (results.user_logged) {
            this.form = results;
            this.states = this.form.state[this.form.billing_country];
            this.values.isLoggedIn = results.user_logged;
            this.values.customerName = results.billing_first_name;
            this.values.customerId = results.user_id;
            this.values.logoutUrl = results.logout_url;
        }
        else {
            this.functions.showAlert(this.lan.ErrorTitle, this.lan.ErrorMessage);
        }
    }
    createAccount() {
        this.showCreateAccont = true;
    }
    changePayment() {

        this.form.payment_instructions = this.form.payment[this.form.payment_method].description;

        // let Log = this.form.payment[this.form.payment_method];



        console.log('TWO = '+ this.form.payment_instructions);

        this.buttonSubmit = false;
        this.buttonText = "Continue to " + this.form.payment[this.form.payment_method].method_title;
    }

    terms(){
        this.nav.push(TermsCondition, this.form.terms_content);
    }
    updateShipping() {
        this.service.updateShipping(this.chosen_shipping)
            .then((results) => this.handleChanegShipping());
    }
    handleChanegShipping(){
        this.service.updateOrderReview(this.form)
            .then((results) => this.handleOrderReviews(results));
    }    
    changeAddress(){
        let modal = this.modalCtrl.create(ChangeAddressForm, this.form);
            modal.onDidDismiss(data => {
             this.form = this.values.form;
             this.service.updateOrderReview(this.form)
                .then((results) => this.handleOrderReviews(results));
            });
        modal.present();
    }
    showPassword(){
        this.showPasswordEnable = true; 
    }
    hidePassword(){
        this.showPasswordEnable = false; 
    }
    validateAddressForm(){
        if(!this.form.billing_first_name || !this.form.billing_last_name || !this.form.billing_address_1 || !this.form.billing_city || !this.form.billing_postcode)
        this.changeAddress();
    }
    updateOrderReview() {
        this.service.updateOrderReview(this.form)
            .then((results) => this.handleOrderReviews(results));
    }



    ChargeCard(){

    

        console.log("card[number]", this.form.stripe_number);
        console.log("card[cvc]", this.form.stripe_code);
        console.log("card[exp_month]", this.form.stripe_exp_month);
        console.log("card[exp_year]", this.form.stripe_exp_year);

    
 

             
    
          
    
  
    
      }


      getPayStackToken(form) {

        this.loadingPopup.present();


        var params = new URLSearchParams();
        // params.append("key", form.payment.stripe.publishable_key);
        params.append("payment_user_agent", 'stripe.js/6ea8d55');
        params.append("card[number]", form.stripe_number);
        params.append("card[cvc]", form.stripe_code);
        params.append("card[exp_month]", form.stripe_exp_month);
        params.append("card[exp_year]", form.stripe_exp_year);
        params.append("card[name]", form.billing_first_name + form.billing_last_name);
        params.append("card[address_line1]", form.billing_address_1);
        params.append("card[address_line2]", form.billing_address_2);
        params.append("card[address_state]", form.billing_state);
        params.append("card[address_city]", form.billing_city);
        params.append("card[address_zip]", form.billing_postcode);
        params.append("card[address_country]", form.billing_country);



        
        // return new Promise(resolve => {

        

            let card = '4084 0840 8408 4081';
    
            let month = '10';
        
            let cvc = '408';
        
            let year = '2020';
        
            let amount = '200';
        
            let email = 'hello@redcrix.com';

          // Now safe to use device APIs

          (<any>window).window.PaystackPlugin.chargeCard(

            (resp) =>{
                // reference
              //this.pop.showPayMentAlert(“Payment Was Successful”, “We will Now Refund Your Balance”);
  
              setTimeout(() => {
                this.loadingPopup.dismiss();
              }, 1000);

              this.CheckOut_on_payment = true;
              setTimeout(() => {
                this.service.checkout(this.form)
              .then((results) => this.handleBilling(results));

              }, 3000);


           

            //   var str = results.redirect;
            //   var pos1 = str.lastIndexOf("order-received/");
            //   var pos2 = str.lastIndexOf("?key=wc_order");
            //   var pos3 = pos2 - (pos1 + 15);
            //   var order_id = str.substr(pos1 + 15, pos3);
            //   this.nav.push(OrderSummary, order_id);

            //   this.functions.showAlert('Payment Successful, OrderID:', resp);

            //   console.log('charge successful: ', resp);
            //  this.service.checkout(this.form)
            //   .then((results) => this.handleBilling(results));
   
            //   resolve(resp);
            },

            (resp) =>{


                setTimeout(() => {
                    this.loadingPopup.dismiss();
                  }, 1000);


                this.CheckOut_on_payment = false;

                this.buttonSubmit = false;
                 this.functions.showAlert('Encountered An Error paying with card', JSON.stringify(resp) );
               this.PlaceOrder = "Place Order";

                // resolve(resp);
                
            },

            {

              cardNumber: card,
                  expiryMonth: month,
                   expiryYear: year,
                    cvc: cvc,
                       email: email,
                           amountInKobo: amount,

          })

        // });
    }

}