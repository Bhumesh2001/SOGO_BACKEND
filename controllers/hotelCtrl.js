const axios = require('axios');
const xml2js = require('xml2js');
const { readCSV, getCityIdByName } = require('../utils/csvReader');
const { calculateNights } = require('../utils/calculate');

exports.getAllHotels = async (req, res) => {
    try {
        const { location, checkIn, checkOut, adults, children } = req.body;

        const csvFilePath = './config/Destinations.csv';
        const cityToFind = location.split(',')[0];

        const data_ = await readCSV(csvFilePath);
        const cityId = getCityIdByName(data_, cityToFind);
        const nights = calculateNights(checkIn, checkOut);

        if (!cityId) {
            return res.status(404).json({
                success: 'false',
                message: 'No Hotels Were Found Matching Searched Criteria!',
                Hotels: null,
            });
        };

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
                                <CityCode>${parseInt(cityId)}</CityCode>
                                <ArrivalDate>${checkIn}</ArrivalDate>
                                <Nights>${parseInt(nights)}</Nights>
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

        const parsedResult = await xml2js.parseStringPromise(data, { explicitArray: false });

        const soapBody = parsedResult['soap:Envelope']?.['soap:Body'] || parsedResult['soap12:Envelope']?.['soap12:Body'];
        const soapResult = soapBody?.MakeRequestResponse?.MakeRequestResult;

        if (!soapResult) {
            throw new Error('Invalid SOAP response');
        }

        let response_obj = {
            status: 200,
            success: true,
            message: 'Hotels fetched successfully...!',
            Hotels: []
        };

        if (soapResult) {
            try {
                const jsonResponse = JSON.parse(soapResult);
                const error = jsonResponse?.Main?.Error;

                response_obj = error
                    ? { status: error.Code || 500, success: false, message: error.Message || 'Unknown error', Hotels: null }
                    : { ...response_obj, Hotels: jsonResponse.Hotels || [] };

            } catch {
                response_obj = { status: 500, success: false, message: 'Invalid JSON format in SOAP response', Hotels: null };
            }
        } else {
            response_obj = { status: 500, success: false, message: 'Invalid SOAP response', Hotels: null };
        }

        res.status(200).json(response_obj);

    } catch (error) {
        console.error('Error in getAllHotels:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

exports.getHotel = async (req, res) => {
    try {
        const { HotelCode, checkIn, checkOut, adults, children } = req.body;
        
        const nights = calculateNights(checkIn, checkOut);        

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
                                <Hotels>
                                    <HotelId>${parseInt(HotelCode)}</HotelId>
                                </Hotels>
                                 <ArrivalDate>${checkIn}</ArrivalDate>
                                <Nights>${parseInt(nights)}</Nights>
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
        const parsedResult = await xml2js.parseStringPromise(data, { explicitArray: false });
        const soapBody = parsedResult['soap:Envelope']?.['soap:Body'] || parsedResult['soap12:Envelope']?.['soap12:Body'];
        const soapResult = soapBody?.MakeRequestResponse?.MakeRequestResult;

        let response_obj = {
            status: 200,
            success: true,
            message: 'Hotels fetched successfully...!',
            Hotels: []
        };

        if (soapResult) {
            try {
                const jsonResponse = JSON.parse(soapResult);
                const error = jsonResponse?.Main?.Error;

                response_obj = error
                    ? { status: error.Code || 500, success: false, message: error.Message || 'Unknown error', Hotels: null }
                    : { ...response_obj, Hotels: jsonResponse.Hotels || [] };

            } catch {
                response_obj = { status: 500, success: false, message: 'Invalid JSON format in SOAP response', Hotels: null };
            }
        } else {
            response_obj = { status: 500, success: false, message: 'Invalid SOAP response', Hotels: null };
        }

        res.status(200).json(response_obj);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Error occured while fetching the hotel!' });
    }
};