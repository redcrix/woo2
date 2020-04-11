import React, { Component } from 'react';
console.disableYellowBox = true;
import {
  AppRegistry,AsyncStorage
} from 'react-native';

import { AppLoading } from 'expo';
import Routes from './src/Routes';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import {expo as appName} from './app.json';
import { Notifications } from 'expo';

AppRegistry.registerComponent(appName.name, () => App);

export default class App extends Component   {
  constructor(props) {
    super(props);
    this.state = {
      progress_steps:'',
      isReady: false,
      notificationlist:{},
      notificationlistcount:0
    };
  }

  _handleNotification = async  (notification) => {
    this.setState({notificationlistcount:this.state.notificationlistcount+1});
    // await AsyncStorage.getItem('notificationlist').then(data=>{
    //   var data=JSON.parse(data);
    //   if(!data || data==null){
    //     data=[];
    //   }
    //   data.push(notification.data.message);
    //  this.storeData(data);
    //}); 
    
   }

   storeData = async (notificationlist) => {
    try 
    {
      
     await AsyncStorage.setItem('notificationlist', JSON.stringify(notificationlist));    
     } catch (error) {
      console.log(error);
      return error;
    }
  };
  

  async componentDidMount() {
    console.log("dfdf")
    await Font.loadAsync({
    //  ...Ionicons.font,
    'open-sans-bold': require('./assets/fonts/OpenSans-Bold.ttf'),
    'open-sans-extra-bold': require('./assets/fonts/OpenSans-ExtraBold.ttf'),  
    'open-sans-italic': require('./assets/fonts/OpenSans-Italic.ttf'),  
    'open-sans-regular': require('./assets/fonts/OpenSans-Regular.ttf'),  
    'open-sans-light': require('./assets/fonts/OpenSans-Light.ttf'),  
  
  
    
    
  });
    this._notificationSubscription = Notifications.addListener(this._handleNotification)
    
    await AsyncStorage.getItem('userData').then((userData)=>{
      var userData=JSON.parse(userData);
      this.setState({progress_steps:userData.progress_steps});
    }).catch((error)=>{
      this.setState({ isReady: true }); 
    });
    this.setState({ isReady: true }); 
  }


  render() {
     if (!this.state.isReady) {
       return <AppLoading />;
     }
     else{
    return (
       <Routes  screenProps={{notificationlistcount: this.state.notificationlistcount,logout:this.logout}}/>
    );
     }
  }
}