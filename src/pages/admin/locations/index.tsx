/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { Location } from "@/utils/types";
import Locations from "./_components/Locations";
import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";
import { parseCookies } from "nookies";

export default function Index() {
  const [locationData, setLocationData] = useState<Location[]>([]);

  const fetchLocationData = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/location`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.status === 200) {
        setLocationData(data);
      } else {
        throw new Error("Failed to fetch location data");
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast type="error" content="Failed to fetch location data" t={t} />
      ));
    }
  };

  useEffect(() => {
    // setLocationData(locationOptions);
    fetchLocationData();

    // setLocationGroupData(locationGroups);
    // setLocationGroupMappingData(locationGroupMapping);
  }, []);

  return (
    <Layout
      headerTitle={
        <div className="flex items-center gap-2">
          <div>
            <h1 className="font-bold text-lg">LOCATIONS</h1>
          </div>
        </div>
      }
    >
      <div className="w-full h-[90vh] overflow-hidden flex px-2">
        {/* Locations */}
        <Locations
          locationData={locationData}
          fetchLocationData={fetchLocationData}
        />
        {/* Location Groups */}
        {/* <LocationGroups
          locationData={locationData}
          locationGroupData={locationGroupData}
          fetchLocationGroupData={fetchLocationGroupData}
        /> */}
      </div>
    </Layout>
  );
}
