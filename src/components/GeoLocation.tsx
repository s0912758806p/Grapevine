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

const GeoLocation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentLocation, isLoading, error } = useSelector(
    (state: RootState) => state.location
  );
  const [showMap, setShowMap] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      dispatch(setLocationError("瀏覽器不支持地理位置功能"));
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
        let errorMessage = "獲取位置時發生未知錯誤";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "用戶拒絕了地理位置請求";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "位置信息不可用";
            break;
          case error.TIMEOUT:
            errorMessage = "獲取用戶位置超時";
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
            'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
            'User-Agent': 'Grapevine App Location Service'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('地址獲取失敗');
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
      console.error('獲取地址時發生錯誤:', error);
      notification.error({
        message: '地址獲取失敗',
        description: '無法將座標轉換為地址',
        placement: 'topRight'
      });
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    if (currentLocation) {
      notification.success({
        message: "成功獲取位置",
        description: `緯度: ${currentLocation.latitude}, 經度: ${currentLocation.longitude}`,
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
    <Card title="位置服務" size="small">
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button 
          type="primary" 
          icon={<AimOutlined />} 
          onClick={getLocation} 
          loading={isLoading}
        >
          獲取當前位置
        </Button>
        
        {error && (
          <Typography.Text type="danger">
            <WarningOutlined /> {error}
          </Typography.Text>
        )}
        
        {isLoading && <Spin tip="獲取位置中..." />}
        {addressLoading && <Spin tip="獲取地址中..." />}
        
        {currentLocation && (
          <div>
            <Typography.Title level={5}>位置信息</Typography.Title>
            {getFormattedAddress()}
            <br />
            <Typography.Text>緯度: {currentLocation.latitude}</Typography.Text>
            <br />
            <Typography.Text>經度: {currentLocation.longitude}</Typography.Text>
            <br />
            <Typography.Text>精確度: {currentLocation.accuracy} 米</Typography.Text>
            <br />
            {currentLocation.address && (
              <>
                <Typography.Text>詳細地址: {currentLocation.address}</Typography.Text>
                <br />
              </>
            )}
            <Typography.Text>
              時間: {new Date(currentLocation.timestamp).toLocaleString()}
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