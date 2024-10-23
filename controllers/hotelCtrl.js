const axios = require('axios');
const xml2js = require('xml2js');
const { readCSV, getCityIdByName } = require('../utils/csvReader');

exports.getAllHotels = async (req, res) => {
    try {
        const { location, checkIn, checkOut, adults, children, nights, childrenAges } = req.body;

        const csvFilePath = './config/Destinations.csv';
        const cityToFind = location.split(',')[0];

        const data_ = await readCSV(csvFilePath);
        const cityId = getCityIdByName(data_, cityToFind);

        const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                         xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                         xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
            <soap12:Body>
                <MakeRequest xmlns="http://www.goglobal.travel/">
                    <requestType>11</requestType>
                    <xmlRequest><![CDATA[
                        <Root>
                            <Header>
                                <Agency>${process.env.AGENCY_ID}</Agency>
                                <User>${process.env.USER_NAME}</User>
                                <Password>${process.env.PASSWORD}</Password>
                                <Operation>HOTEL_SEARCH_REQUEST</Operation>
                                <OperationType>Request</OperationType>
                            </Header>
                            <Main Version="2.3" ResponseFormat="JSON" IncludeGeo="false" Currency="USD" HotelFacilities="true" RoomFacilities="true">
                                <SortOrder>1</SortOrder>
                                <MaxResponses>500</MaxResponses>
                                <MaximumWaitTime>15</MaximumWaitTime>
                                <Nationality>GB</Nationality>
                                <CityCode>${cityId}</CityCode>
                                <ArrivalDate>${checkIn}</ArrivalDate>
                                <Nights>${nights}</Nights>
                                <Rooms>
                                    <Room Adults="2" RoomCount="1" ChildCount="0"/>
                                    <Room Adults="1" RoomCount="1" ChildCount="0"/>
                                </Rooms>
                            </Main>
                        </Root>
                    ]]></xmlRequest>
                </MakeRequest>
            </soap12:Body>
        </soap12:Envelope>`;

        const headers = {
            'Content-Type': 'application/soap+xml; charset=utf-8',
            'API-Operation': 'HOTEL_SEARCH_REQUEST',
            'API-AgencyID': process.env.AGENCY_ID,
        };

        const { data } = await axios.post(process.env.BASE_URL, soapRequest, { headers });

        // Parsing the SOAP response using xml2js
        const parsedResult = await xml2js.parseStringPromise(data, { explicitArray: false });

        const soapBody = parsedResult['soap:Envelope']?.['soap:Body'] || parsedResult['soap12:Envelope']?.['soap12:Body'];
        const soapResult = soapBody?.MakeRequestResponse?.MakeRequestResult;

        if (!soapResult) {
            throw new Error('Invalid SOAP response');
        }

        res.status(200).json(soapResult);

    } catch (error) {
        console.error('Error in getAllHotels:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};
