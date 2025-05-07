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
import {
  throttleGeoPosition,
  getDistanceMeters,
  fetchLocationAddress,
} from "../utils";
import dayjs from "dayjs";

const GeoLocation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentLocation, isLoading, error } = useSelector(
    (state: RootState) => state.location
  );
  const [showMap, setShowMap] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);

  const THROTTLE_INTERVAL: number = 3000;
  const MIN_DISTANCE_METERS: number = 10;
  let lastFetchedLocation: LocationData | null = null;

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
    await fetchAddressAndUpdateStore(
      locationData.latitude,
      locationData.longitude
    );
    lastFetchedLocation = locationData;
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      dispatch(setLocationError("Browser does not support geolocation"));
      return;
    }

    dispatch(setLocationLoading());

    // Use the specialized throttle function for GeolocationPosition
    const throttledPositionUpdate = throttleGeoPosition(
      (position: GeolocationPosition) => {
        void handlePositionUpdate(position);
      },
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

  const fetchAddressAndUpdateStore = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      setAddressLoading(true);

      const addressData = await fetchLocationAddress(latitude, longitude);

      // Update Redux with the address information
      dispatch(updateLocationAddress(addressData));
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

  // Format displayed address
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
            {currentLocation.timestamp && (
              <Typography.Text>
                Time:{" "}
                {dayjs(currentLocation.timestamp).format("YYYY-MM-DD HH:mm:ss")}
              </Typography.Text>
            )}
          </div>
        )}

        {showMap && currentLocation && (
          <div style={{ marginTop: 16 }}>
            <LocationMap
              latitude={currentLocation.latitude}
              longitude={currentLocation.longitude}
              accuracy={currentLocation.accuracy}
              address={currentLocation.address}
              city={currentLocation.city}
              region={currentLocation.region}
              country={currentLocation.country}
            />
          </div>
        )}
      </Space>
    </Card>
  );
};

export default GeoLocation;
