import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Tooltip from "@/components/ui/ToolTip";
import { Location, LocationGroup, LocationGroupMapping } from "@/utils/types";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export default function LocationGroups({ locationGroupMappingData, setLocationGroupMappingData, locationGroupData, locationData, locationGroupMapping }: {
  locationGroupMappingData: LocationGroupMapping[];
  setLocationGroupMappingData: React.Dispatch<React.SetStateAction<LocationGroupMapping[]>>;
  locationGroupData: LocationGroup[];
  locationData: Location[];
  locationGroupMapping: LocationGroupMapping[];
}
) {
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
      LocationID: locationGroupMappingData.find(group => group.LocationGroupID === locationGroup.LocationGroupID)?.LocationID || []
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

  const handleSearchGroup = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const searchValue = event.target.value;
    // Search by name of locationGroupId name
    const filteredGroups = locationGroupMapping.filter(group => locationGroupData.find(locationGroup => locationGroup.LocationGroupID === group.LocationGroupID)?.LocatonGroupName.toLowerCase().includes(searchValue.toLowerCase()));
    setLocationGroupMappingData(filteredGroups);
  }

  return (
    <div className='w-1/2 h-full overflow-y-auto flex flex-col relative'>
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
            locationGroupMappingData?.map((group, index) => (
              <div key={index} className='w-full h-fit rounded-md bg-foreground border border-border hover:bg-background duration-300 p-2 cursor-pointer' onClick={handleOpenEditLocationGroupModal.bind(null, locationGroupData.find(locationGroup => locationGroup.LocationGroupID === group.LocationGroupID)!)}>
                <div>
                  <div>
                    <h1 className='font-bold text-xl'>{
                      locationGroupData.find(locationGroup => locationGroup.LocationGroupID === group.LocationGroupID)?.LocatonGroupName
                    }</h1>
                  </div>
                  <div className='w-full flex justify-between'>
                    <div className='w-full flex justify-between items-center gap-2'>
                      <div className='w-full'>
                        <div className='w-full flex gap-1 items-center'>
                          <h1 className='font-bold text-sm text-textAlt'>Locations</h1>
                          <h1 className='font-bold text-sm text-text'>
                            {group.LocationID.length}
                          </h1>
                        </div>
                      </div>
                      <div>
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
                        options={locationData.filter(
                          location => !createLocationGroupFormData.LocationID.includes(location.LocationID!)
                        )?.map(location => location.LocationID !== undefined ? ({ value: location.LocationID.toString(), label: location.LocatonName }) : null).filter(option => option !== null)}
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
                              createLocationGroupFormData.LocationID?.map((locationId, index) => (
                                <div key={index} className='w-fit flex items-center gap-2 bg-background px-2 rounded-md'>
                                  <h1 className='font-bold text-sm'>
                                    {
                                      locationData.find(location => location.LocationID === locationId)?.LocatonName
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
                        options={locationData.filter(
                          location => !selectedLocationGroup.LocationID.includes(location.LocationID!)
                        )?.map(location => location.LocationID !== undefined ? ({ value: location.LocationID.toString(), label: location.LocatonName }) : null).filter(option => option !== null)}
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
                          locationData.filter(
                            location => !selectedLocationGroup.LocationID.includes(location.LocationID!)
                          )?.map(location => location.LocationID !== undefined ? ({ value: location.LocationID.toString(), label: location.LocatonName }) : null).filter(option => option !== null)[0]?.value
                        }
                      />
                    </div>
                    <div>
                      {
                        selectedLocationGroup.LocationID.length > 0 && (
                          <div className='w-full flex flex-wrap gap-2'>
                            {
                              selectedLocationGroup.LocationID?.map((locationId, index) => (
                                <div key={index} className='w-fit flex items-center gap-2 bg-background px-2 rounded-md'>
                                  <h1 className='font-bold text-sm'>
                                    {
                                      locationData.find(location => location.LocationID === locationId)?.LocatonName
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
  )
}