import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { ProductService } from '../../providers/service/product-service';
import { Values } from '../../providers/service/values';
import { Functions } from '../../providers/service/functions';
import { ModalController } from 'ionic-angular';
import { CartPage } from '../cart/cart';
import { ReviewPage } from '../reviews/reviews';
import {md5} from './md5';
import { TranslateService } from '@ngx-translate/core';
import { Vibration } from '@ionic-native/vibration';

@Component({
    templateUrl: 'product.html'
})
export class ProductPage {
    @ViewChild(Content) content: Content;
    product: any;
    id: any;
    status: any;
    options: any = {};
    opt: any;
    message: any;
    wishlist: any;
    quantity: any;
    reviews: any;
    reviewForm: any;
    nickname: any;
    details: any;
    AddToCart: any;
    disableAddButton: boolean = false;
    wishlistIcon: boolean = false;
    moreDescription: boolean = false;
    disableMinusButton: boolean = false;
    disablePlusButton: boolean = false;
    related: any;
    crossSell: any;
    upsell:any;
    items: any;
    variations: any;
    lan: any = {};
    filter: any = {};
    usedVariationAttributes: any = [];

    constructor(public translate: TranslateService, public modalCtrl: ModalController, public nav: NavController, public service: ProductService, params: NavParams, public functions: Functions, public values: Values, private vibration: Vibration) {
        if(params.data.id){

            console.log('1 ==== '+ params.data.id);

            this.product = params.data;
            this.usedVariationAttributes = this.product.attributes.filter(function (attribute) { return attribute.variation == true });
            this.id = params.data.id;
            this.options.product_id = this.id;
            if ((this.product.type == 'variable') && this.product.variations.length) this.getVariationProducts();
            this.getRelatedProducts();
            this.getUpsellProducts();
            this.getCrossSellProducts();
            this.getReviews();
        }
        else {

           

            this.id = params.data;
            this.options.product_id = this.id;

            console.log('2 ==== '+ this.id);


            this.service.getProduct(this.id)
                .then((results) => this.handleProductResults(results));
        }

       
        this.quantity = 1;
        this.AddToCart = "Add To Cart";
    }

