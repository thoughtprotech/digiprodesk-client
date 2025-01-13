import Layout from '@/components/Layout'
import { MapPin, Pencil, X } from 'lucide-react'
import { useState } from 'react'
import { Location, LocationGroup } from '@/utils/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Tooltip from '@/components/ui/ToolTip'

const locationOptions = [
  { label: "Olive Indiranagar", value: "l1", locationType: "Property" },
  { label: "Olive HSR", value: "l2", locationType: "Property" },
  { label: "Olive Koramangala", value: "l3", locationType: "Property" },
  { label: "Olive Whitefield", value: "l4", locationType: "Property" },
  { label: "Olive Marathahalli", value: "l5", locationType: "Property" },
]

const locationGroups = [
  { name: "Olive Properties", locations: ["l1", "l2", "l3", "l4", "l5"] },
  { name: "Olive Offices", locations: ["l1", "l2", "l3"] },
  { name: "Olive Residential", locations: ["l4", "l5"] },
]

export default function Index() {
  const [formData, setFormData] = useState<Location>({
    LocatonName: '',
    LocationCode: '',
    LocationType: '',
    // LocationTheme: '',
    LocationParentID: 0,
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: false,
  })

  const [locationGroupFormData, setLocationGroupFormData] = useState<LocationGroup>({
    LocationGroupID: 0,
    LocatonGroupName: '',
    LocationID: [],
  })

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value, checked } = event.target as HTMLInputElement;

    console.log({ name, value });

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleLocationGroupChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target as HTMLInputElement;

    console.log({ name, value });

    setLocationGroupFormData({
      ...locationGroupFormData,
      [name]: name === "LocationID" ?
        // push locationId into array
        [...locationGroupFormData.LocationID, value]
        : value,
    });

    console.log({ locationGroupFormData });
  }

  const handleLocationGroupFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(locationGroupFormData);

    setLocationGroupFormData({
      LocationGroupID: 0,
      LocatonGroupName: '',
      LocationID: [],
    })

  }


  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(formData);

    setFormData({
      LocatonName: '',
      LocationCode: '',
      LocationType: '',
      // LocationTheme: '',
      LocationParentID: 0,
      LocationImage: '',
      LocationBanner: '',
      LocationReceptionistPhoto: '',
      IsActive: false,
    })
  }

  const handleRemoveLocation = (locationId: string) => {
    setLocationGroupFormData({
      ...locationGroupFormData,
      LocationID: locationGroupFormData.LocationID.filter((id) => id !== locationId)
    })
  }

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
      <div className='w-full h-screen pb-20 overflow-auto flex items-center gap-2 bg-background p-2'>
        <div className='w-1/2 min-w-96 h-full flex flex-col gap-2 p-2 bg-foreground rounded-md'>
          <div className='border-b border-b-border pb-2 flex flex-col gap-1'>
            <div>
              <h1 className='font-bold text-2xl'>Create Location</h1>
            </div>
            <form className='w-full flex flex-col gap-2' onSubmit={handleFormSubmit}>
              <div className='w-full flex gap-2 items-start'>
                <div>
                  <h1 className='font-bold'>Location Name</h1>
                  <Input required onChange={handleChangeInput} type='text' name="LocatonName" />
                </div>
                <div>
                  <h1 className='font-bold'>Location Code</h1>
                  <Input required onChange={handleChangeInput} type='text' name="LocationCode" />
                </div>
                <div>
                  <h1 className='font-bold'>Location Type</h1>
                  <Select
                    name="LocationType"
                    options={[
                      { label: "Control", value: "control" },
                      { label: "Property", value: "property" },
                    ]}
                    placeholder="Select an Option"
                    onChange={handleChangeInput}
                  />
                </div>
                {
                  formData.LocationType === 'property' && (
                    <div>
                      <h1 className='font-bold'>Assign To Control</h1>
                      <Select
                        name="LocationParentID"
                        options={[
                          { label: "Head Office", value: "headOffice" },
                          { label: "Regional Office", value: "regionalOffice" },
                        ]}
                        placeholder="Choose a Control"
                        onChange={handleChangeInput}
                      />
                    </div>
                  )
                }
                {/* <div>
                <h1 className='font-bold'>Location Theme</h1>
                <Input required onChange={handleChangeInput} type='text' name="LocationTheme" />
              </div> */}
                <div className='flex flex-col items-start justify-start'>
                  <h1 className='font-bold'>Is Active</h1>
                  <Input required onChange={handleChangeInput} type='checkBox' placeholder='Is Active' name="IsActive" value={formData.IsActive.toString()} />
                </div>
              </div>
              <div className='w-full flex gap-2 items-start'>
                <div className='w-full'>
                  <h1 className='font-bold'>Location Image</h1>
                  <Input required onChange={handleChangeInput} type='file' name="LocationImage" />
                </div>
                <div className='w-full'>
                  <h1 className='font-bold'>Location Banner</h1>
                  <Input required onChange={handleChangeInput} type='file' name="LocationBanner" />
                </div>
                <div className='w-full'>
                  <h1 className='font-bold'>Location Receptionist Photo</h1>
                  <Input required onChange={handleChangeInput} type='file' name="LocationReceptionistPhoto" />
                </div>
              </div>
              <div>
                <Button className='w-full bg-background duration-300 rounded-md px-4 py-1 hover:bg-zinc-500/30' type='submit' text='Create Location' />
              </div>
            </form>
          </div>
          <div className='flex flex-col gap-1'>
            <div>
              <h1 className='font-bold text-2xl'>Locations</h1>
            </div>
            {/* grid of location cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
              {locationOptions.map((location, index) => (
                <div key={index} className='bg-background p-2 rounded-md flex justify-between gap-2'>
                  <div className='flex flex-col items-start justify-between'>
                    <h1 className='font-bold'>{location.label}</h1>
                    <h1 className='font-bold text-textAlt text-sm'>{location.locationType}</h1>
                  </div>
                  <div className='flex flex-col items-start justify-between'>
                    <Tooltip tooltip='Edit Location'>
                      <Pencil className='w-4 text-textAlt cursor-pointer' />
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='w-1/2 min-w-96 h-full flex flex-col gap-2 p-2 bg-foreground rounded-md'>
          <div className='border-b border-b-border pb-2 flex flex-col gap-1'>
            <div>
              <h1 className='font-bold text-2xl'>Create Location Group</h1>
            </div>
            <form className='w-full flex flex-col justify-between gap-2' onSubmit={handleLocationGroupFormSubmit}>
              <div className='w-full flex gap-2 items-end'>
                <div className='w-full flex gap-2 items-end'>
                  <div>
                    <h1 className='font-bold'>Location Group Name</h1>
                    <Input required onChange={handleLocationGroupChangeInput} type='text' name="LocatonGroupName" />
                  </div>
                  <div>
                    <h1 className='font-bold'>Locations</h1>
                    <Select
                      name="LocationID"
                      options={locationOptions.filter((option) => !locationGroupFormData.LocationID.includes(option.value))}
                      placeholder="Select an Option"
                      onChange={handleLocationGroupChangeInput}
                    />
                  </div>
                  <div>
                    <Button className='w-full bg-background duration-300 rounded-md px-4 py-2 hover:bg-zinc-500/30' type='submit' text='Create Location' />
                  </div>
                </div>
                <div className='flex gap-2 items-center flex-wrap'>
                  {locationGroupFormData.LocationID.map((locationId, index) => (
                    <div key={index} className='flex bg-background border-2 border-border w-fit rounded-md px-4 gap-2 items-center justify-between'>
                      <h1 className='font-bold text-xs'>{
                        locationOptions.find((option) => option.value === locationId)?.label
                      }</h1>
                      <Tooltip tooltip='Remove Location'>
                        <X className='w-4 cursor-pointer' onClick={handleRemoveLocation.bind(null, locationId)} />
                      </Tooltip>
                    </div>
                  ))
                  }
                </div>
              </div>
            </form>
          </div>
          <div>
            <div>
              <h1 className='font-bold text-2xl'>Location Groups</h1>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
              {locationGroups.map((locationGroup, index) => (
                <div key={index} className='bg-background p-2 rounded-md flex flex-col gap-2'>
                  <div className='flex items-center justify-between'>
                    <h1 className='font-bold'>{locationGroup.name}</h1>
                    <Tooltip tooltip='Edit Location Group'>
                      <Pencil className='w-4 text-textAlt cursor-pointer' />
                    </Tooltip>
                  </div>
                  <div className='flex flex-col gap-2'>
                    {locationGroup.locations.map((locationId, index) => (
                      <div key={index} className='w-full flex bg-background border-2 border-border rounded-md pl-2 pr-1 gap-2 items-center justify-between'>
                        <h1 className='font-bold text-xs'>{
                          locationOptions.find((option) => option.value === locationId)?.label
                        }</h1>
                        <Tooltip tooltip='Remove Location' position='bottom'>
                          <X className='w-4 cursor-pointer' onClick={handleRemoveLocation.bind(null, locationId)} />
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
