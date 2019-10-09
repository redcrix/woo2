import {Component} from '@angular/core';
import {NavController, ToastController } from 'ionic-angular';
import {Service} from '../../providers/service/service';
import { Values } from '../../providers/service/values';
import { Functions } from '../../providers/service/functions';
import { ProductsPage } from '../products/products';
import { SearchPage } from '../search/search';
import { CartPage } from '../cart/cart';
import { ProductPage } from '../product/product';
import { Post } from '../post/post';
//import { Vibration } from '@ionic-native/vibration';

@Component({
    templateUrl: 'home.html'
})
export class Home {

    items: any;
    loading: boolean = true;
    tabBarElement: any;
    constructor(public toastCtrl: ToastController, public nav: NavController, public service: Service, public values: Values, public functions: Functions/*, private vibration: Vibration*/) {
        this.items = [];
        if(document.querySelector(".tabbar"))
        this.tabBarElement = document.querySelector(".tabbar")['style'];
    }
    doRefresh(refresher){
        this.service.load().then((results) => {
            this.handleService(results);
            refresher.complete();
        });
    }
    handleService(results){
       // 
    }
    getCategory(id, slug, name) {
        this.items.id = id;
        this.items.name = name;
        this.items.slug = slug;
        this.items.categories = this.service.categories;
        this.nav.push(ProductsPage, this.items);
    }
    getCart() {
        this.nav.push(CartPage);
    }
    getSearch() {
        this.nav.push(SearchPage);
    }
    mySlideOptions = {
        initialSlide: 1,
        loop: true,
        autoplay: 5800,
        pager: true
    }
    getProduct(item) {
        this.nav.push(ProductPage, item.id);
    }
    presentToastLoginAlert() {
        let toast = this.toastCtrl.create({
          message: 'You must login to add item to wishlist',
          duration: 1000,
           position: 'top'
        });
        toast.present();
    }
    removeFromWishlist(id) {
        this.values.wishlistId[id] = false;
        this.service.deleteItem(id).then((results) => this.updateWish(results, id));
    }
    updateWish(results, id) {
        if (results.status == "success") {
            this.values.wishlistId[id] = false;
        }
    }
    viewAllFeatured() {
        this.nav.push(ProductsPage, {filter: {featured: true}});
    }
    goto(data){
        if(data.description == "product"){
            this.nav.push(ProductPage, data.url);   
        }
        else if(data.description == "category"){
            this.items.id = data.url;
            this.items.name = data.title;
            this.items.categories = this.service.categories;
            this.nav.push(ProductsPage, this.items);
        }

        else if(data.description == "post"){
            this.nav.push(Post, data.url);
        }
    }
    doInfinite(infiniteScroll) {
        this.service.loadMore().then((results) => {infiniteScroll.complete()});
    }
    hideLoading(){
        this.loading = false;
    }
    getSubCategories(id){
        const results = this.service.categories.filter(item => item.parent === parseInt(id));
        return results;
    }
    ionViewWillEnter() {
        if (document.querySelector(".tabbar")) this.tabBarElement.display = 'flex';
    }
}