    ngOnInit() {
        this.translate.get(['SelectOption', 'SuccessMessage', 'ErrorTitle', 'LoginError']).subscribe(translations => {
            this.lan.SelectOption = translations.SelectOption;
            this.lan.SuccessMessage = translations.SuccessMessage;
            this.lan.ErrorTitle = translations.ErrorTitle;
            this.lan.LoginError = translations.LoginError;
        })
    }
    handleProductResults(results) {
        this.product = results;
        if ((this.product.type == 'variable') && this.product.variations.length) {
            this.usedVariationAttributes = this.product.attributes.filter(function (attribute) { return attribute.variation == true });
            this.getVariationProducts();
        }    
        this.getRelatedProducts();
        this.getUpsellProducts();
        this.getCrossSellProducts();
    }
    getVariationProducts() {
        this.service.getVariationProducts(this.product.id).then((results) => this.variations = results);
    }
    getProduct(id) {
        this.nav.push(ProductPage, id);
    }
    addToCart(id) {
        if (this.setVariations()) {
            this.vibration.vibrate(500);
            this.disableAddButton = true;
            this.service.addToCart(this.options).then((results) => this.updateCart(results));
        }
    }
    setVariations(){
        this.product.attributes.forEach(item => {
            if(item.selected){
                this.options['variation[attribute_pa_' + item.name + ']'] = item.selected;
            }
        })
        for(var i = 0; i < this.product.attributes.length; i++){
            if(this.product.attributes[i].variation && this.product.attributes[i].selected == undefined){
                this.functions.showAlert('Options', 'Please select product ' + this.product.attributes[i].name  + ' option');
                return false;
            }
        }
        return true;
    }
    deleteFromCart() {
        this.disableMinusButton = true;
        this.vibration.vibrate(500);
        this.service.deleteFromCart(this.product.id).then((results) => this.handleDeleteFromCart(results));
    }
    handleDeleteFromCart(results) {
        this.disableMinusButton = false;
    }
    updateToCart() {
        this.disablePlusButton = true;
        this.vibration.vibrate(500);
        this.service.updateToCart(this.product.id).then((results) => this.handleAddToCart(results));
    }
    handleAddToCart(results) {
        this.disablePlusButton = false;
    }
    changeProduct() {
        var text = '{';
        var i;
        for (i = 0; i < this.options.length; i++) {
            var res = this.options[i].split(":");
            for (var j = 0; j < res.length; j = j + 2) {
                text += '"' + res[j] + '":"' + res[j + 1] + '",';
            }
        }
        text += '"quantity":"' + this.quantity + '"}';
        var obj = JSON.parse(text);
        for (let item in this.variations) {
            if (this.variations[item].id == obj.variation_id) {
                this.product.in_stock = this.variations[item].in_stock;
                this.product.price = this.variations[item].price;
                this.product.id = this.variations[item].id;
                console.log(this.product.id);
                this.product.sale_price = this.variations[item].sale_price;
                this.product.regular_price = this.variations[item].regular_price;
            }
        }
    }
    updateCart(a) {
        this.disableAddButton = false;
        this.AddToCart = "Add To Cart";
    }
    getCart() {
        this.nav.push(CartPage);
    }
    mySlideOptions = {
        initialSlide: 1,
        loop: true,
        autoplay: 5800,
        pager: true
    }
    getReviews() {
        this.service.getReviews(this.id).then((results) => this.handleReview(results));
    }
    handleReview(results) {
        this.reviews = results;
        for (let item in this.reviews) {
            this.reviews[item].avatar = md5(this.reviews[item].email);
            console.log(this.reviews[item].avatar);
        }
    }
    addToWishlist(id) {
        if (this.values.isLoggedIn) {
            this.service.addToWishlist(id).then((results) => this.update(results));
        } else {
            this.functions.showAlert(this.lan.ErrorTitle, this.lan.LoginError);
        }
    }
    update(a) {
        if (a.success == "Success") {
            this.values.wishlistId[this.product.id] = true;
        } else {
            this.functions.showAlert("error", "error");
        }
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
    showMore() {
        this.moreDescription = true;
    }
    showLess() {
        this.moreDescription = false;
    }
    getRelatedProducts() {
        if (this.product.related_ids != 0) {
            this.service.getRelatedProducts(this.product.related_ids).then((results) => this.related = results);
        }
    }
    getRelatedProduct(item) {
        this.nav.push(ProductPage, item);
    }
    getUpsellProducts() {
        if (this.product.upsell_ids != 0) {
            this.service.getUpsellProducts(this.product.upsell_ids).then((results) => this.upsell = results);
        }
    }
    getCrossSellProducts() {
        if (this.product.cross_sell_ids != 0) {
            this.service.getCrossSellProducts(this.product.cross_sell_ids).then((results) => this.crossSell = results);
        }
    }
    showMoreReviews(productName, count, rating) {
        console.log('show reviews')
        this.items = [];
        this.items.reviews = {};
        this.items.id = this.id;
        this.items.count = count;
        this.items.rating = rating;
        this.items.name = productName;
        this.items.reviews = this.reviews;
        let modal = this.modalCtrl.create(ReviewPage, this.items);
        modal.present();
    }
    chooseVariation(att, value){
        this.product.attributes.forEach(item => {
            if(item.name == att.name){
                item.selected = value;
            }
        })
        this.variations.forEach(variation => {
        var test = new Array(this.usedVariationAttributes.length);
        test.fill(false);
            this.usedVariationAttributes.forEach(attribute => {
                if(variation.attributes.length == 0){
                    this.options.variation_id = variation.id;
                    this.product.in_stock = variation.in_stock;
                    this.product.price = variation.price;
                    this.product.sale_price = variation.sale_price;
                    this.product.regular_price = variation.regular_price;
                }
                else {
                    variation.attributes.forEach((item, index) => {
                        if(item.name == attribute.name && item.option == attribute.selected){
                            test[index] = true;
                        }
                    })
                    if(test.every( v => v == true )){
                        this.options.variation_id = variation.id;
                        this.product.in_stock = variation.in_stock;
                        this.product.price = variation.price;
                        this.product.sale_price = variation.sale_price;
                        this.product.regular_price = variation.regular_price;
                        test.fill(false);
                    };
                }
            })
        })
    }
}