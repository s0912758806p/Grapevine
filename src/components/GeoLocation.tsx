import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Space, Spin, Typography, notification, Card, Tag } from "antd";
import {
  AimOutlined,
  WarningOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import LocationMap from "./LocationMap";
import { RootState, AppDispatch } from "../store";
import {
  setLocationLoading,
  setLocationSuccess,
  setLocationError,
  updateLocationAddress,
  LocationData,
} from "../store/locationSlice";
import dayjs from "dayjs";

const GeoLocation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentLocation, isLoading, error } = useSelector(
    (state: RootState) => state.location
  );
  const [showMap, setShowMap] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const THROTTLE_INTERVAL: number = 3000;
  let lastProcessTime: number = 0;

  const MIN_DISTANCE_METERS: number = 10;
  let lastFetchedLocation: LocationData | null = null;

  const throttle = <T extends (position: GeolocationPosition) => void>(
    func: T,
    delay: number
  ): ((position: GeolocationPosition) => void) => {
    return (position: GeolocationPosition) => {
      const now = Date.now();
      if (now - lastProcessTime >= delay) {
        lastProcessTime = now;
        func(position);
      }
    };
  };

  const getDistanceMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Radius of the earth in km
    const toRadians = (value: number) => {
      return (value * Math.PI) / 180;
    };
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
  };

  const handlePositionUpdate = async (position: GeolocationPosition) => {
    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };

    if (lastFetchedLocation) {
      const distance = getDistanceMeters(
        lastFetchedLocation.latitude,
        lastFetchedLocation.longitude,
        locationData.latitude,
        locationData.longitude
      );

      if (distance < MIN_DISTANCE_METERS) {
        return;
      }
    }
    dispatch(setLocationSuccess(locationData));
    setShowMap(true);
    await fetchLocationAddress(locationData.latitude, locationData.longitude);
    lastFetchedLocation = locationData;
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      dispatch(setLocationError("Browser does not support geolocation"));
      return;
    }

    dispatch(setLocationLoading());

    const throttledPositionUpdate = throttle(
      handlePositionUpdate,
      THROTTLE_INTERVAL
    );

    navigator.geolocation.watchPosition(
      throttledPositionUpdate,
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
        maximumAge: 1000,
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
            "Accept-Language": "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7",
            "User-Agent": "Grapevine App Location Service",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get address");
      }

      const data = await response.json();

      // 提取地址信息
      const address = data.display_name;
      const city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.hamlet;
      const region = data.address.state || data.address.county;
      const country = data.address.country;

      // 更新Redux中的地址信息
      dispatch(
        updateLocationAddress({
          address,
          city,
          region,
          country,
        })
      );
    } catch (error) {
      console.error("Error occurred while getting address:", error);
      notification.error({
        message: "Failed to get address",
        description: "Cannot convert coordinates to address",
        placement: "topRight",
      });
    } finally {
      setAddressLoading(false);
    }
  };

  // 格式化顯示地址
  const getFormattedAddress = () => {
    if (!currentLocation) return null;

    const { country, region, city } = currentLocation;

    if (country && (region || city)) {
      return (
        <Tag color="blue" icon={<EnvironmentOutlined />}>
          {country} {region && `- ${region}`}{" "}
          {city && region !== city && `- ${city}`}
        </Tag>
      );
    }

    return null;
  };

  return (
    <Card title="Location Service" size="small">
      <Space direction="vertical" style={{ width: "100%" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="primary"
            icon={<AimOutlined />}
            onClick={getLocation}
            loading={isLoading}
          >
            Get current location
          </Button>
        </div>

        {error && (
          <Typography.Text type="danger">
            <WarningOutlined /> {error}
          </Typography.Text>
        )}

        {isLoading && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Spin tip="Getting location...">
              <div style={{ height: 30 }} />
            </Spin>
          </div>
        )}
        {addressLoading && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <Spin tip="Getting address...">
              <div style={{ height: 30 }} />
            </Spin>
          </div>
        )}

        {currentLocation && (
          <div>
            <Typography.Title level={5}>Location information</Typography.Title>
            {getFormattedAddress()}
            <br />
            <Typography.Text>
              Latitude: {currentLocation.latitude}
            </Typography.Text>
            <br />
            <Typography.Text>
              Longitude: {currentLocation.longitude}
            </Typography.Text>
            <br />
            <Typography.Text>
              Accuracy: {currentLocation.accuracy} meters
            </Typography.Text>
            <br />
            {currentLocation.address && (
              <>
                <Typography.Text>
                  Detailed address: {currentLocation.address}
                </Typography.Text>
                <br />
              </>
            )}
            <Typography.Text>
              Time:{" "}
              {dayjs(currentLocation.timestamp).format("YYYY-MM-DD HH:mm:ss")}
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
