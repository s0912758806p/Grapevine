import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Space, Spin, Typography, notification, Card, Tag } from "antd";
import { AimOutlined, WarningOutlined, EnvironmentOutlined } from "@ant-design/icons";
import LocationMap from "./LocationMap";
import { RootState, AppDispatch } from "../store";
import { 
  setLocationLoading, 
  setLocationSuccess, 
  setLocationError,
  updateLocationAddress,
  LocationData
} from "../store/locationSlice";
import dayjs from "dayjs";

const GeoLocation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentLocation, isLoading, error } = useSelector(
    (state: RootState) => state.location
  );
  const [showMap, setShowMap] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      dispatch(setLocationError("Browser does not support geolocation"));
      return;
    }

    dispatch(setLocationLoading());

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        dispatch(setLocationSuccess(locationData));
        setShowMap(true);
        fetchLocationAddress(locationData.latitude, locationData.longitude);
      },
      (error) => {
        let errorMessage = "Unknown error occurred while getting location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "User denied geolocation request";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Timeout while getting user location";
            break;
        }
        
        dispatch(setLocationError(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const fetchLocationAddress = async (latitude: number, longitude: number) => {
    try {
      setAddressLoading(true);
      // 使用OpenStreetMap的Nominatim API進行反向地理編碼
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7',
            'User-Agent': 'Grapevine App Location Service'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to get address');
      }
      
      const data = await response.json();
      
      // 提取地址信息
      const address = data.display_name;
      const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
      const region = data.address.state || data.address.county;
      const country = data.address.country;
      
      // 更新Redux中的地址信息
      dispatch(updateLocationAddress({
        address,
        city,
        region,
        country
      }));
    } catch (error) {
      console.error('Error occurred while getting address:', error);
      notification.error({
        message: 'Failed to get address',
        description: 'Cannot convert coordinates to address',
        placement: 'topRight'
      });
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (currentLocation) {
      notification.success({
        message: "Successfully got location",
        description: `Latitude: ${currentLocation.latitude}, Longitude: ${currentLocation.longitude}`,
        placement: "topRight",
      });
    }
  }, [currentLocation]);

  // 格式化顯示地址
  const getFormattedAddress = () => {
    if (!currentLocation) return null;
    
    const { country, region, city } = currentLocation;
    
    if (country && (region || city)) {
      return (
        <Tag color="blue" icon={<EnvironmentOutlined />}>
          {country} {region && `- ${region}`} {city && region !== city && `- ${city}`}
        </Tag>
      );
    }
    
    return null;
  };

  return (
    <Card title="Location Service" size="small">
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button 
          type="primary" 
          icon={<AimOutlined />} 
          onClick={getLocation} 
          loading={isLoading}
        >
          Get current location
        </Button>
        
        {error && (
          <Typography.Text type="danger">
            <WarningOutlined /> {error}
          </Typography.Text>
        )}
        
        {isLoading && <Spin tip="Getting location..." />}
        {addressLoading && <Spin tip="Getting address..." />}
        
        {currentLocation && (
          <div>
            <Typography.Title level={5}>Location information</Typography.Title>
            {getFormattedAddress()}
            <br />
            <Typography.Text>Latitude: {currentLocation.latitude}</Typography.Text>
            <br />
            <Typography.Text>Longitude: {currentLocation.longitude}</Typography.Text>
            <br />
            <Typography.Text>Accuracy: {currentLocation.accuracy} meters</Typography.Text>
            <br />
            {currentLocation.address && (
              <>
                <Typography.Text>Detailed address: {currentLocation.address}</Typography.Text>
                <br />
              </>
            )}
            <Typography.Text>
              Time: {dayjs(currentLocation.timestamp).format('YYYY-MM-DD HH:mm:ss')}
            </Typography.Text>
            
            {showMap && (
              <LocationMap 
                latitude={currentLocation.latitude}
                longitude={currentLocation.longitude}
                accuracy={currentLocation.accuracy}
                address={currentLocation.address}
                city={currentLocation.city}
                region={currentLocation.region}
                country={currentLocation.country}
              />
            )}
          </div>
        )}
      </Space>
    </Card>
  );
};

export default GeoLocation; 