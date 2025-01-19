/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import SearchInput from "@/components/ui/Search";
import Select from "@/components/ui/Select";
import Toast from "@/components/ui/Toast";
import { Location } from "@/utils/types";
import { Plus } from "lucide-react";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Locations({ locationData, fetchLocationData, fetchLocationGroupData }: {
  locationData: Location[];
  fetchLocationData: () => void;
  fetchLocationGroupData: () => void;
}) {
  const [filteredLocationData, setFilteredLocationData] = useState<Location[]>([]);
  const [createLocationModal, setCreateLocationModal] = useState<boolean>(false);
  const [editLocationModal, setEditLocationModal] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<Location>({
    LocationName: '',
    LocationCode: '',
    LocationType: '',
    LocationParentID: 0,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: 0,
  });
  const [createLocationFormData, setCreateLocationFormData] = useState<Location>({
    LocationName: '',
    LocationCode: '',
    LocationType: '',
    LocationParentID: 0,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: 0,
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
    setSelectedLocation({
      LocationName: '',
      LocationCode: '',
      LocationType: '',
      LocationParentID: 0,
      LocationImage: null,
      LocationBanner: null,
      LocationReceptionistPhoto: null,
      IsActive: 0,
    });
    setEditLocationModal(false);
  }

  const handleCreateLocationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const formData = new FormData();
      // Append all the other form fields
      Object.keys(createLocationFormData!).forEach((key) => {
        const value = createLocationFormData![key as keyof Location];
        if (
          key !== "LocationImage" &&
          key !== "LocationBanner" &&
          key !== "LocationReceptionistPhoto"
        ) {
          formData.append(key, value);
        }
      });

      // Append the UserPhoto as a file
      if (createLocationFormData.LocationBanner) {
        formData.append('LocationBanner', createLocationFormData.LocationBanner);
      }

      if (createLocationFormData.LocationImage) {
        formData.append('LocationImage', createLocationFormData.LocationImage);
      }

      if (createLocationFormData.LocationReceptionistPhoto) {
        formData.append('LocationReceptionistPhoto', createLocationFormData.LocationReceptionistPhoto);
      }

      console.log({ createLocationFormData });

      console.log("FormData content:", Array.from(formData.entries()));

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/location`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
        body: formData
      });

      if (response.status === 201) {
        toast.custom((t: any) => (
          <Toast type='success' content='Location Created successfully' t={t} />
        ))
        setCreateLocationModal(false);
        fetchLocationData();
        fetchLocationGroupData();
        setCreateLocationFormData({
          LocationName: '',
          LocationCode: '',
          LocationType: '',
          LocationParentID: 0,
          LocationImage: null,
          LocationBanner: null,
          LocationReceptionistPhoto: null,
          IsActive: 0,
        });
      } else {
        throw new Error('Failed to create location');
      }

    } catch {
      return toast.custom((t: any) => (
        <Toast type='error' content='Failed to create location' t={t} />
      ))
    }
  }

  const handleEditLocationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Ensure LocationParentID is set to 0 for 'Control' type
    if (selectedLocation?.LocationType === "Control") {
      selectedLocation.LocationParentID = 0;
    }

    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const formData = new FormData();

      // Append non-file fields to FormData
      Object.keys(selectedLocation!).forEach((key) => {
        const value = selectedLocation![key as keyof Location];
        if (
          key !== "LocationImage" &&
          key !== "LocationBanner" &&
          key !== "LocationReceptionistPhoto"
        ) {
          formData.append(key, value);
        }
      });

      // Append file fields to FormData
      if (selectedLocation!.LocationImage) {
        formData.append("LocationImage", selectedLocation!.LocationImage);
      }

      if (selectedLocation!.LocationBanner) {
        formData.append("LocationBanner", selectedLocation!.LocationBanner);
      }

      if (selectedLocation!.LocationReceptionistPhoto) {
        formData.append(
          "LocationReceptionistPhoto",
          selectedLocation!.LocationReceptionistPhoto
        );
      }

      console.log({ selectedLocation });

      console.log("FormData content:", Array.from(formData.entries()));

      // Send API request
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/location`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userToken}`, // No 'Content-Type', as FormData sets it
          },
          body: formData,
        }
      );

      if (response.status === 200) {
        toast.custom((t: any) => (
          <Toast type="success" content="Location updated successfully" t={t} />
        ));
        setEditLocationModal(false);
        fetchLocationData();
        fetchLocationGroupData();
        setSelectedLocation({
          LocationName: "",
          LocationCode: "",
          LocationType: "",
          LocationParentID: 0,
          LocationImage: null,
          LocationBanner: null,
          LocationReceptionistPhoto: null,
          IsActive: 0,
        });
      } else {
        throw new Error("Failed to update location");
      }
    } catch (error) {
      console.error("Error updating location:", error);
      toast.custom((t: any) => (
        <Toast type="error" content="Failed to update location" t={t} />
      ));
    }
  };


  const handleSearchLocation = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const searchValue = event.target.value;
    const filteredLocations = locationData.filter(location => location.LocationName.toLowerCase().includes(searchValue.toLowerCase()));
    setFilteredLocationData(filteredLocations);
  }

  useEffect(() => {
    setFilteredLocationData(locationData);
  }, [locationData])

  return (
    <div className='w-1/2 h-full overflow-y-auto border-r border-r-border flex flex-col relative'>
      <div className='flex items-center justify-between sticky top-0 bg-background pb-2 pr-2 border-b border-b-border'>
        <div className="flex items-center gap-1">
          <SearchInput placeholder='Locations' onChange={handleSearchLocation} />
        </div>
        <div>
          <Button color='foreground' icon={<Plus />} text='Location' onClick={handleOpenCreateLocationModal} />
        </div>
      </div>
      <div className='w-full h-full pt-2 pb-2 pr-2'>
        {/* Create a grid to display locationOptions in cards */}
        <div className="w-full h-fit grid grid-cols-3 gap-2">
          {
            filteredLocationData?.map((location, index) => (
              <div key={index} className='w-full h-fit rounded-md bg-foreground border border-border hover:bg-highlight duration-300 p-2 cursor-pointer' onClick={handleOpenEditLocationModal.bind(null, location)}>
                <div>
                  <div>
                    <h1 className='font-bold text-xl'>{location?.LocationName}</h1>
                  </div>
                  <div className='w-full flex justify-between items-end'>
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
          <Modal className="w-1/2" title='New Location' onClose={handleCloseCreateLocationModal}>
            <form className="mt-2 w-full h-full" onSubmit={handleCreateLocationSubmit}>
              <div className='w-full h-full flex flex-col gap-4 justify-between'>
                <div className='w-full flex justify-between gap-2'>
                  <div className='w-full'>
                    <h1 className='font-bold text-sm'>
                      Location Name
                    </h1>
                    <Input
                      name='LocationName'
                      value={createLocationFormData.LocationName}
                      onChange={handleCreateLocationChange}
                      required
                    />
                  </div>
                  <div className='w-full'>
                    <h1 className='font-bold text-sm'>
                      Location Code
                    </h1>
                    <Input
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
                  {createLocationFormData.LocationType === "Property" &&
                    (<div className='w-full'>
                      <h1 className='font-bold text-sm'>
                        Choose Control
                      </h1>
                      <Select
                        options={
                          locationData.filter(location => location.LocationType === "Control").map(location => ({ value: location.LocationID!.toString(), label: location.LocationName }))
                        }
                        placeholder='Assign Control'
                        onChange={(e) => setCreateLocationFormData({ ...createLocationFormData, LocationParentID: Number(e.target.value) })}
                      />
                    </div>)}
                  <div className='w-full'>
                    <h1 className='font-bold text-sm'>
                      Location Image
                    </h1>
                    <Input
                      name='LocationImage'
                      // value={createLocationFormData.LocationImage}
                      onChange={handleCreateLocationChange}
                      type="file"
                    // required
                    />
                  </div>
                </div>
                <div className='w-full flex justify-between gap-2'>
                  <div className='w-full'>
                    <h1 className='font-bold text-sm'>
                      Location Banner
                    </h1>
                    <Input
                      name='LocationBanner'
                      // value={createLocationFormData.LocationBanner}
                      onChange={handleCreateLocationChange}
                      type="file"
                    // required
                    />
                  </div>
                  <div className='w-full'>
                    <h1 className='font-bold text-sm'>
                      Receptionist Photo
                    </h1>
                    <Input
                      name='LocationReceptionistPhoto'
                      // value={createLocationFormData.LocationReceptionistPhoto}
                      onChange={handleCreateLocationChange}
                      type="file"
                    // required
                    />
                  </div>
                </div>
                <div className="w-full flex justify-between">
                  <div className='w-full flex items-center gap-2'>
                    <Input
                      type='checkBox'
                      name='IsActive'
                      value={createLocationFormData!.IsActive === 1 ? 'true' : 'false'}
                      onChange={(e) => setCreateLocationFormData({ ...createLocationFormData, IsActive: (e.target as HTMLInputElement).checked ? 1 : 0 })}
                    />
                    <h1 className='font-bold text-sm'>
                      {
                        createLocationFormData!.IsActive ? 'Active' : 'Inactive'
                      }
                    </h1>
                  </div>
                  <div>
                    <Button text='Preview' color='foreground' onClick={handleCloseCreateLocationModal} />
                  </div>
                </div>
                <div className='flex justify-center gap-2 border-t-2 border-t-border pt-4'>
                  <Button text='Save' color='foreground' type='submit' />
                  <Button text='Cancel' color='foreground' onClick={handleCloseCreateLocationModal} />
                </div>
              </div>
            </form>
          </Modal>
        )
      }

      {/* Edit Location Modal */}
      {
        editLocationModal && (
          <Modal className="w-1/2" title='Edit Location' onClose={handleCloseEditLocationModal}>
            <form className="mt-2" onSubmit={handleEditLocationSubmit}>
              <div className='flex flex-col gap-2'>
                <div className='w-full flex justify-between gap-2'>
                  <div className='w-full'>
                    <h1 className='font-bold text-sm'>
                      Location Name
                    </h1>
                    <Input
                      name='LocationName'
                      value={selectedLocation!.LocationName}
                      onChange={handleEditLocationChange}
                      required
                    />
                  </div>
                  <div className='w-full'>
                    <h1 className='font-bold text-sm'>
                      Location Code
                    </h1>
                    <Input
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
                  {selectedLocation!.LocationType === "Property" &&
                    (<div className='w-full'>
                      <h1 className='font-bold text-sm'>
                        Choose Control
                      </h1>
                      <Select
                        options={
                          locationData.filter(location => location.LocationType === "Control").map(location => ({ value: location.LocationID!.toString(), label: location.LocationName }))
                        }
                        placeholder='Assign Control'
                        onChange={(e) => setSelectedLocation({ ...selectedLocation!, LocationParentID: Number(e.target.value) })}
                        defaultValue={selectedLocation?.LocationParentID!.toString()}
                      />
                    </div>)}
                  <div className='w-full'>
                    <h1 className='font-bold text-sm'>
                      Location Image
                    </h1>
                    <Input
                      name='LocationImage'
                      value={selectedLocation!.LocationImage}
                      onChange={handleEditLocationChange}
                      type="file"
                    // required
                    />
                  </div>
                </div>
                <div className='w-full flex justify-between gap-2'>
                  <div className='w-full'>
                    <h1 className='font-bold text-sm'>
                      Location Banner
                    </h1>
                    <Input
                      name='LocationBanner'
                      value={selectedLocation!.LocationBanner}
                      onChange={handleEditLocationChange}
                      type="file"
                    // required
                    />
                  </div>
                  <div className='w-full'>
                    <h1 className='font-bold text-sm'>
                      Receptionist Photo
                    </h1>
                    <Input
                      name='LocationReceptionistPhoto'
                      value={selectedLocation!.LocationReceptionistPhoto}
                      onChange={handleEditLocationChange}
                      type="file"
                    // required
                    />
                  </div>
                </div>
                <div className="w-full flex justify-between pb-2">
                  <div className='w-full flex gap-2 items-center'>
                    <Input
                      type='checkBox'
                      name='IsActive'
                      value={selectedLocation!.IsActive === 1 ? 'true' : 'false'}
                      onChange={(e) => setSelectedLocation({ ...selectedLocation!, IsActive: (e.target as HTMLInputElement).checked ? 1 : 0 })}
                      required
                    />
                    <h1 className='font-bold text-sm'>
                      {
                        selectedLocation!.IsActive ? 'Active' : 'Inactive'
                      }
                    </h1>
                  </div>
                  <div>
                    <Button text='Preview' color='foreground' onClick={handleCloseCreateLocationModal} />
                  </div>
                </div>
                <div className="w-full flex justify-between gap-2">
                  {
                    selectedLocation!.LocationImage && (
                      <div className="w-1/3 flex justify-center">
                        <div className="w-full flex flex-col gap-2">
                          <div>
                            <h1 className="font-bold text-sm">
                              Location Image
                            </h1>
                          </div>
                          <div className="w-full flex justify-center">
                            <img
                              src={
                                selectedLocation!.LocationImage instanceof File ?
                                  URL.createObjectURL(selectedLocation!.LocationImage) :
                                  `${process.env.NEXT_PUBLIC_BACKEND_URL}${selectedLocation!.LocationImage}`
                              }
                              alt="Location Image"
                              className="w-20 h-20 object-contain rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }
                  {
                    selectedLocation!.LocationBanner && (
                      <div className="w-1/3 flex justify-center">
                        <div className="w-full flex flex-col gap-2">
                          <div>
                            <h1 className="font-bold text-sm">
                              Location Banner
                            </h1>
                          </div>
                          <div className="w-full flex justify-center">
                            <img
                              src={
                                selectedLocation!.LocationBanner instanceof File ?
                                  URL.createObjectURL(selectedLocation!.LocationBanner) :
                                  `${process.env.NEXT_PUBLIC_BACKEND_URL}${selectedLocation!.LocationBanner}`}
                              alt="Location Banner"
                              className="w-20 h-20 object-contain rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }
                  {
                    selectedLocation!.LocationReceptionistPhoto && (
                      <div className="w-1/3 flex justify-center">
                        <div className="w-full flex flex-col gap-2">
                          <div>
                            <h1 className="font-bold text-sm">
                              Receptionist Photo
                            </h1>
                          </div>
                          <div className="w-full flex justify-center">
                            <img
                              src={
                                selectedLocation!.LocationReceptionistPhoto instanceof File ?
                                  URL.createObjectURL(selectedLocation!.LocationReceptionistPhoto) :
                                  `${process.env.NEXT_PUBLIC_BACKEND_URL}${selectedLocation!.LocationReceptionistPhoto}`}
                              alt="Receptionist Photo"
                              className="w-20 h-20 object-contain rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }
                </div>
                <div className='flex justify-center gap-2 border-t-2 border-t-border pt-4'>
                  <Button text='Save' color='foreground' type='submit' />
                  <Button text='Cancel' color='foreground' onClick={handleCloseEditLocationModal} />
                </div>
              </div>
            </form>
          </Modal>
        )
      }
    </div>
  )
}