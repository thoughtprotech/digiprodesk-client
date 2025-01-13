import Layout from '@/components/Layout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import { Role, User } from '@/utils/types'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import UserCard from './_components/UserCard'

const userList: User[] = [
  {
    UserName: 'JohnDoe',
    Password: 'password',
    DisplayName: 'John Doe',
    RoleID: 2,
    IsActive: true,
    CreatedBy: 1,
    CreatedOn: new Date(),
    ModifiedBy: 1,
    ModifiedOn: new Date()
  },
  {
    UserName: 'DeepakVasudeva',
    Password: 'password',
    DisplayName: 'Deepak Vasudeva',
    RoleID: 1,
    IsActive: false,
    CreatedBy: 1,
    CreatedOn: new Date(),
    ModifiedBy: 1,
    ModifiedOn: new Date()
  },
  {
    UserName: 'OliveIndiranagar',
    Password: 'password',
    DisplayName: 'Olive Indiranagar',
    RoleID: 3,
    IsActive: false,
    CreatedBy: 1,
    CreatedOn: new Date(),
    ModifiedBy: 1,
    ModifiedOn: new Date()
  },
]

const roles: Role[] = [
  {
    ID: 1,
    Name: 'Admin',
    SuperAdmin: true,
    Language: 'en',
    IsActive: true,
    CreatedBy: 1,
    CreatedOn: new Date(),
    ModifiedBy: 1,
    ModifiedOn: new Date()
  },
  {
    ID: 2,
    Name: 'Host',
    SuperAdmin: false,
    Language: 'en',
    IsActive: true,
    CreatedBy: 1,
    CreatedOn: new Date(),
    ModifiedBy: 1,
    ModifiedOn: new Date()
  },
  {
    ID: 3,
    Name: 'Guest',
    SuperAdmin: false,
    Language: 'en',
    IsActive: true,
    CreatedBy: 1,
    CreatedOn: new Date(),
    ModifiedBy: 1,
    ModifiedOn: new Date()
  }
]

