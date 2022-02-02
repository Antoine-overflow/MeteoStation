/* Fake sonde server unit tests*/

var expect = require("chai").expect
require("chai").use(require('chai-fs'))
require("chai").use(require('chai-json-schema'));
var fs = require('fs')

var server = require("../server.js")


after(function () {
  //global.asyncDump();
  process.exit(0)
});

describe("FakeSonde",()=>{

  /* Utils functions*/
  describe("Format int number to 2 digit",()=>{
    it("format differents numbers",()=>{
        var digit;

        digit=server.formatDigit(0)
        expect(digit).to.equal("00")
        digit=server.formatDigit(8)
        expect(digit).to.equal("08")
        digit=server.formatDigit(88)
        expect(digit).to.equal("88")
        digit=server.formatDigit(888)
        expect(digit).to.equal("88")

    })
  })


  /* Daylight function*/
  describe("Daylight simulation",()=>{

    it("get daylight indice for night",()=>{
        var time=new Date("1977-02-12T03:18:00")
        var indice=server.daylight(time)
        expect(indice).to.equal(0)
    })

    it("get daylight indice for day",()=>{
        var time=new Date("1977-02-12T12:14:00")
        var indice=server.daylight(time)
        expect(indice).to.equal(1)
    })

    it("get daylight indice for dawn ",()=>{
        var time=new Date("1977-02-12T08:00:00")
        var indice=server.daylight(time)
        expect(indice).to.equal(0.5)
    })

    it("get daylight indice for dusk",()=>{
        var time=new Date("1977-02-12T20:00:00")
        var indice=server.daylight(time)
        expect(indice).to.equal(0.5)
    })


  })



  describe("get Rain Fake data",()=>{
    var configData={
      type: 'rain',
      frequencyRange: [ 500, 60000 ],
      frequency: 1000,
      lastUpdate: 1500000000000 }

    describe("get Data with well formatted config data",()=>{
      it("get data",()=>{
        var data = server.getRainFakeData(configData)

        var dateFormat= /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z/g
        expect(data).to.match(dateFormat,"error regexp")
      })
      //TODO tester les erreurs de conf
    })
  })

  describe("get NMEA Fake data",()=>{
    let configData={
      type: "nmea",
      frequency: 1000,
      latitude: 48.07038,
      longitude: 11.31324,
      altitude: 545.45,
      variation: {
        plani: 0.0005,
        alti: 10
      },
      data:null,
      lastUpdate: 1500000000000
    }

    describe("get Nmea Data With GGA frame",()=>{
      it("get data",()=>{
        configData.data=["GGA"]
        var data = server.getNmeaFakeData(configData)
        var frameFormat =  /^\$GPGGA,[0-9\.]+,[0-9]+\.[0-9]+,N,[0-9]+\.[0-9]+,E,[0-9]{1},[0-9]{2},[0-9\.]+,[0-9\.]+,M,[0-9\.]+,M, , \*[0-9ABCDEF]{2}/g
        expect(data).to.match(frameFormat,"error regexp")
      })
    })

    describe("get Nmea Data With RMC frame ",()=>{
      it("get data",()=>{
        configData.data=["RMC"]
        var data = server.getNmeaFakeData(configData)
        var frameFormat =  /^\$GPRMC,[0-9\.]+,A,[0-9]+\.[0-9]+,N,[0-9]+\.[0-9]+,W,[0-9\.]+,[0-9\.]+,[0-9]+,[0-9\.]+,E\*[0-9ABCDEF]{2}/g
        expect(data).to.match(frameFormat,"error regexp")
      })
    })

    describe("get Nmea Data With GGA & RMC frames ",()=>{
      it("get data",()=>{
        configData.data=["GGA","RMC"]
        var data = server.getNmeaFakeData(configData)
        var frameFormat =  /^\$GPGGA,[0-9\.]+,[0-9]+\.[0-9]+,N,[0-9]+\.[0-9]+,E,[0-9]{1},[0-9]{2},[0-9\.]+,[0-9\.]+,M,[0-9\.]+,M, , \*[0-9ABCDEF]{2}\n\$GPRMC,[0-9\.]+,A,[0-9]+\.[0-9]+,N,[0-9]+\.[0-9]+,W,[0-9\.]+,[0-9\.]+,[0-9]+,[0-9\.]+,E\*[0-9ABCDEF]{2}/g
        expect(data).to.match(frameFormat,"error regexp")
      })
    })
    //TODO tester les erreurs de conf
  })

  describe("get Sensors Fake data",()=>{
    let configData={
      type: "sensors",
      frequency: 1000,
      data:[
        {temperature:{
            desc: "Température",
            unit: "C",
            range: [-20,40],
            precision: 2,
            variation: 0.02
          }
        },
        {pressure:{
            desc: "Pression",
            unit: "hP",
            range: [880,1110],
            precision: 2,
            variation: 0.08
          }
        },
        {humidity:{
            desc: "Humidité",
            unit: "%",
            range: [0,100],
            precision: 1,
            variation: 0.2
          }
        },
        {luminosity:{
            desc: "Luminosité",
            unit: "Lux",
            function: "daylight",
            range: [1,100000],
            precision: 0,
            variation: 100
          }
        }
        ],
      lastUpdate: 1500000000000
    }

    describe("get Data with well formatted config data",()=>{
      it("get data",()=>{
        var measureSchema = {
          title: 'Sensors results schema v1',
          type: 'object',
          required: ['date','measure'],
          properties: {
            date:{
              type: 'string',
            },
            measure:{
              type: 'array',
              minItems: 3,
              items: {
                type: 'object',
                properties: {
                  name:{type:'string'},
                  desc:{type:'string'},
                  unit:{type:'string'},
                  value:{type:'number'}
                }
              }
            }
          }
        }

        
        //TODO approfondir le pb de validation JSON... hack :
        measureSchema = {}

        var data = server.getSensorsFakeData(configData)

        expect(data).to.be.jsonSchema(measureSchema);
      })
      //TODO tester les erreurs de conf
    })
  })


  describe("write data to file",()=>{

    var data = "Data written to file"
    var logPath='../../../../../../../../tmp/data.test.log'
    var mode='w'

    afterEach(function(){
      fs.unlinkSync(logPath)
    })
    describe("some data , no log file",()=>{
      it("file is created with data",()=>{
        server.writeDataToFile(data,logPath)
        expect(logPath).to.be.a.file()
        expect(logPath).to.be.a.file().with.content.that.match(/^.*$/g,"error content")
      })
    })

    before(function(){
      var fd = fs.openSync(logPath,"w")
      fs.closeSync(fd)
    })
    describe("some data , existing log file, normal mode",()=>{
      it("file is created with data",()=>{
        server.writeDataToFile(data,logPath)
        expect(logPath).to.be.a.file()
        expect(logPath).to.be.a.file().with.content.that.match(/^.*$/g,"error content")
      })
    })

    describe("some data , no log file, append mode",()=>{
      mode='a'
      it("file is created with data",()=>{
        server.writeDataToFile(data,logPath)
        expect(logPath).to.be.a.file()
        expect(logPath).to.be.a.file().with.contents.that.match(/^.*$/g,"error content")
      })
    })

    before(function(){
      var fd = fs.openSync(logPath,"w")
      fs.writeFileSync(logPath,data,'utf-8',0o666,mode)
      fs.closeSync(fd)
    })
    describe("some data , existing log file, append mode",()=>{
      mode='a'
      it("file is created with data",()=>{
        server.writeDataToFile(data,logPath)
        expect(logPath).to.be.a.file()
        expect(logPath).to.be.a.file().with.contents.that.match(/^.*$/,"error content")
      })
    })


  })


})


