import Layout from '@/components/Layout'
import { MapPin, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Location, LocationGroup, LocationGroupMapping } from '@/utils/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Tooltip from '@/components/ui/ToolTip'
import Modal from '@/components/ui/Modal'

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
  const [createLocationModal, setCreateLocationModal] = useState<boolean>(false);
  const [editLocationModal, setEditLocationModal] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [createLocationFormData, setCreateLocationFormData] = useState<Location>({
    LocatonName: '',
    LocationCode: '',
    LocationType: '',
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: false,
  });
  const [createLocationGroupFormData, setCreateLocationGroupFormData] = useState<{
    LocatonGroupName: string;
    isActive: boolean;
    LocationID: number[];
  }>({
    LocatonGroupName: '',
    isActive: false,
    LocationID: []
  });
  const [selectedLocationGroup, setSelectedLocationGroup] = useState<{
    LocatonGroupName: string;
    isActive: boolean;
    LocationID: number[];
  }>({
    LocatonGroupName: '',
    isActive: false,
    LocationID: []
  });
  const [createLocationGroupModal, setCreateLocationGroupModal] = useState<boolean>(false);
  const [editLocationGroupModal, setEditLocationGroupModal] = useState<boolean>(false);

  const handleCreateLocationChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCreateLocationFormData({
      ...createLocationFormData,
      [event.target.name]: event.target.value
    });
  }

  const handleEditLocationChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (selectedLocation) {
      setSelectedLocation({
        ...selectedLocation,
        [event.target.name]: event.target.value || ''
      });
    }
  }

  const handleCreateLocationGroupChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCreateLocationGroupFormData({
      ...createLocationGroupFormData,
      [event.target.name]: event.target.value
    });
  }

  const handleEditLocationGroupChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (selectedLocationGroup) {
      setSelectedLocationGroup({
        ...selectedLocationGroup,
        [event.target.name]: event.target.value || ''
      });
    }
  }

  const handleOpenCreateLocationGroupModal = () => {
    setCreateLocationGroupModal(true);
  }

  const handleCloseCreateLocationGroupModal = () => {
    setCreateLocationGroupModal(false);
  }

  const handleOpenEditLocationGroupModal = (locationGroup: LocationGroup) => {
    setSelectedLocationGroup({
      LocatonGroupName: locationGroup.LocatonGroupName,
      isActive: locationGroup.isActive,
      LocationID: locationGroupMapping.find(group => group.LocationGroupID === locationGroup.LocationGroupID)?.LocationID || []
    });
    setEditLocationGroupModal(true);
  }

  const handleCloseEditLocationGroupModal = () => {
    setSelectedLocationGroup({
      LocatonGroupName: '',
      isActive: false,
      LocationID: []
    });
    setEditLocationGroupModal(false);
  }

  const handleOpenCreateLocationModal = () => {
    setCreateLocationModal(true);
  }

  const handleCloseCreateLocationModal = () => {
    setCreateLocationModal(false);
  }

  const handleOpenEditLocationModal = (location: Location) => {
    setSelectedLocation(location);
    setEditLocationModal(true);
  }

  const handleCloseEditLocationModal = () => {
    setSelectedLocation(null);
    setEditLocationModal(false);
  }

  const handleCreateLocationSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(createLocationFormData);
  }

  const handleEditLocationSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(selectedLocation);
  }

  const handleCreateLocationGroupSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log(createLocationGroupFormData);
    setCreateLocationGroupFormData({
      LocatonGroupName: '',
      isActive: false,
      LocationID: []
    });
    handleCloseCreateLocationGroupModal();
  }

  const handleSearchLocation = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const searchValue = event.target.value;
    const filteredLocations = locationOptions.filter(location => location.LocatonName.toLowerCase().includes(searchValue.toLowerCase()));
    setLocationData(filteredLocations);
  }

  const handleSearchGroup = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const searchValue = event.target.value;
    // Search by name of locationGroupId name
    const filteredGroups = locationGroupMapping.filter(group => locationGroups.find(locationGroup => locationGroup.LocationGroupID === group.LocationGroupID)?.LocatonGroupName.toLowerCase().includes(searchValue.toLowerCase()));
    setLocationGroupMappingData(filteredGroups);
  }

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
        <div className='w-1/2 h-full overflow-y-auto border-r border-r-border flex flex-col relative'>
          <div className='flex items-center justify-between sticky top-0 bg-background p-2 border-b border-b-border'>
            <div>
              <Input placeholder='Search Locations' onChange={handleSearchLocation} />
            </div>
            <div>
              <Button color='foreground' icon={<Plus />} text='Location' onClick={handleOpenCreateLocationModal} />
            </div>
          </div>
          <div className='w-full h-full p-2'>
            {/* Create a grid to display locationOptions in cards */}
            <div className="w-full h-fit grid grid-cols-3 gap-2">

              {
                locationData.map((location, index) => (
                  <div key={index} className='w-full h-fit rounded-md bg-foreground border border-border hover:bg-background duration-300 p-2 cursor-pointer' onClick={handleOpenEditLocationModal.bind(null, location)}>
                    <div>
                      <div>
                        <h1 className='font-bold text-xl'>{location.LocatonName}</h1>
                      </div>
                      <div className='w-full flex justify-between'>
                        <div className='flex justify-between items-center gap-2'>
                          <div className='w-full'>
                            <div className='w-full flex gap-1 items-center'>
                              <h1 className='font-bold text-sm text-textAlt'>Code</h1>
                              <h1 className='font-bold text-sm text-text'>
                                {location.LocationCode}
                              </h1>
                            </div>
                            <div className='w-full flex gap-1 items-center'>
                              <h1 className='font-bold text-sm text-textAlt'>Type</h1>
                              <h1 className='font-bold text-sm text-text'>
                                {location.LocationType}
                              </h1>
                            </div>
                          </div>
                        </div>
                        <div>
                          {
                            location.IsActive ? (
                              <span
                                className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/30 text-green-500"
                              >
                                Active
                              </span>
                            ) : (
                              <span
                                className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/30 text-red-500"
                              >
                                Inactive
                              </span>
                            )
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Create Location Modal */}
          {
            createLocationModal && (
              <Modal title='Create Location' onClose={handleCloseCreateLocationModal}>
                <form onSubmit={handleCreateLocationSubmit}>
                  <div className='flex flex-col gap-2'>
                    <div className='w-full flex justify-between gap-2'>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Details
                        </h1>
                        <Input
                          placeholder='Location Name'
                          name='LocatonName'
                          value={createLocationFormData.LocatonName}
                          onChange={handleCreateLocationChange}
                          required
                        />
                      </div>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Code
                        </h1>
                        <Input
                          placeholder='Location Code'
                          name='LocationCode'
                          value={createLocationFormData.LocationCode}
                          onChange={handleCreateLocationChange}
                          required
                        />
                      </div>
                    </div>
                    <div className='w-full flex justify-between gap-2'>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Type
                        </h1>
                        <Select
                          options={
                            [
                              { value: 'Property', label: 'Property' },
                              { value: 'Control', label: 'Control' },
                            ]
                          }
                          placeholder='Select Location Type'
                          onChange={(e) => setCreateLocationFormData({ ...createLocationFormData, LocationType: e.target.value })}
                        />
                      </div>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Image
                        </h1>
                        <Input
                          placeholder='Location Image'
                          name='LocationImage'
                          value={createLocationFormData.LocationImage}
                          onChange={handleCreateLocationChange}
                          type="file"
                          required
                        />
                      </div>
                    </div>
                    <div className='w-full flex justify-between gap-2'>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Banner
                        </h1>
                        <Input
                          placeholder='Location Banner'
                          name='LocationBanner'
                          value={createLocationFormData.LocationBanner}
                          onChange={handleCreateLocationChange}
                          type="file"
                          required
                        />
                      </div>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Receptionist Photo
                        </h1>
                        <Input
                          placeholder='Location Receptionist Photo'
                          name='LocationReceptionistPhoto'
                          value={createLocationFormData.LocationReceptionistPhoto}
                          onChange={handleCreateLocationChange}
                          type="file"
                          required
                        />
                      </div>
                    </div>
                    <div className='w-full'>
                      <h1 className='font-bold text-sm'>
                        Is Active
                      </h1>
                      <Input
                        type='checkBox'
                        name='IsActive'
                        value={createLocationFormData.IsActive.toString()}
                        onChange={(e) => setCreateLocationFormData({ ...createLocationFormData, IsActive: (e.target as HTMLInputElement).checked })}
                        required
                      />
                    </div>

                    <div className='flex justify-end gap-2'>
                      <Button text='Create Location' color='foreground' type='submit' />
                    </div>
                  </div>
                </form>
              </Modal>
            )
          }

          {/* Edit Location Modal */}
          {
            editLocationModal && (
              <Modal title='Edit Location' onClose={handleCloseEditLocationModal}>
                <form onSubmit={handleEditLocationSubmit}>
                  <div className='flex flex-col gap-2'>
                    <div className='w-full flex justify-between gap-2'>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Details
                        </h1>
                        <Input
                          placeholder='Location Name'
                          name='LocatonName'
                          value={selectedLocation!.LocatonName}
                          onChange={handleEditLocationChange}
                          required
                        />
                      </div>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Code
                        </h1>
                        <Input
                          placeholder='Location Code'
                          name='LocationCode'
                          value={selectedLocation!.LocationCode}
                          onChange={handleEditLocationChange}
                          required
                        />
                      </div>
                    </div>
                    <div className='w-full flex justify-between gap-2'>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Type
                        </h1>
                        <Select
                          options={
                            [
                              { value: 'Property', label: 'Property' },
                              { value: 'Control', label: 'Control' },
                            ]
                          }
                          placeholder='Select Location Type'
                          onChange={(e) => setSelectedLocation({ ...selectedLocation!, LocationType: e.target.value })}
                          defaultValue={selectedLocation!.LocationType}
                        />
                      </div>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Image
                        </h1>
                        <Input
                          placeholder='Location Image'
                          name='LocationImage'
                          value={selectedLocation!.LocationImage}
                          onChange={handleEditLocationChange}
                          type="file"
                          required
                        />
                      </div>
                    </div>
                    <div className='w-full flex justify-between gap-2'>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Banner
                        </h1>
                        <Input
                          placeholder='Location Banner'
                          name='LocationBanner'
                          value={selectedLocation!.LocationBanner}
                          onChange={handleEditLocationChange}
                          type="file"
                          required
                        />
                      </div>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Receptionist Photo
                        </h1>
                        <Input
                          placeholder='Location Receptionist Photo'
                          name='LocationReceptionistPhoto'
                          value={selectedLocation!.LocationReceptionistPhoto}
                          onChange={handleEditLocationChange}
                          type="file"
                          required
                        />
                      </div>
                    </div>
                    <div className='w-full'>
                      <h1 className='font-bold text-sm'>
                        Is Active
                      </h1>
                      <Input
                        type='checkBox'
                        name='IsActive'
                        value={selectedLocation!.IsActive.toString()}
                        onChange={(e) => setSelectedLocation({ ...selectedLocation!, IsActive: (e.target as HTMLInputElement).checked })}
                        required
                      />
                    </div>

                    <div className='flex justify-end gap-2'>
                      <Button text='Create Location' color='foreground' type='submit' />
                    </div>
                  </div>
                </form>
              </Modal>
            )
          }
        </div>
        <div className='w-1/2 h-full overflow-y-auto flex flex-col gap-2 relative'>
          <div className='flex items-center justify-between sticky top-0 bg-background p-2 border-b border-b-border'>
            <div>
              <Input placeholder='Search Location Groups' onChange={handleSearchGroup} />
            </div>
            <div>
              <Button color='foreground' icon={<Plus />} text='Location Group' onClick={handleOpenCreateLocationGroupModal} />
            </div>
          </div>
          <div className='w-full h-full p-2'>
            {/* Create a grid to display locationGroups in cards */}
            <div className="w-full h-fit grid grid-cols-3 gap-2">
              {
                locationGroupMappingData.map((group, index) => (
                  <div key={index} className='w-full h-fit rounded-md bg-foreground border border-border hover:bg-background duration-300 p-2 cursor-pointer' onClick={handleOpenEditLocationGroupModal.bind(null, locationGroups.find(locationGroup => locationGroup.LocationGroupID === group.LocationGroupID)!)}>
                    <div>
                      <div>
                        <h1 className='font-bold text-xl'>{
                          locationGroupData.find(locationGroup => locationGroup.LocationGroupID === group.LocationGroupID)?.LocatonGroupName
                        }</h1>
                      </div>
                      <div className='w-full flex justify-between'>
                        <div className='flex justify-between items-center gap-2'>
                          <div className='w-full'>
                            <div className='w-full flex gap-1 items-center'>
                              <h1 className='font-bold text-sm text-textAlt'>Locations</h1>
                              <h1 className='font-bold text-sm text-text'>
                                {group.LocationID.length}
                              </h1>
                            </div>
                          </div>
                          {
                            locationGroupData.find(locationGroup => locationGroup.LocationGroupID === group.LocationGroupID)?.isActive ? (
                              <span
                                className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/30 text-green-500"
                              >
                                Active
                              </span>
                            ) : (
                              <span
                                className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/30 text-red-500"
                              >
                                Inactive
                              </span>
                            )
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
            {/* Create Location Group Modal */}
            {
              createLocationGroupModal && (
                <Modal title='Create Location Group' onClose={handleCloseCreateLocationGroupModal}>
                  <form className='w-full' onSubmit={handleCreateLocationGroupSubmit}>
                    <div className='w-full flex flex-col gap-4'>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Group Details
                        </h1>
                        <Input
                          placeholder='Location Group Name'
                          name='LocatonGroupName'
                          value={createLocationGroupFormData.LocatonGroupName}
                          onChange={handleCreateLocationGroupChange}
                          required
                        />
                      </div>
                      <div className='w-full flex flex-col gap-2'>
                        <div>
                          <Select
                            placeholder='Select Locations'
                            options={locationOptions.filter(
                              location => !createLocationGroupFormData.LocationID.includes(location.LocationID!)
                            ).map(location => location.LocationID !== undefined ? ({ value: location.LocationID.toString(), label: location.LocatonName }) : null).filter(option => option !== null)}
                            onChange={(e) => {
                              setCreateLocationGroupFormData({
                                ...createLocationGroupFormData,
                                LocationID: [
                                  ...createLocationGroupFormData.LocationID,
                                  Number(e.target.value)
                                ]
                              });
                            }}
                            name='LocationID'
                          />
                        </div>
                        <div>
                          {
                            createLocationGroupFormData.LocationID.length > 0 && (
                              <div className='w-full flex flex-wrap gap-2'>
                                {
                                  createLocationGroupFormData.LocationID.map((locationId, index) => (
                                    <div key={index} className='w-fit flex items-center gap-2 bg-background px-2 rounded-md'>
                                      <h1 className='font-bold text-sm'>
                                        {
                                          locationOptions.find(location => location.LocationID === locationId)?.LocatonName
                                        }
                                      </h1>
                                      <Tooltip tooltip='Remove Location' position='bottom'>
                                        <X className='w-4 cursor-pointer' onClick={() => {
                                          setCreateLocationGroupFormData({
                                            ...createLocationGroupFormData,
                                            LocationID: createLocationGroupFormData.LocationID.filter(id => id !== locationId)
                                          });
                                        }} />
                                      </Tooltip>
                                    </div>
                                  ))
                                }
                              </div>
                            )
                          }
                        </div>
                      </div>
                      <div className='w-full flex items-center gap-2'>
                        <Input
                          type='checkBox'
                          name='isActive'
                          value={createLocationGroupFormData.isActive.toString()}
                          onChange={(e) => setCreateLocationGroupFormData({ ...createLocationGroupFormData, isActive: (e.target as HTMLInputElement).checked })}
                          required
                        />
                        <h1 className='font-bold text-sm'>
                          Is Active
                        </h1>
                      </div>
                      <div className='w-full flex justify-end gap-2'>
                        <Button text='Create Location Group' color='foreground' type='submit' />
                      </div>
                    </div>
                  </form>
                </Modal>
              )
            }
            {/* Edit Location Group Modal */}
            {
              editLocationGroupModal && (
                <Modal title='Edit Location Group' onClose={handleCloseEditLocationGroupModal}>
                  <form className='w-full' onSubmit={handleCreateLocationGroupSubmit}>
                    <div className='w-full flex flex-col gap-4'>
                      <div className='w-full'>
                        <h1 className='font-bold text-sm'>
                          Location Group Details
                        </h1>
                        <Input
                          placeholder='Location Group Name'
                          name='LocatonGroupName'
                          value={selectedLocationGroup?.LocatonGroupName}
                          onChange={handleEditLocationGroupChange}
                          required
                        />
                      </div>
                      <div className='w-full flex flex-col gap-2'>
                        <div>
                          <Select
                            placeholder='Select Locations'
                            options={locationOptions.filter(
                              location => !selectedLocationGroup.LocationID.includes(location.LocationID!)
                            ).map(location => location.LocationID !== undefined ? ({ value: location.LocationID.toString(), label: location.LocatonName }) : null).filter(option => option !== null)}
                            onChange={(e) => {
                              setSelectedLocationGroup({
                                ...selectedLocationGroup,
                                LocationID: [
                                  ...selectedLocationGroup.LocationID,
                                  Number(e.target.value)
                                ]
                              });
                            }}
                            name='LocationID'
                            defaultValue={
                              locationOptions.filter(
                                location => !selectedLocationGroup.LocationID.includes(location.LocationID!)
                              ).map(location => location.LocationID !== undefined ? ({ value: location.LocationID.toString(), label: location.LocatonName }) : null).filter(option => option !== null)[0]?.value
                            }
                          />
                        </div>
                        <div>
                          {
                            selectedLocationGroup.LocationID.length > 0 && (
                              <div className='w-full flex flex-wrap gap-2'>
                                {
                                  selectedLocationGroup.LocationID.map((locationId, index) => (
                                    <div key={index} className='w-fit flex items-center gap-2 bg-background px-2 rounded-md'>
                                      <h1 className='font-bold text-sm'>
                                        {
                                          locationOptions.find(location => location.LocationID === locationId)?.LocatonName
                                        }
                                      </h1>
                                      <Tooltip tooltip='Remove Location' position='bottom'>
                                        <X className='w-4 cursor-pointer' onClick={() => {
                                          setSelectedLocationGroup({
                                            ...selectedLocationGroup,
                                            LocationID: selectedLocationGroup.LocationID.filter(id => id !== locationId)
                                          });
                                        }} />
                                      </Tooltip>
                                    </div>
                                  ))
                                }
                              </div>
                            )
                          }
                        </div>
                      </div>
                      <div className='w-full flex items-center gap-2'>
                        <Input type='checkBox' name='isActive' value={selectedLocationGroup?.isActive.toString()} onChange={(e) => setSelectedLocationGroup({ ...selectedLocationGroup!, isActive: (e.target as HTMLInputElement).checked })} required />
                        <h1 className='font-bold text-sm'>
                          Is Active
                        </h1>
                      </div>
                      <div className='w-full flex justify-end gap-2'>
                        <Button text='Create Location Group' color='foreground' type='submit' />
                      </div>
                    </div>
                  </form>
                </Modal>
              )
            }
          </div>
        </div>
      </div>
    </Layout>
  )
}
