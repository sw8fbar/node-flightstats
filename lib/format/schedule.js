var moment = require( 'moment-timezone' )
var airlineCategory = require( '../airline-category' )
var flightStatus = require( '../flight-status' )
var serviceType = require( '../service-type' )
var codeshareType = require( '../codeshare-type' )

var airlines = null;
var airports = null;

function formatCodeShare( codeShare ) {

  var data = {}

  data.flightNumber = codeShare.flightNumber
  data.airline = codeShare.carrierFsCode
  data.relationship = codeShare.relationship &&
    codeshareType[ codeShare.relationship ] ||
    { code: codeShare.relationship }

  return data

}

function getAirline(airline){
  return airlines.filter(function(element){
    if (element.fs == airline) {
      return element
    }
  })

}

function getAirport(airport){
  return airports.filter(function(element){
    if (element.fs == airport) {
      return element
    }
  })

}

function formatFlight( flight ) {

  var data = {
    flightId: flight.flightId,
    flightNumber: flight.flightNumber,
    flightType: serviceType[ flight.serviceType ] || { code: flight.serviceType },
    serviceClasses: [],
    restrictions: [],
    status: {
      code: 'S',
      description: flightStatus[ 'S' ],
    },
    statusUpdates: [],
    arrival: {
      dateLocal: flight.arrivalTime,
      gateDelay: 0,
      gateTime: {},
      runwayDelay: 0,
      runwayTime: {},
      gate: flight.arrivalGate,
      terminal: flight.arrivalTerminal,
      baggageClaim: flight.arrivalBaggage,
      airport: getAirport(flight.arrivalAirport),
    },
    departure: {
      dateLocal: flight.departureTime,
      gateDelay: 0,
      gateTime: {},
      runwayDelay: 0,
      runwayTime: {},
      gate: flight.departureGate,
      terminal: flight.departureTerminal,
      airport: getAirport(flight.departureAirport),
    },
    carrier: getAirline(flight.carrierFsCode),
    codeshares: ( flight.codeshares || [] ).map( formatCodeShare ),
    duration: {},
  }

  // TODO:
  data.serviceClasses = flight.serviceClasses
    // .map( function( serviceClass ) {
    //   return serviceType[ serviceClass ] || { code: serviceClass }
    // })

  // TODO:
  data.restrictions = flight.trafficRestrictions
    // .map( function( restrictionClass ) {
    //   return restrictionType[ restrictionClass ] || { code: restrictionClass }
    // })

  if( flight.flightEquipment ) {

    data.equipment = {}

    if( flight.flightEquipment ) {
      data.equipment.scheduled = {
        iata: flight.flightEquipment.iata,
        name: flight.flightEquipment.name,
        turboProp: flight.flightEquipment.turboProp,
        jet: flight.flightEquipment.jet,
        widebody: flight.flightEquipment.widebody,
        regional: flight.flightEquipment.regional,
      }
    }

  }

  return data

}

function formatSchedule( data ) {

  var schedule = {}

  if(data.request.flightNumber){
      schedule.flightNumber = data.request.flightNumber.interpreted
  }

  if(data.request.carrier){
      schedule.airline = data.request.carrier.airline
  }

  if(data.appendix.airlines) {
    airlines = data.appendix.airlines;
  }

  if(data.appendix.airports) {
    airports = data.appendix.airports;
  }

  schedule.flights = ( data.scheduledFlights || [] ).map( formatFlight )

  return schedule

}

module.exports = formatSchedule
