/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from '@/components/Layout'
import { useEffect, useState } from 'react'
import { Location, LocationGroup, LocationGroupMapping } from '@/utils/types'
import Locations from './_components/Locations'
import LocationGroups from './_components/LocationGroup'
import toast from 'react-hot-toast'
import Toast from '@/components/ui/Toast'
import { parseCookies } from 'nookies'

export default function Index() {
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [locationGroupData, setLocationGroupData] = useState<LocationGroup[]>([]);
  const [locationGroupMappingData, setLocationGroupMappingData] = useState<LocationGroupMapping[]>([]);

  const fetchLocationData = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/location`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      if (response.status === 200) {
        setLocationData(data);
      } else {
        throw new Error('Failed to fetch location data');
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast type='error' content='Failed to fetch location data' t={t} />
      ))
    }
  }

  const fetchLocationGroupData = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/locationGroup`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      if (response.status === 200) {
        setLocationGroupData(data);
      } else {
        throw new Error('Failed to fetch location group data');
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast type='error' content='Failed to fetch location group data' t={t} />
      ))
    }
  }

  useEffect(() => {
    // setLocationData(locationOptions);
    fetchLocationData();
    fetchLocationGroupData();

    // setLocationGroupData(locationGroups);
    // setLocationGroupMappingData(locationGroupMapping);
  }, [])

  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div className="border-r border-r-border pr-2">
          <h1 className="font-bold text-lg">OLIVE HEAD OFFICE</h1>
        </div>
        <div>
          <h1 className='font-bold text-lg'>LOCATIONS</h1>
        </div>
      </div>
    }>
      <div className='w-full h-[90vh] overflow-hidden flex px-2'>
        {/* Locations */}
        <Locations
          locationData={locationData}
          setLocationData={setLocationData}
          locationOptions={locationData}
          fetchLocationData={fetchLocationData}
          fetchLocationGroupData={fetchLocationGroupData}
        />
        {/* Location Groups */}
        <LocationGroups
          locationData={locationData}
          locationGroupData={locationGroupData}
          locationGroupMappingData={locationGroupMappingData}
          setLocationGroupMappingData={setLocationGroupMappingData}
          fetchLocationGroupData={fetchLocationGroupData}
        />
      </div>
    </Layout>
  )
}
