const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs').promises;

const AGENCY_ID = 148535;
const USER_NAME = "REISENBOOKINGXMLTEST";
const PASSWORD = "JHJDO58X0EV";
const BASE_URL = 'https://reisenbooking.xml.goglobal.travel/xmlwebservice.asmx';

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
                        <Agency>${AGENCY_ID}</Agency>
                        <User>${USER_NAME}</User>
                        <Password>${PASSWORD}</Password>
                        <Operation>HOTEL_SEARCH_REQUEST</Operation>
                        <OperationType>Request</OperationType>
                    </Header>
                    <Main Version="2.3" ResponseFormat="JSON" IncludeGeo="false" Currency="USD">
                        <MaximumWaitTime>15</MaximumWaitTime>
                        <Nationality>GB</Nationality>
                        <CityCode>1162</CityCode>
                        <ArrivalDate>2024-10-25</ArrivalDate>
                        <Nights>2</Nights>
                        <Rooms>
                            <Room Adults="2" RoomCount="1" ChildCount="0"/>
                            <Room Adults="1" RoomCount="1" ChildCount="2">
                                <ChildAge>9</ChildAge>
                                <ChildAge>5</ChildAge>
                            </Room>
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
    'API-AgencyID': AGENCY_ID,
};

async function sendSoapRequest() {
    try {
        const response = await axios.post(BASE_URL, soapRequest, { headers });
        const result = await xml2js.parseStringPromise(response.data, { explicitArray: false });

        // Extract the JSON response from the result
        const soapBody = result['soap:Envelope']['soap:Body'];
        const soapResult = soapBody['MakeRequestResponse'].MakeRequestResult;

        // Convert the response string to JSON
        const jsonResponse = JSON.parse(soapResult);

        // Writing the result to a JSON file
        await fs.writeFile('./hotels.json', JSON.stringify(jsonResponse, null, 4), 'utf8');
        console.log('SOAP request successful and response saved to hotels.json:', jsonResponse);
    } catch (error) {
        console.error('Error during SOAP request', error);
        throw error;
    }
};

// sendSoapRequest();
