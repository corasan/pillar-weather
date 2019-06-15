import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, Button } from 'react-native';
// import RNLocation from 'react-native-location';

type Props = {};

const API_KEY = '55e371b73eb5f5b1da3c34e8d7513c79';
export default class App extends Component<Props> {
  state = {
    temp: 0,
    pressure: 0,
    humidity: 0,
    name: '',
    city: '',
  }

  constructor() {
    super();
    this.geolocation = navigator.geolocation;
  }

  componentDidMount() {
    this.geolocation.requestAuthorization();

    this.getLocation();
  }

  getLocation = async () => {
    this.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
      console.log('setLocation', { latitude, longitude })
      this.setState({ lat: latitude, long: longitude });
      this.getWeather(latitude, longitude)
    });
  }

  getWeather = async () => {
    const url = 'https://api.openweathermap.org/data/2.5';
    const { lat, long, city } = this.state;
    const searchMethod = city ? `q=${city}` : `lat=${lat}&lon=${long}`;
    try {
      const res = await fetch(`${url}/weather?${searchMethod}&units=imperial&APPID=${API_KEY}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const { main, name } = await res.json();
      this.setWeather({ name, ...main});
    } catch (err) {
      console.log(err)
    }
  }

  setWeather = ({ temp, pressure, humidity, name }) => {
    this.setState({ temp, pressure, humidity, name })
  }

  render() {
    const { temp, pressure, humidity, name, city } = this.state
    return (
      <View style={styles.container}>
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TextInput
            value={city}
            onChangeText={text => this.setState({ city: text })}
            style={styles.searchInput}
            placeholder="Enter city"
          />
          <Button title="Search" onPress={this.getWeather} />
        </View>
        <View style={styles.weatherContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text>{temp}</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ marginRight: 10 }}>{pressure}</Text>
            <Text>{humidity}</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: 16,
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.6
  },
  weatherContainer: {

  },
  searchInput: {
    height: 50,
    width: '80%',
    borderWidth: 1,
    borderColor: 'rgb(240, 240, 240)',
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  seearchBtn: {

  }
});
