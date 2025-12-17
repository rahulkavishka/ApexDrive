import requests

def decode_vin(vin):
    """
    Fetches vehicle details from the free NHTSA API.
    """
    url = f"https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/{vin}?format=json"
    response = requests.get(url)
    data = response.json()

    decoded_data = {}
    
    # The API returns a list of variables. We loop through to find what we need.
    for item in data['Results']:
        variable = item['Variable']
        value = item['Value']
        
        if value:
            if variable == "Make":
                decoded_data['make'] = value
            elif variable == "Model":
                decoded_data['model'] = value
            elif variable == "Model Year":
                decoded_data['year'] = int(value)
            elif variable == "Trim":
                decoded_data['trim'] = value
            elif variable == "Body Class":
                decoded_data['body_style'] = value

    return decoded_data