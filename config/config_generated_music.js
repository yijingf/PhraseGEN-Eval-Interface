// configure the test here
var TestConfig = {
    "TestName": "AI Generated Music Listening Test",
    "LoopByDefault": true,
    "ShowFileIDs": false,
    "ShowResults": false,
    "EnableABLoop": false,
    "RandomizeTestOrder": true,
    "EnableOnlineSubmission": true,
    "BeaqleServiceURL": "/web_service/beaqleJS_Service.php",
    "SupervisorContact": "",
    "MaxTestsPerRun": 30,
    "AudioRoot": "",
    "SampleFile": "audio/sample.wav",
    "Testsets": [
        {
            "Name": "Test",
            "TestID": "id_00",
            "Files": {
                "A": "audio/mass/03.wav",
                "B": "audio/ref/03.wav"
            },
            "Duration": {
                "A": 16.0,
                "B": 16.0
            }
        },
        {
            "Name": "Test",
            "TestID": "id_01",
            "Files": {
                "A": "audio/anchor/03.wav",
                "B": "audio/ref/03.wav"
            },
            "Duration": {
                "A": 16.0,
                "B": 16.0
            }
        },
        {
            "Name": "Test",
            "TestID": "id_02",
            "Files": {
                "A": "audio/mt/03.wav",
                "B": "audio/ref/03.wav"
            },
            "Duration": {
                "A": 16.0,
                "B": 16.0
            }
        },
        {
            "Name": "Test",
            "TestID": "id_03",
            "Files": {
                "A": "audio/mass/04.wav",
                "B": "audio/ref/04.wav"
            },
            "Duration": {
                "A": 8.75,
                "B": 8.75
            }
        },
        {
            "Name": "Test",
            "TestID": "id_04",
            "Files": {
                "A": "audio/anchor/04.wav",
                "B": "audio/ref/04.wav"
            },
            "Duration": {
                "A": 8.75,
                "B": 8.75
            }
        },
        {
            "Name": "Test",
            "TestID": "id_05",
            "Files": {
                "A": "audio/mt/04.wav",
                "B": "audio/ref/04.wav"
            },
            "Duration": {
                "A": 8.75,
                "B": 8.75
            }
        },
        {
            "Name": "Test",
            "TestID": "id_06",
            "Files": {
                "A": "audio/mass/05.wav",
                "B": "audio/ref/05.wav"
            },
            "Duration": {
                "A": 12.397727272727272,
                "B": 13.636363636363635
            }
        },
        {
            "Name": "Test",
            "TestID": "id_07",
            "Files": {
                "A": "audio/anchor/05.wav",
                "B": "audio/ref/05.wav"
            },
            "Duration": {
                "A": 13.636363636363635,
                "B": 13.636363636363635
            }
        },
        {
            "Name": "Test",
            "TestID": "id_08",
            "Files": {
                "A": "audio/mt/05.wav",
                "B": "audio/ref/05.wav"
            },
            "Duration": {
                "A": 13.636363636363635,
                "B": 13.636363636363635
            }
        },
        {
            "Name": "Test",
            "TestID": "id_09",
            "Files": {
                "A": "audio/ref/06.wav",
                "B": "audio/mass/06.wav"
            },
            "Duration": {
                "A": 16.0,
                "B": 15.5
            }
        },
        {
            "Name": "Test",
            "TestID": "id_10",
            "Files": {
                "A": "audio/ref/06.wav",
                "B": "audio/anchor/06.wav"
            },
            "Duration": {
                "A": 16.0,
                "B": 16.0
            }
        },
        {
            "Name": "Test",
            "TestID": "id_11",
            "Files": {
                "A": "audio/mt/06.wav",
                "B": "audio/ref/06.wav"
            },
            "Duration": {
                "A": 16.875,
                "B": 16.0
            }
        },
        {
            "Name": "Test",
            "TestID": "id_12",
            "Files": {
                "A": "audio/mass/07.wav",
                "B": "audio/ref/07.wav"
            },
            "Duration": {
                "A": 12.397727272727272,
                "B": 11.363636363636363
            }
        },
        {
            "Name": "Test",
            "TestID": "id_13",
            "Files": {
                "A": "audio/anchor/07.wav",
                "B": "audio/ref/07.wav"
            },
            "Duration": {
                "A": 11.363636363636363,
                "B": 11.363636363636363
            }
        },
        {
            "Name": "Test",
            "TestID": "id_14",
            "Files": {
                "A": "audio/ref/07.wav",
                "B": "audio/mt/07.wav"
            },
            "Duration": {
                "A": 11.363636363636363,
                "B": 12.397727272727272
            }
        },
        {
            "Name": "Test",
            "TestID": "id_15",
            "Files": {
                "A": "audio/mass/08.wav",
                "B": "audio/ref/08.wav"
            },
            "Duration": {
                "A": 16.0,
                "B": 16.0
            }
        },
        {
            "Name": "Test",
            "TestID": "id_16",
            "Files": {
                "A": "audio/anchor/08.wav",
                "B": "audio/ref/08.wav"
            },
            "Duration": {
                "A": 16.0,
                "B": 16.0
            }
        },
        {
            "Name": "Test",
            "TestID": "id_17",
            "Files": {
                "A": "audio/ref/08.wav",
                "B": "audio/mt/08.wav"
            },
            "Duration": {
                "A": 16.0,
                "B": 16.0
            }
        },
        {
            "Name": "Test",
            "TestID": "id_18",
            "Files": {
                "A": "audio/mass/10.wav",
                "B": "audio/ref/10.wav"
            },
            "Duration": {
                "A": 10.495454545454544,
                "B": 9.445454545454545
            }
        },
        {
            "Name": "Test",
            "TestID": "id_19",
            "Files": {
                "A": "audio/anchor/10.wav",
                "B": "audio/ref/10.wav"
            },
            "Duration": {
                "A": 9.445454545454545,
                "B": 9.445454545454545
            }
        },
        {
            "Name": "Test",
            "TestID": "id_20",
            "Files": {
                "A": "audio/ref/10.wav",
                "B": "audio/mt/10.wav"
            },
            "Duration": {
                "A": 9.445454545454545,
                "B": 9.795454545454545
            }
        },
        {
            "Name": "Test",
            "TestID": "id_21",
            "Files": {
                "A": "audio/ref/11.wav",
                "B": "audio/mass/11.wav"
            },
            "Duration": {
                "A": 13.674999999999999,
                "B": 15.195454545454545
            }
        },
        {
            "Name": "Test",
            "TestID": "id_22",
            "Files": {
                "A": "audio/ref/11.wav",
                "B": "audio/anchor/11.wav"
            },
            "Duration": {
                "A": 13.674999999999999,
                "B": 13.674999999999999
            }
        },
        {
            "Name": "Test",
            "TestID": "id_23",
            "Files": {
                "A": "audio/mt/11.wav",
                "B": "audio/ref/11.wav"
            },
            "Duration": {
                "A": 15.195454545454545,
                "B": 13.674999999999999
            }
        },
        {
            "Name": "Test",
            "TestID": "id_24",
            "Files": {
                "A": "audio/ref/12.wav",
                "B": "audio/mass/12.wav"
            },
            "Duration": {
                "A": 21.66590909090909,
                "B": 21.66590909090909
            }
        },
        {
            "Name": "Test",
            "TestID": "id_25",
            "Files": {
                "A": "audio/anchor/12.wav",
                "B": "audio/ref/12.wav"
            },
            "Duration": {
                "A": 21.66590909090909,
                "B": 21.66590909090909
            }
        },
        {
            "Name": "Test",
            "TestID": "id_26",
            "Files": {
                "A": "audio/mt/12.wav",
                "B": "audio/ref/12.wav"
            },
            "Duration": {
                "A": 21.66590909090909,
                "B": 21.66590909090909
            }
        },
        {
            "Name": "Test",
            "TestID": "id_27",
            "Files": {
                "A": "audio/ref/16.wav",
                "B": "audio/mass/16.wav"
            },
            "Duration": {
                "A": 8.25,
                "B": 8.25
            }
        },
        {
            "Name": "Test",
            "TestID": "id_28",
            "Files": {
                "A": "audio/ref/16.wav",
                "B": "audio/anchor/16.wav"
            },
            "Duration": {
                "A": 8.25,
                "B": 8.25
            }
        },
        {
            "Name": "Test",
            "TestID": "id_29",
            "Files": {
                "A": "audio/ref/16.wav",
                "B": "audio/mt/16.wav"
            },
            "Duration": {
                "A": 8.25,
                "B": 8.25
            }
        },
        {
            "Name": "Test",
            "TestID": "id_30",
            "Files": {
                "A": "audio/mass/20.wav",
                "B": "audio/ref/20.wav"
            },
            "Duration": {
                "A": 11.395454545454545,
                "B": 10.256818181818181
            }
        },
        {
            "Name": "Test",
            "TestID": "id_31",
            "Files": {
                "A": "audio/ref/20.wav",
                "B": "audio/anchor/20.wav"
            },
            "Duration": {
                "A": 10.256818181818181,
                "B": 10.256818181818181
            }
        },
        {
            "Name": "Test",
            "TestID": "id_32",
            "Files": {
                "A": "audio/mt/20.wav",
                "B": "audio/ref/20.wav"
            },
            "Duration": {
                "A": 11.395454545454545,
                "B": 10.256818181818181
            }
        }
    ]
}
