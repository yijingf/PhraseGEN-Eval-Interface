// configure the test here
var TestConfig = {
    "TestName": "AI Generated Music Listening Test",
    "LoopByDefault": true,
    "ShowFileIDs": false,
    "ShowResults": false,
    "RandomizeTestOrder": true,
    "EnableOnlineSubmission": true,
    "BeaqleServiceURL": "/web_service/beaqleJS_Service.php",
    "SupervisorContact": "",
    "AudioRoot": "",
    "MaxTestsPerRun": 3,
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
        }
    ]
}
