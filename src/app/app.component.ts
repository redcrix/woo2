import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Service } from '../providers/service/service';
import { Values } from '../providers/service/values';
import { Config}  from '../providers/service/config';
import { TranslateService } from '@ngx-translate/core';
import { TabsPage } from '../pages/tabs/tabs';
import { ProductsPage } from '../pages/products/products';
import { ProductPage } from '../pages/product/product';
import { OneSignal } from '@ionic-native/onesignal';
//import { Network } from '@ionic-native/network';
import { Post } from '../pages/post/post';
import { NativeStorage } from '@ionic-native/native-storage';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage:any = TabsPage;
  status: any;
  configuration: any;
  items: any = {};
  constructor(statusBar: StatusBar, public splashScreen: SplashScreen, private oneSignal: OneSignal, public config: Config, public alertCtrl: AlertController, public platform: Platform, public service: Service, public values: Values, public translateService: TranslateService, private nativeStorage: NativeStorage, private screenOrientation: ScreenOrientation) {
    platform.ready().then(() => {
      statusBar.styleDefault();
        statusBar.backgroundColorByHexString('#f7f7f7');
        this.nativeStorage.getItem('blocks').then(data => { if (data) { 
            this.splashScreen.hide();
            this.service.blocks = data.blocks;
            this.values.settings = data.settings;
            this.values.calc(platform.width());
            if (this.values.settings.app_dir == 'right') this.platform.setDir('rtl', true);
            else this.platform.setDir('ltr', true);
            this.translateService.setDefaultLang(this.values.settings.language);
        } }, error => console.error(error));
        this.nativeStorage.getItem('categories').then(data => {
            if (data) {
                this.service.categories = data;
                this.service.mainCategories = [];
                for (var i = 0; i < this.service.categories.length; i++) {
                    if (this.service.categories[i].parent == '0') {
                        this.service.mainCategories.push(this.service.categories[i]);
                    }
                }
            }
        }, error => console.error(error));
        this.service.load().then((results) => this.handleService(results));
        this.screenOrientation.onChange().subscribe(
           () => {
               this.values.calc(platform.height());
           }
        );
    });
  }

  handleService(results) {
      if (this.values.settings.app_dir == 'right') this.platform.setDir('rtl', true);
      else this.platform.setDir('ltr', true);
          this.translateService.setDefaultLang(this.values.settings.language);
          this.splashScreen.hide();
          this.values.calc(this.platform.width());
      if (this.platform.is('cordova')) {
          debugger;
          this.oneSignal.startInit(this.values.settings.onesignal_app_id, this.values.settings.google_project_id);
          //this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
          this.oneSignal.handleNotificationReceived().subscribe(result => {
              console.log(result);
          });
          this.oneSignal.handleNotificationOpened().subscribe(result => {
              if (result.notification.payload.additionalData.category) {
                  this.items.id = result.notification.payload.additionalData.category;
                  this.nav.push(ProductsPage, this.items);
              } else if (result.notification.payload.additionalData.product) {
                  this.items.id = result.notification.payload.additionalData.product;
                  this.nav.push(ProductPage, this.items.id);
              } else if (result.notification.payload.additionalData.post) {
                  this.items.id = result.notification.payload.additionalData.post;
                  this.nav.push(Post, this.items.id);
              }
          });
          this.oneSignal.endInit();
      }
      if(this.values.settings.show_latest == '1')
      this.service.getProducts();
      if(this.values.settings.show_featured == '1')
      this.service.getfeaturedProduct();
  }
}