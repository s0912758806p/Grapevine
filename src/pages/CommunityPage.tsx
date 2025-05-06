import React from "react";
import CommunityFeatures from "../components/community/CommunityFeatures";
import "../styles/CommunityPage.scss";

const CommunityPage: React.FC = () => {
  return (
    <div className="community-page">
      <CommunityFeatures />
    </div>
  );
};

export default CommunityPage;
