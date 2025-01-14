import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { Location } from "@/utils/types";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function Locations({ locationData, setLocationData, locationOptions }: {
  locationData: Location[];
  setLocationData: React.Dispatch<React.SetStateAction<Location[]>>;
  locationOptions: Location[];
}) {
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

  const handleSearchLocation = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const searchValue = event.target.value;
    const filteredLocations = locationOptions.filter(location => location.LocatonName.toLowerCase().includes(searchValue.toLowerCase()));
    setLocationData(filteredLocations);
  }

  return (
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
            locationData?.map((location, index) => (
              <div key={index} className='w-full h-fit rounded-md bg-foreground border border-border hover:bg-background duration-300 p-2 cursor-pointer' onClick={handleOpenEditLocationModal.bind(null, location)}>
                <div>
                  <div>
                    <h1 className='font-bold text-xl'>{location?.LocatonName}</h1>
                  </div>
                  <div className='w-full flex justify-between'>
                    <div className='flex justify-between items-center gap-2'>
                      <div className='w-full'>
                        <div className='w-full flex gap-1 items-center'>
                          <h1 className='font-bold text-sm text-textAlt'>Code</h1>
                          <h1 className='font-bold text-sm text-text'>
                            {location?.LocationCode}
                          </h1>
                        </div>
                        <div className='w-full flex gap-1 items-center'>
                          <h1 className='font-bold text-sm text-textAlt'>Type</h1>
                          <h1 className='font-bold text-sm text-text'>
                            {location?.LocationType}
                          </h1>
                        </div>
                      </div>
                    </div>
                    <div>
                      {
                        location?.IsActive ? (
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
                      Location Name
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
                      // value={createLocationFormData.LocationImage}
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
                      // value={createLocationFormData.LocationBanner}
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
                      placeholder='Receptionist Photo'
                      name='LocationReceptionistPhoto'
                      // value={createLocationFormData.LocationReceptionistPhoto}
                      onChange={handleCreateLocationChange}
                      type="file"
                      required
                    />
                  </div>
                </div>
                <div className='w-full flex items-center gap-2'>
                  <Input
                    type='checkBox'
                    name='IsActive'
                    value={createLocationFormData.IsActive.toString()}
                    onChange={(e) => setCreateLocationFormData({ ...createLocationFormData, IsActive: (e.target as HTMLInputElement).checked })}
                    required
                  />
                  <h1 className='font-bold text-sm'>
                    Is Active
                  </h1>
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
                      Location Name
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
                      // value={selectedLocation!.LocationImage}
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
                      // value={selectedLocation!.LocationBanner}
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
                      placeholder='Receptionist Photo'
                      name='LocationReceptionistPhoto'
                      // value={selectedLocation!.LocationReceptionistPhoto}
                      onChange={handleEditLocationChange}
                      type="file"
                      required
                    />
                  </div>
                </div>
                <div className='w-full flex gap-2 items-center'>
                  <Input
                    type='checkBox'
                    name='IsActive'
                    value={selectedLocation!.IsActive.toString()}
                    onChange={(e) => setSelectedLocation({ ...selectedLocation!, IsActive: (e.target as HTMLInputElement).checked })}
                    required
                  />
                  <h1 className='font-bold text-sm'>
                    Is Active
                  </h1>
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
  )
}