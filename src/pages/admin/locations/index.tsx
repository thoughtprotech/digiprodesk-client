import Layout from '@/components/Layout'
import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { Location } from '@/utils/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function Index() {
  const [formData, setFormData] = useState<Location>({
    LocatonName: '',
    LocationCode: '',
    LocationType: '',
    LocationTheme: '',
    LocationImage: '',
    LocationBanner: '',
    LocationReceptionistPhoto: '',
    IsActive: true,
  })

  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    })
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log(formData)
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
      <div className='w-full h-full overflow-auto flex justify-center gap-2 bg-background p-2'>
        <div className='w-fit min-w-96 h-full flex flex-col gap-2 p-2 bg-foreground rounded-md'>
          <div>
            <div>
              <h1 className='font-bold text-xl'>Create Location</h1>
            </div>
          </div>
          <form className='w-full flex flex-col gap-2' onSubmit={handleFormSubmit}>
            <div>
              <h1 className='font-bold'>Location Name</h1>
              <Input required onChange={handleChangeInput} type='text' name="LocatonName" />
            </div>
            <div>
              <h1 className='font-bold'>Location Code</h1>
              <Input required onChange={handleChangeInput} type='text' name="LocatonCode" />
            </div>
            <div>
              <h1 className='font-bold'>Location Type</h1>
              <Input required onChange={handleChangeInput} type='text' name="LocationType" />
            </div>
            <div>
              <h1 className='font-bold'>Location Theme</h1>
              <Input required onChange={handleChangeInput} type='text' name="LocationTheme" />
            </div>
            <div>
              <h1 className='font-bold'>Location Image</h1>
              <Input required onChange={handleChangeInput} type='file' name="LocationImage" />
            </div>
            <div>
              <h1 className='font-bold'>Location Banner</h1>
              <Input required onChange={handleChangeInput} type='file' name="LocationBanner" />
            </div>
            <div>
              <h1 className='font-bold'>Location Receptionist Photo</h1>
              <Input required onChange={handleChangeInput} type='file' name="LocationReceptionistPhoto" />
            </div>
            <div>
              <h1 className='font-bold'>Is Active</h1>
              <Input required onChange={handleChangeInput} type='checkBox' placeholder='Is Active' name="IsActive" />
            </div>
            <div>
              <Button className='w-full hover:bg-background duration-300 rounded-md px-4 py-1 bg-zinc-500/30' type='submit' text='Create Location' />
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
