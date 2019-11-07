import { Injectable } from '@angular/core';

@Injectable()
export class Values {

  count: number = null;
  isLoggedIn: boolean = false;
  customerName: string = "";
  customerId: number = null;
  listview: boolean = false;
  cart: Array<number> = [];
  filterUpdate: boolean = false;
  lan: any;
  logoutUrl: any;
  cartItem: any = [];
  cartItems: any = [];
  cartNonce: any;
  avatar: any;
  currency: any = "USD";
  data: any;
  dir: any = 'left';
  deviceId: any;
  platform: any;
  wishlistId: any = [];
  quantity: number = 2;
  max_price: any;
  orders: any = [];
  attributes: any;
  attributeTerms: any = [];
  setNavigation: boolean = false;
  form: any = {};
  filter: any;
  applyFilter: boolean = false;
  selectedFilter: any = {};
  price: any = {lower: 1, upper: 1000};
  sortType: any;
  dimensions: any = {imageGridViewHeight: 50, imageProductViewHeight: 100, scrollProductHeight: 100, productSliderWidth : 42};
  settings: any = {"show_featured":"1","show_onsale":"1","show_latest":"1","pull_to_refresh":"1","onesignal_app_id":"","google_project_id":"","google_web_client_id":"","rate_app_ios_id":"","rate_app_android_id":"","rate_app_windows_id":"","share_app_android_link":"","share_app_ios_link":"","support_email":"","image_height":"90","product_slider_width":"42","enable_product_chat":"0","enable_home_chat":"0","whatsapp_number":"","language":"english"};
  constructor() {
    this.data = {};
    this.sortType = 0;
    this.logoutUrl = "";
    this.avatar = "assets/image/shop-icon.jpg";
  }
  updateCart(crt) {
       this.cartItem = crt.cart_contents;
       this.cart = [];
       this.count = 0;
       for (let item in crt.cart_contents) {
           this.cart[crt.cart_contents[item].product_id] = parseInt(crt.cart_contents[item].quantity);
           this.count += parseInt(crt.cart_contents[item].quantity);
       }
   }
   updateCartTwo(crt) {
       this.cart = [];
       this.count = 0;
       this.cartItem = crt;
       for (let item in crt) {
           this.cart[crt[item].product_id] = parseInt(crt[item].quantity);
           this.count += parseInt(crt[item].quantity);
       }
   }
   calc(width){
      var devide = this.getDevide(width);
      this.dimensions.imageGridViewHeight = this.settings.image_height/100 * (width/devide);
      if(width >= 769){
        this.dimensions.productSliderWidth = this.settings.product_slider_width * 0.7;
        this.dimensions.imageProductViewHeight = (this.settings.image_height/100 * 0.6) * width;
      } 
      else {
        this.dimensions.imageProductViewHeight = this.settings.image_height/100 * width;
        this.dimensions.productSliderWidth = this.settings.product_slider_width;
      }  
      this.dimensions.scrollProductHeight = this.settings.image_height/100 * (((width - 45) * this.dimensions.productSliderWidth/100));
      this.dimensions.imageListViewHeight = (100/this.settings.image_height * 9);
   }
   getDevide(width){
      if (width >= 1025) {
        return 5;
      }
      if (width >= 769) {
        return 4;
      }
      if (width >= 481) {
        return 3;
      }   
      else {
        return 2;
      }
   }
 }