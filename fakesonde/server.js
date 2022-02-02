/*
Fake data for Weather station simulation

*/

/** 
* Dependancies
*/

var fs = require('fs')
var yaml = require('js-yaml')


/**
* Constants
*/
const encoding = 'utf8'
/**
* Globals
*/
var config=null

/**
* Format output to digit
*/
formatDigit = function (number){
  return ("0"+number).substr(-2)
}

/**
* Load config file
*/
loadConfig = function(){
  try {
    var config = yaml.safeLoad(fs.readFileSync('./config.yml', encoding))
    console.log(config)
  } catch (e) {
    console.error(e)
    console.error("Fichier de config illisible")
    process.exit(1)
  }

  if (!config.dumpFolder) config.dumpFolder = "/tmp"

  return config
}


/**
* Loop function to updates new data
* each fakeData in config.yml, it will update the output 
* in accordance to the frequency of the data type
*/
function loop(){
  var period = (new Date()).getTime()

  if(!config)config=loadConfig()

  for (var dataConfig of config.fakeData) {

    var dataName=Object.keys(dataConfig)[0]
    dataConfig=dataConfig[dataName]

    // Initialization at first update
    if(!dataConfig.lastUpdate){
      dataConfig.lastUpdate=period
    }

    //console.log(data);

    // detect uptate frequency
    if(period-dataConfig.lastUpdate > dataConfig.frequency){
      dataConfig.lastUpdate=period
      var newData=""
      switch(dataConfig.type.toString()){
        case "nmea":
          newData=getNmeaFakeData(dataConfig)
          break
        case "rain":
          newData=getRainFakeData(dataConfig)
          break
        case "sensors":
          newData=getSensorsFakeData(dataConfig)
          break
        default:
          console.log('No valid type')
      }

      var mode=(dataConfig.mode)?dataConfig.mode:'w'
      try{
        writeDataToFile(newData,dataConfig.fileName,mode)
      }catch(err){
        console.error(err)
        process.exit(1)
      }

      //update frequency rate for range based frency data
      if(dataConfig.frequencyRange){
        dataConfig.frequency=Math.floor(Math.random() * (dataConfig.frequencyRange[1] - dataConfig.frequencyRange[0]) + dataConfig.frequencyRange[0]);
      }
    }
  }
  // next
  setTimeout(loop,100)
}


/**
*  get "NMEA type" data 
*/
getNmeaFakeData =function(config){
  // LEs data non utiles sont fictives, y compris les Checksums

  var now=new Date();
  var fix=formatDigit(now.getUTCHours())+
      formatDigit(now.getUTCMinutes())+
      formatDigit(now.getUTCSeconds())+"."+
      formatDigit(Math.floor(now.getUTCMilliseconds()/10))
  var fixDate=formatDigit(now.getDate())+
      formatDigit(now.getMonth()+1)+
      formatDigit(now.getFullYear())

  var lat=config.latitude+((Math.random()-0.5)*config.variation.plani)
  lat=("0"+(lat*100).toFixed(3)).substr(-8)

  var lon=config.longitude+((Math.random()-0.5)*config.variation.plani)
  lon=("00"+(lon*100).toFixed(3)).substr(-9)


  var alt=config.altitude+((Math.random()-0.5)*config.variation.alti)
  alt=alt.toFixed(1)

  //var check  = Math.random().toString(16).substr(-2).toUpperCase()
	
  //construct nmea frame
  var newData=""
  for (var frame of config.data) {
    newDataFrame=""
    switch(frame){
    case "GGA":
      newDataFrame="GPGGA,"+fix+","+lat+",N,"+lon+",E,1,08,0.9,"+alt+",M,46.9,M, , "
      break
    case "RMC":
      newDataFrame="GPRMC,"+fix+",A,"+lat+",N,"+lon+",W,000.0,054.7,"+fixDate+",020.3,E"
      break
    default :
      console.error("Unknown frame type")
    }
    //Compute Checksum
    checksum=""
    for (var i = 0; i < newDataFrame.length; i++) {
      checksum = checksum ^ newDataFrame.charCodeAt(i);	
    }
    var hexsum = Number(checksum).toString(16).toUpperCase();
    if (hexsum.length < 2) { hexsum = ("00" + hexsum).slice(-2); }
      newData+="$"+newDataFrame+"*"+hexsum+'\n'
    }
  
  return newData
}


/**
*  get "Rain type" data 
*/
getRainFakeData = function(config){
  return (new Date()).toISOString()+'\n'
}

/**
*  get "Sensors type (weather measures)" data
*/
getSensorsFakeData = function (config){

  // {date:"2018....",measure:[{name:"temp",desc:"température",value:15.76,unit:"C"},{},{}]}
  var newData=''

  for (var measure of config.data) {

    var measureName=Object.keys(measure)[0]
    measure=measure[measureName]
    //
    if(!measure.lastValue){
      measure.lastValue=measure.range[0]+(measure.range[1]-measure.range[0])/2
    }

    var value=0;
    //utilisation d'une fonction
    if(measure.function){ 
      if(typeof this[measure.function] === "function" ){
        value=measure.lastValue=measure.lastValue*this[measure.function]()+((Math.random()-0.5)*measure.variation)
      }else{
        throw new Error("Erreur de configuration : '"+measure.function+"' fonction inexistante")
        process.exit(1)
      }
    }else{
      value=measure.lastValue+((Math.random()-0.5)*measure.variation)
    }

    //bornage    
    value=Math.max(Math.min(value,measure.range[1]),measure.range[0])

    value=value.toFixed(measure.precision)

    //console.log(value)
    if(newData!=''){newData+=','}
    newData+='{"name":"'+measureName+'","desc":"'+measure.desc+'","unit":"'+measure.unit+'","value":"'+value+'"}'

  }

  newData='{"date":"'+(new Date()).toISOString()+'","measure":['+newData+']}\n';

  return newData
}

/**
* Simulate daylight value 0=> night 1=>day
*/
daylight = function(time){
  // 7-9 : rampup
  // 9-19 : day
  // 19-21 : rampdown
  // 21-7 : night
  if (time==null) time=new Date()
  var h= time.getUTCHours()
  var m= time.getUTCMinutes()

  if (h<7 || h>=21) return 0
  if (h>=7 && h<9) {
    return (((h-7)*60+m)/120)
  }
  if(h>=19 && h<21) {
    return 1-(((h-19)*60+m)/120) 
  }
  return 1
}


/**
* Write any data to a file
*/
writeDataToFile = function(data,fileName,mode="w"){
  fs.writeFileSync(config.dumpFolder+"/"+fileName,data,encoding,0o666,mode)
}

/**
* Exports functions for testing
*/

module.exports = {
  formatDigit,formatDigit,
  loadConfig:loadConfig,
  daylight:daylight,
  writeDataToFile:writeDataToFile,
  getRainFakeData:getRainFakeData,
  getSensorsFakeData:getSensorsFakeData,
  getNmeaFakeData:getNmeaFakeData
};


/**
* Main process
*/
loop()



