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
                    <Main Version="2.3" ResponseFormat="JSON" IncludeGeo="false" Currency="USD" HotelFacilities="true" RoomFacilities="true">
                        <MaximumWaitTime>15</MaximumWaitTime>
                        <Nationality>GB</Nationality>
                        <CityCode>17749</CityCode>
                        <ArrivalDate>2024-10-28</ArrivalDate>
                        <Nights>3</Nights>
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

        // Handle missing or malformed hotel data safely
        const hotel_data = jsonResponse.Hotels.map(hotel => {
            // console.log(hotel,'===');

            let minTotalPrice = Infinity;
            let maxStar = 0;
            let bestFacilities = '';

            // Ensure hotel offers exist and are iterable
            if (hotel.Offers && Array.isArray(hotel.Offers)) {
                hotel.Offers.forEach(room => {
                    // Update the minimum total price
                    if (room.TotalPrice < minTotalPrice) {
                        minTotalPrice = room.TotalPrice;
                    }

                    // Update the star rating
                    const starRating = parseInt(room.Category) || 0;  // Fallback to 0 if Category is invalid
                    maxStar = Math.max(maxStar, starRating);

                    // Compare room facilities
                    const roomFacilities = room.Special ? room.Special.split(',').map(fac => fac.trim()) : [];
                    if (roomFacilities.length > bestFacilities.split(',').length) {
                        bestFacilities = room.Special;
                    }
                });
            }

            // Ensure bestFacilities is split into an array if available
            const hotelFacilitiesArray = bestFacilities ? bestFacilities.split(',').map(fac => fac.trim()) : [];

            // Construct the hotel object with the required fields
            return {
                HotelName: hotel.HotelName || 'Unknown',  // Handle missing HotelName
                Location: hotel.Location || 'Unknown',    // Handle missing Location
                HotelImage: hotel.HotelImage || '',       // Handle missing HotelImage
                HotelFacilities: hotelFacilitiesArray,    // Facilities from the room with the most facilities
                TotalPrice: minTotalPrice === Infinity ? 0 : minTotalPrice,  // Fallback to 0 if no valid price found
                Star: maxStar
            };
        });

        console.log(hotel_data, '=====');
    } catch (error) {
        console.error('Error during SOAP request', error);
        throw error;
    }
};

sendSoapRequest();

