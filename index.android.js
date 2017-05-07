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
      lastPosition: null
    }
  }

  watchID: ?number = null

  onRegionChange(region) {
    this.setState({ ...this.state, region })
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
        >
          <MapView.UrlTile
            style={styles.tile}
            urlTemplate='http://3ec58e69.ngrok.io/tiles/{z}/{x}/{y}.png'
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
