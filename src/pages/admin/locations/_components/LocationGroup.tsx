/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Toast from "@/components/ui/Toast";
import { Location, LocationGroup, LocationGroupMapping } from "@/utils/types";
import { Plus, X } from "lucide-react";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function LocationGroups({ locationGroupData, locationData, fetchLocationGroupData }: {
  locationGroupMappingData: LocationGroupMapping[];
  setLocationGroupMappingData: React.Dispatch<React.SetStateAction<LocationGroupMapping[]>>;
  locationGroupData: LocationGroup[];
  locationData: Location[];
  fetchLocationGroupData: () => void;
}
) {
  const [createLocationGroupFormData, setCreateLocationGroupFormData] = useState<LocationGroup>({
    LocationGroupName: "",
    IsActive: 0,
    Locations: []
  });
  const [selectedLocationGroup, setSelectedLocationGroup] = useState<LocationGroup>({
    LocationGroupId: 0,
    LocationGroupName: "",
    IsActive: 0,
    Locations: []
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
    console.log({ locationGroup });
    setSelectedLocationGroup({
      LocationGroupId: locationGroup.LocationGroupId,
      LocationGroupName: locationGroup.LocationGroupName,
      IsActive: locationGroup.IsActive,
      Locations: locationGroup.Locations
    });
    setEditLocationGroupModal(true);
  }

  const handleCloseEditLocationGroupModal = () => {
    setSelectedLocationGroup({
      LocationGroupName: '',
      IsActive: 0,
      Locations: []
    });
    setEditLocationGroupModal(false);
  }

  const handleCreateLocationGroupSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log(createLocationGroupFormData);
    const dataToSend = {
      LocationGroupName: createLocationGroupFormData.LocationGroupName,
      IsActive: createLocationGroupFormData.IsActive,
      Locations: createLocationGroupFormData.Locations?.map(location => location.LocationID)
    }
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/locationGroup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.status === 201) {
        toast.custom((t: any) => (
          <Toast type='success' content='Location group created successfully' t={t} />
        ))
        fetchLocationGroupData();
        setCreateLocationGroupFormData({
          LocationGroupName: '',
          IsActive: 0,
          Locations: []
        });
        handleCloseCreateLocationGroupModal();
      } else {
        throw new Error('Failed to create location group');
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast type='error' content='Failed to create location group' t={t} />
      ))
    }
    // setCreateLocationGroupFormData({
    //   LocationGroupName: '',
    //   IsActive: 0,
    //   Locations: []
    // });
    // handleCloseCreateLocationGroupModal();
  }

  const handleEditLocationGroupSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log(selectedLocationGroup);

    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/locationGroup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(selectedLocationGroup)
      });

      if (response.status === 200) {
        toast.custom((t: any) => (
          <Toast type='success' content='Location group updated successfully' t={t} />
        ))
        fetchLocationGroupData();
        setSelectedLocationGroup({
          LocationGroupName: '',
          IsActive: 0,
          Locations: []
        });
        handleCloseEditLocationGroupModal();
      } else {
        throw new Error('Failed to update location group');
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast type='error' content='Failed to update location group' t={t} />
      ))
    }

  }

  const handleSearchGroup = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    event.preventDefault();
    // const searchValue = event.target.value;
    // // Search by name of locationGroupId name
    // const filteredGroups = locationGroupMapping.filter(group => locationGroupData.find(locationGroup => locationGroup.LocationGroupId === group.LocationGroupId)?.LocationGroupName.toLowerCase().includes(searchValue.toLowerCase()));
    // setLocationGroupMappingData(filteredGroups);
  }

  useEffect(() => {
    console.log({ selectedLocationGroup });
  }, [selectedLocationGroup])

  return (
    <div className='w-1/2 h-full overflow-y-auto flex flex-col relative'>
      <div className='flex items-center justify-between sticky top-0 bg-background pb-2 pl-2 border-b border-b-border'>
        <div>
          <Input placeholder='Location Groups' onChange={handleSearchGroup} />
        </div>
        <div>
          <Button color='foreground' icon={<Plus />} text='Location Group' onClick={handleOpenCreateLocationGroupModal} />
        </div>
      </div>
      <div className='w-full h-full pt-2 pb-2 pl-2'>
        {/* Create a grid to display locationGroups in cards */}
        <div className="w-full h-fit grid grid-cols-3 gap-2">
          {
            locationGroupData?.map((group, index) => (
              <div key={index} className='w-full h-fit rounded-md bg-foreground border border-border hover:bg-highlight duration-300 p-2 cursor-pointer'
                onClick={handleOpenEditLocationGroupModal.bind(null, group)}>
                <div>
                  <div>
                    <h1 className='font-bold text-xl'>{
                      group.LocationGroupName
                    }</h1>
                  </div>
                  <div className='w-full flex justify-between'>
                    <div className='w-full flex justify-between items-center gap-2'>
                      <div className='w-full'>
                        <div className='w-full flex gap-1 items-center'>
                          <h1 className='font-bold text-sm text-textAlt'>Locations</h1>
                          <h1 className='font-bold text-sm text-text'>
                            {group?.Locations?.length}
                          </h1>
                        </div>
                      </div>
                      <div>
                        {
                          locationGroupData?.find(locationGroup => locationGroup?.LocationGroupId === group?.LocationGroupId)?.IsActive ? (
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
            <Modal title='New Location Group' onClose={handleCloseCreateLocationGroupModal}>
              <form className='w-full mt-2' onSubmit={handleCreateLocationGroupSubmit}>
                <div className='w-full flex flex-col gap-4'>
                  <div className='w-full'>
                    <h1 className='font-bold text-sm'>
                      Location Group Name
                    </h1>
                    <Input
                      placeholder='Location Group Name'
                      name='LocationGroupName'
                      value={createLocationGroupFormData.LocationGroupName}
                      onChange={handleCreateLocationGroupChange}
                      required
                    />
                  </div>
                  <div className='w-full flex flex-col gap-2'>
                    <div className='w-full'>
                      <h1 className='font-bold text-sm'>
                        Locations
                      </h1>
                      <div>
                        <Select
                          placeholder='Select Locations'
                          options={
                            locationData.filter(
                              (location: Location) => location.LocationID !== undefined && !createLocationGroupFormData.Locations!.map(location => location.LocationID).includes(location.LocationID)
                            ).map(location => location.LocationID !== undefined ? ({ value: location.LocationID.toString(), label: location.LocationName }) : null).filter(option => option !== null)
                          }
                          name='LocationID'
                          onChange={
                            (e) => {
                              setCreateLocationGroupFormData({
                                ...createLocationGroupFormData,
                                Locations: [
                                  ...createLocationGroupFormData.Locations!,
                                  locationData.find(location => location.LocationID === Number(e.target.value))!
                                ]
                              });
                            }
                          }
                        />
                      </div>
                    </div>
                    <div>
                      {
                        createLocationGroupFormData.Locations!.length > 0 && (
                          <div className='w-full flex flex-wrap gap-2'>
                            {
                              createLocationGroupFormData.Locations?.map((location, index) => (
                                <div key={index} className='w-fit flex items-center gap-2 bg-background px-2 rounded-md'>
                                  <h1 className='font-bold text-sm'>
                                    {
                                      location?.LocationName
                                    }
                                  </h1>
                                  <X className='w-4 cursor-pointer' onClick={() => {
                                    setCreateLocationGroupFormData({
                                      ...createLocationGroupFormData,
                                      Locations: createLocationGroupFormData.Locations!.filter(loc => loc.LocationID !== location.LocationID)
                                    });
                                  }} />
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
                      name='IsActive'
                      value={createLocationGroupFormData.IsActive === 1 ? "true" : "false"}
                      onChange={(e) => setCreateLocationGroupFormData({ ...createLocationGroupFormData, IsActive: (e.target as HTMLInputElement).checked ? 1 : 0 })}
                      required
                    />
                    <h1 className='font-bold text-sm'>
                      Is Active
                    </h1>
                  </div>
                  <div className='w-full flex justify-center gap-2'>
                    <Button text='Save' color='foreground' type='submit' />
                    <Button text='Cancel' color='foreground' type='button' onClick={handleCloseCreateLocationGroupModal} />
                  </div>
                </div>
              </form>
            </Modal>
          )
        }
        {/* Edit Location Group Modal */}
        {
          editLocationGroupModal && (
            <Modal className="max-w-2xl h-1/2" title='Edit Location Group' onClose={handleCloseEditLocationGroupModal}>
              <form className='w-full mt-2' onSubmit={handleEditLocationGroupSubmit}>
                <div className='w-full flex flex-col gap-4'>
                  <div className='w-full'>
                    <h1 className='font-bold text-sm'>
                      Location Group Details
                    </h1>
                    <Input
                      placeholder='Location Group Name'
                      name='LocationGroupName'
                      value={selectedLocationGroup?.LocationGroupName}
                      onChange={handleEditLocationGroupChange}
                      required
                    />
                  </div>
                  <div className='w-full flex flex-col gap-2'>
                    <div className="w-full">
                      <h1 className='font-bold text-sm'>
                        Locations
                      </h1>
                      <Select
                        placeholder='Select Locations'
                        options={
                          locationData.filter(
                            (location: Location) => location.LocationID !== undefined && !selectedLocationGroup.Locations!.map(location => location.LocationID).includes(location.LocationID)
                          ).map(location => location.LocationID !== undefined ? ({ value: location.LocationID.toString(), label: location.LocationName }) : null).filter(option => option !== null)
                        }
                        name='LocationID'
                        onChange={
                          (e) => {
                            setSelectedLocationGroup({
                              ...selectedLocationGroup,
                              Locations: [
                                ...selectedLocationGroup.Locations!,
                                locationData.find(location => location.LocationID === Number(e.target.value))!
                              ]
                            });
                          }
                        }
                      />
                    </div>
                    <div>
                      {
                        selectedLocationGroup.Locations!.length > 0 && (
                          <div className='w-full flex flex-wrap gap-2'>
                            {
                              selectedLocationGroup.Locations?.map((location, index) => (
                                <div key={index} className='w-fit flex items-center gap-2 bg-background px-2 rounded-md'>
                                  <h1 className='font-bold text-sm'>
                                    {location.LocationName}
                                  </h1>
                                  <X className='w-4 cursor-pointer' onClick={() => {
                                    setSelectedLocationGroup({
                                      ...selectedLocationGroup,
                                      Locations: selectedLocationGroup.Locations!.filter(loc => loc.LocationID !== location.LocationID)
                                    });
                                  }} />
                                </div>
                              ))
                            }
                          </div>
                        )
                      }
                    </div>
                  </div>
                  <div className='w-full flex items-center gap-2'>
                    <Input type='checkBox' name='IsActive'
                      value={selectedLocationGroup?.IsActive === 1 ? "true" : "false"}
                      onChange={(e) => setSelectedLocationGroup({ ...selectedLocationGroup!, IsActive: (e.target as HTMLInputElement).checked ? 1 : 0 })} required />
                    <h1 className='font-bold text-sm'>
                      Is Active
                    </h1>
                  </div>
                  <div className='w-full flex justify-center gap-2'>
                    <Button text='Save' color='foreground' type='submit' />
                    <Button text='Cancel' color='foreground' type='button' onClick={handleCloseEditLocationGroupModal} />
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