export default function Index() {
  const [userListData, setUserListData] = useState<User[]>([]);
  const [createUserModal, setCreateUserModal] = useState<boolean>(false);
  const [createUserFormData, setCreateUserFormData] = useState<User>({
    UserName: '',
    Password: '',
    DisplayName: '',
    RoleID: 0,
    IsActive: false,
    CreatedBy: 1,
    CreatedOn: new Date(),
    ModifiedBy: 1,
    ModifiedOn: new Date()
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserModal, setEditUserModal] = useState<boolean>(false);

  const handleOpenEditUser = (user: User) => {
    setEditUserModal(true);
    setSelectedUser(user);
  }

  const filterUserList = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const searchValue = event.target.value
    const filteredUserList = userList.filter(user => user.DisplayName.toLowerCase().includes(searchValue.toLowerCase()))
    setUserListData(filteredUserList)
  }

  const handleCreateUserSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log(createUserFormData)
    setCreateUserFormData({
      UserName: '',
      Password: '',
      DisplayName: '',
      RoleID: 0,
      IsActive: false,
      CreatedBy: 1,
      CreatedOn: new Date(),
      ModifiedBy: 1,
      ModifiedOn: new Date()
    });
  }

  const handleEditUser = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log(selectedUser)
    setEditUserModal(false);
  }

  useEffect(() => {
    setUserListData(userList);
  }, [])

  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div className="border-r border-r-border pr-2">
          <h1 className="font-bold text-xl">OLIVE HEAD OFFICE</h1>
        </div>
        <div>
          <h1 className='font-bold text-xl'>USERS</h1>
        </div>
      </div>
    }>
      <div className='w-full h-full flex flex-col gap-2 bg-background px-2'>
        {/* Create a grid to display user cards */}
        <div className='w-full flex justify-between items-center gap-2 border-b border-b-border pb-2'>
          <div className='w-64 flex'>
            <Input placeholder='Search users' onChange={filterUserList} />
          </div>
          <div>
            <Button color="foreground" icon={<Plus className='w-5' />} text='Create User' onClick={setCreateUserModal.bind(null, true)} />
          </div>
        </div>
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {userListData.map((user, index) => (
            <div key={index} className='w-full rounded-md cursor-pointer' onClick={handleOpenEditUser.bind(null, user)}>
              <UserCard user={user} />
            </div>
          ))}
        </div>
      </div>
      {createUserModal && (
        <Modal title="Create User" onClose={setCreateUserModal.bind(null, false)}>
          <form onSubmit={handleCreateUserSubmit}>
            <div className="w-full h-full flex flex-col gap-4 justify-center">
              <div className='w-full flex gap-2 justify-between'>
                <div className='w-full'>
                  <h1 className='font-bold text-sm'>User Name</h1>
                  <Input required placeholder='Enter Username' type='text' value={createUserFormData.UserName} onChange={(e) => setCreateUserFormData({ ...createUserFormData, UserName: e.target.value })} />
                </div>
                <div className='w-full'>
                  <h1 className='font-bold text-sm'>Password</h1>
                  <Input required placeholder='Enter Password' type='password' value={createUserFormData.Password} onChange={(e) => setCreateUserFormData({ ...createUserFormData, Password: e.target.value })} />
                </div>
              </div>
              <div className='w-full flex gap-2 justify-between'>
                <div className='w-full'>
                  <h1 className='font-bold text-sm'>Display Name</h1>
                  <Input required placeholder='Enter Display Name' type='text' value={createUserFormData.DisplayName} onChange={(e) => setCreateUserFormData({ ...createUserFormData, DisplayName: e.target.value })} />
                </div>
                <div className='w-full'>
                  <h1 className='font-bold text-sm'>Role</h1>
                  <Select
                    options={roles.map(role => ({ value: role.ID.toString(), label: role.Name }))}
                    onChange={(e) => setCreateUserFormData({ ...createUserFormData, RoleID: Number(e.target.value) })}
                    placeholder='Select Role'
                  />
                </div>
              </div>
              <div className='w-full flex items-center gap-2'>
                <div className='flex items-center gap-2'>
                  <Input required placeholder='Is Active' type='checkBox' value={createUserFormData.IsActive.toString()} onChange={(e) => setCreateUserFormData({ ...createUserFormData, IsActive: (e.target as HTMLInputElement).checked })} />
                  <h1 className='font-bold text-sm'>Active</h1>
                </div>
              </div>
              <Button color="foreground" text='Save' type='submit' />
            </div>
          </form>
        </Modal>
      )}
      {editUserModal && (
        <Modal title="Edit User" onClose={setEditUserModal.bind(null, false)}>
          <form onSubmit={handleEditUser}>
            <div className="w-full h-full flex flex-col gap-4 justify-center">
              <div className='w-full flex gap-2 justify-between'>
                <div className='w-full'>
                  <h1 className='font-bold text-sm'>User Name</h1>
                  <Input required placeholder='Enter Username' type='text' value={selectedUser!.UserName} onChange={(e) => setSelectedUser({ ...selectedUser!, UserName: e.target.value })} />
                </div>
                <div className='w-full'>
                  <h1 className='font-bold text-sm'>Password</h1>
                  <Input required placeholder='Enter Password' type='password' value={selectedUser!.Password} onChange={(e) => setSelectedUser({ ...selectedUser!, Password: e.target.value })} />
                </div>
              </div>
              <div className='w-full flex gap-2 justify-between'>
                <div className='w-full'>
                  <h1 className='font-bold text-sm'>Display Name</h1>
                  <Input required placeholder='Enter Display Name' type='text' value={selectedUser!.DisplayName} onChange={(e) => setSelectedUser({ ...selectedUser!, DisplayName: e.target.value })} />
                </div>
                <div className='w-full'>
                  <h1 className='font-bold text-sm'>Role</h1>
                  <Select
                    options={roles.map(role => ({ value: role.ID.toString(), label: role.Name }))}
                    onChange={(e) => setSelectedUser({ ...selectedUser!, RoleID: Number(e.target.value) })}
                    placeholder='Select Role'
                  />
                </div>
              </div>
              <div className='w-full flex items-center gap-2'>
                <div className='flex items-center gap-2'>
                  <Input required placeholder='Is Active' type='checkBox' value={selectedUser!.IsActive.toString()} onChange={(e) => setSelectedUser({ ...selectedUser!, IsActive: (e.target as HTMLInputElement).checked })} />
                  <h1 className='font-bold text-sm'>Active</h1>
                </div>
              </div>
              <Button color="foreground" text='Save' type='submit' />
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  )
}