/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Button,
  StyleSheet,
  Text,
  View
} from 'react-native';
import MapView from 'react-native-maps';
import mapStyle from './src/mapStyle.js'

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  info: {
    color: 'red'
  }
});

const ltDelt = 0.00922
const lnDelt = 0.00421
const BASE_URL = 'http://14fd8dc6.ngrok.io/'

export default class BitDrop extends Component {

  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: 32.424453,
        longitude: 35.5759966,
        latitudeDelta: 3,
        longitudeDelta: 2
      },
      initialPosition: null,
      lastPosition: null,
      cacheVersion: 1
    }
  }

  watchID: ?number = null

  onRegionChange(region) {
    this.setState({ ...this.state, region })
  }

  getRandomColor() {
    const r = function() {
      return Math.floor(Math.random() * (9 + 1))
    }
    return '#' + r() + r() + r() + r() + r() + r()
  }

  onLocationTap(ev) {
    const coords = ev.nativeEvent.coordinate
    const color = this.getRandomColor()
    fetch(BASE_URL + 'set-tile', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: coords.latitude,
        lon: coords.longitude,
        color: color
      })
    })
    .then((response) => {
      // alert(JSON.stringify(response))
      // A hack to clear the cache of the overlay to force a fetch and a re-render
      this.setState({ ...this.state, cacheVersion: this.state.cacheVersion + 1 })
    })
    .catch((error) => {
      alert(JSON.stringify(error))
    })
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        var initialPosition = position
        this.setState({ ...this.state, initialPosition })
      },
      (error) => {
        // alert(JSON.stringify(error))
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    )
    this.watchID = navigator.geolocation.watchPosition((position) => {
      var lastPosition = position
      this.setState({ ...this.state, lastPosition })
      this.focusOnUser()
    })
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID)
  }

  focusOnUser() {
    const markers = [
      this.state.lastPosition.coords,
      {
        latitude: this.state.lastPosition.coords.latitude + (ltDelt/2),
        longitude: this.state.lastPosition.coords.longitude + (lnDelt/2)
      },
      {
        latitude: this.state.lastPosition.coords.latitude - (ltDelt/2),
        longitude: this.state.lastPosition.coords.longitude - (lnDelt/2)
      }
    ]
    this.map.fitToCoordinates(markers, {
      edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
      animated: true,
    })
  }

  render() {
    return (
      <View style ={styles.container}>
        <MapView
          ref={ref => { this.map = ref; }}
          style={styles.map}
          region={this.state.region}
          onRegionChange={(region) => {this.onRegionChange(region)}}
          onPress={(ev) => {this.onLocationTap(ev)}}
        >
          <MapView.UrlTile
            style={styles.tile}
            urlTemplate={BASE_URL + 'tiles/{z}/{x}/{y}.png?v=' + this.state.cacheVersion }
          />
          {
            this.state.lastPosition &&
            <MapView.Marker
              coordinate={this.state.lastPosition.coords}
              image={require('./src/images/user-location.png')}
            />
          }
        </MapView>
        {
          false &&
          <Text style={styles.info}>
            Last: {JSON.stringify(this.state.lastPosition)}
          </Text>
        }
      </View>
    );
  }
}

AppRegistry.registerComponent('BitDrop', () => BitDrop);
