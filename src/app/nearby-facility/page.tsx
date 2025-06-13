"use client";
import dynamic from "next/dynamic";

const MapWithFacilities = dynamic(() => import("./MapWithFacilities"), { ssr: false });

export default function NearbyFacilityPage() {
  return <MapWithFacilities />;
}
