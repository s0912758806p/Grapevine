import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 解決Leaflet圖標問題的替代方法
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationMapProps {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
}

const LocationMap = ({ 
  latitude, 
  longitude, 
  accuracy,
  address,
  city,
  region,
  country
}: LocationMapProps) => {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], 15);
    }
  }, [latitude, longitude]);

  // 生成位置描述
  const getLocationDescription = () => {
    if (city && region && country) {
      return `${country} - ${region} - ${city}`;
    } else if (city && country) {
      return `${country} - ${city}`;
    } else if (region && country) {
      return `${country} - ${region}`;
    } else if (country) {
      return country;
    } else {
      return "您的位置";
    }
  };

  return (
    <div style={{ height: "300px", width: "100%", marginTop: "16px" }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]} icon={icon}>
          <Popup>
            <strong>{getLocationDescription()}</strong> <br />
            精確度: {accuracy} 米
            {address && (
              <>
                <br />
                <small>{address}</small>
              </>
            )}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationMap; 