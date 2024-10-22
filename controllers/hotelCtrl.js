const axios = require('axios');
const xml2js = require('xml2js');

exports.getAllHotels = async (req, res) => {
    try {
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
                            <Main Version="2.3" ResponseFormat="JSON" IncludeGeo="false" Currency="USD">
                                <MaximumWaitTime>15</MaximumWaitTime>
                                <Nationality>GB</Nationality>
                                <CityCode>1162</CityCode>
                                <ArrivalDate>2024-10-25</ArrivalDate>
                                <Nights>3</Nights>
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

        const response = await axios.post(process.env.BASE_URL, soapRequest, { headers });
        const result = await xml2js.parseStringPromise(response.data, { explicitArray: false });

        const soapBody = result['soap:Envelope']['soap:Body'];
        const soapResult = soapBody['MakeRequestResponse'].MakeRequestResult;

        const jsonResponse = JSON.parse(soapResult);
        // console.log(jsonResponse,'json response');
        
        res.status(200).json(jsonResponse);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal server error!', error });
    }
};