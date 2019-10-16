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

    constructor(public translate: TranslateService, public modalCtrl: ModalController, public iab: InAppBrowser, public nav: NavController, public service: CheckoutService, params: NavParams, public functions: Functions, public values: Values) {
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
        if (this.form.payment_method == 'bacs' || this.form.payment_method == 'cheque' || this.form.payment_method == 'cod') {
            this.service.checkout(this.form)
                .then((results) => this.handleBilling(results));
        }
        else if (this.form.payment_method == 'stripe') {
            this.service.getStripeToken(this.form)
                .then((results) => this.handleStripeToken(results));
        }
        else {
            this.service.checkout(this.form)
                .then((results) => this.handlePayment(results));
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

        let card = '10101010101010';
    
        let month = '10';
    
        let cvc = '123';
    
        let year = '2020';
    
        let amount = '200';
    
        let email = 'shubam@redcrix.com';
    
      console.log(card);
    
        console.log(month);
    
          console.log(cvc);
    
            console.log(year);
    
              console.log(amount);
    
                console.log(email);
    
    
              // Now safe to use device APIs
    
              (<any>window).window.PaystackPlugin.chargeCard(
    
                (resp) =>{
    
                  //this.pop.showPayMentAlert(“Payment Was Successful”, “We will Now Refund Your Balance”);
    
                  console.log('charge successful: ', resp);
    
                  alert('Payment Was Successful' );
    
                },
    
                (resp) =>{
    
            
    
               alert('We Encountered An Error While Charging Your Card'+resp );
    
                },
    
                {
    
                  cardNumber: card,
    
                  expiryMonth: month,
    
                  expiryYear: year,
    
                  cvc: cvc,
    
                  email: email,
    
                  amountInKobo: amount,
    
              })
    
          
    
  
    
      }

}