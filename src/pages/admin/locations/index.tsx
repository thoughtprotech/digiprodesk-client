import Layout from '@/components/Layout'
import { MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Location, LocationGroup, LocationGroupMapping } from '@/utils/types'
import Locations from './_components/Locations'
import LocationGroups from './_components/LocationGroup'

const locationOptions: Location[] = [
  {
    LocationID: 1,
    LocatonName: 'Olive Indiranagar',
    LocationCode: 'OP',
    LocationType: 'Property',
    LocationParentID: 4,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: true,
  },
  {
    LocationID: 2,
    LocatonName: 'Olive HSR',
    LocationCode: 'OO',
    LocationType: 'Property',
    LocationParentID: 5,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: false,
  },
  {
    LocationID: 3,
    LocatonName: 'Olive Whitefield',
    LocationCode: 'OR',
    LocationType: 'Property',
    LocationParentID: 4,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: true,
  },
  {
    LocationID: 4,
    LocatonName: 'Head Office',
    LocationCode: 'HO',
    LocationType: 'Control',
    LocationParentID: 0,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: true,
  },
  {
    LocationID: 5,
    LocatonName: 'Regional Office',
    LocationCode: 'RO',
    LocationType: 'Control',
    LocationParentID: 0,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: false,
  },
  {
    LocationID: 6,
    LocatonName: 'Olive Koramangala',
    LocationCode: 'OK',
    LocationType: 'Property',
    LocationParentID: 5,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: true,
  },
  {
    LocationID: 7,
    LocatonName: 'Olive Jayanagar',
    LocationCode: 'OJ',
    LocationType: 'Property',
    LocationParentID: 5,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: true,
  },
  {
    LocationID: 8,
    LocatonName: 'Olive BTM',
    LocationCode: 'OB',
    LocationType: 'Property',
    LocationParentID: 5,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: true,
  },
  {
    LocationID: 9,
    LocatonName: 'Olive Marathahalli',
    LocationCode: 'OM',
    LocationType: 'Property',
    LocationParentID: 5,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: true,
  },
  {
    LocationID: 10,
    LocatonName: 'Olive Sarjapur',
    LocationCode: 'OS',
    LocationType: 'Property',
    LocationParentID: 5,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: true,
  }

]

const locationGroups: LocationGroup[] = [
  { LocationGroupID: 1, LocatonGroupName: "Olive Properties", isActive: true },
  { LocationGroupID: 2, LocatonGroupName: "Olive Offices", isActive: false },
  { LocationGroupID: 3, LocatonGroupName: "Olive Residential", isActive: true },
]

const locationGroupMapping: LocationGroupMapping[] = [
  { LocationGroupID: 1, LocationID: [1, 2, 3, 6, 7, 8, 9, 10] },
  { LocationGroupID: 2, LocationID: [4, 5] },
  { LocationGroupID: 3, LocationID: [1, 2, 3, 6, 7, 8, 9, 10] },
]

export default function Index() {
  const [locationData, setLocationData] = useState<Location[]>([]);
  const [locationGroupData, setLocationGroupData] = useState<LocationGroup[]>([]);
  const [locationGroupMappingData, setLocationGroupMappingData] = useState<LocationGroupMapping[]>([]);

  useEffect(() => {
    setLocationData(locationOptions);
    setLocationGroupData(locationGroups);
    setLocationGroupMappingData(locationGroupMapping);
  }, [])

  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div>
          <MapPin />
        </div>
        <div>
          <h1 className='font-bold text-2xl'>LOCATIONS</h1>
        </div>
      </div>
    }>
      <div className='w-full h-[90vh] overflow-hidden flex'>
        {/* Locations */}
        <Locations
          locationData={locationData}
          setLocationData={setLocationData}
          locationOptions={locationOptions}
        />
        {/* Location Groups */}
        <LocationGroups
          locationData={locationData}
          locationGroupData={locationGroupData}
          locationGroupMappingData={locationGroupMappingData}
          setLocationGroupMappingData={setLocationGroupMappingData}
          locationGroupMapping={locationGroupMapping}
        />
      </div>
    </Layout>
  )
}
