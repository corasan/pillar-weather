// @flow
import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, Button, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment';

type Props = {};

type State = {
  temp: number,
  pressure: number,
  humidity: number,
  name: string,
  city: string,
  lat: number,
  long: number,
  forecast: Array<any>,
}

const API_KEY = '55e371b73eb5f5b1da3c34e8d7513c79';
export default class App extends Component<Props, State> {
  geolocation: any;

  state = {
    temp: 0,
    pressure: 0,
    humidity: 0,
    name: '',
    city: '',
    lat: 0,
    long: 0,
    forecast: [],
  }

  constructor() {
    super();
    this.geolocation = navigator.geolocation;
  }

  async componentDidMount() {
    this.geolocation.requestAuthorization();

    this.getLocation();
  }

  getLocation = () => {
    this.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
      console.log('setLocation', { latitude, longitude })
      this.setState({ lat: latitude, long: longitude });
      this.getWeather();
      this.getForecast();
    });
  }

  getWeather = async () => {
    try {
      const res = await this.weatherRequest();
      const { main, name } = await res.json();
      this.setWeather({ name, ...main});
    } catch (err) {
      console.log(err)
    }
  }

  getForecast = async () => {
    try {
      const res = await this.weatherRequest('forecast');
      const { list } = await res.json();
      const forecast = list.slice(0, 6)
      this.setState({ forecast })
    } catch (err) {
      console.log(err)
    }
  }

  weatherRequest = (queryType: string = 'weather') => {
    const url = 'https://api.openweathermap.org/data/2.5';
    const { lat, long, city } = this.state;
    const searchMethod = city ? `q=${city}` : `lat=${lat}&lon=${long}`;
    return fetch(`${url}/${queryType}?${searchMethod}&units=imperial&APPID=${API_KEY}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
  }

  setWeather = ({ temp, pressure, humidity, name }) => {
    this.setState({ temp, pressure, humidity, name })
  }

  renderDataWithLabel = (number: number, label: string) => (
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.numberLabel}>{label}</Text>
    </View>
  )

  render() {
    const { temp, pressure, humidity, name, city, forecast } = this.state
    const data = forecast.map(({ main }) => main.temp)
    const labels = forecast.slice(0, 24).map(({ dt_txt }) => moment(dt_txt).format('h:mm'))
    const chartConfig = {
      backgroundColor: '#fff',
      backgroundGradientFrom: '#fff',
      backgroundGradientTo: '#fff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16
      }
    };

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
          <Text style={[styles.number, { fontSize: 18, marginTop: 10 }]}>{temp} °F</Text>
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            {this.renderDataWithLabel(pressure, 'Pressure')}
            {this.renderDataWithLabel(humidity, 'Humidity')}
          </View>
        </View>

        {forecast.length > 0 && (
          <View style={{ marginTop: 50 }}>
            <Text>12 hours forecast</Text>
            <LineChart
              data={{ labels, datasets: [{ data }] }}
              chartConfig={chartConfig}
              width={Dimensions.get('window').width}
              height={220}
              yAxisLabel={''}
              bezier
            />
          </View>
          )}
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
    alignItems: 'center',
    marginTop: 20
  },
  searchInput: {
    height: 50,
    width: '80%',
    borderWidth: 1,
    borderColor: 'rgb(240, 240, 240)',
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  number: {
    fontWeight: 'bold'
  },
  numberLabel: {
    fontSize: 12,
    color: 'rgb(150,150,150)'
  }
});
