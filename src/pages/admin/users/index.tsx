/* eslint-disable @typescript-eslint/no-explicit-any */
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { Location, Role, User } from "@/utils/types";
import { Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import UserCard from "./_components/UserCard";
import { parseCookies } from "nookies";
import toast from "react-hot-toast";
import Toast from "@/components/ui/Toast";
import SearchInput from "@/components/ui/Search";

export default function Index() {
  const [userListData, setUserListData] = useState<User[]>([]);
  const [filteredUserListData, setFilteredUserListData] = useState<User[]>([]);
  const [rolesListData, setRolesListData] = useState<Role[]>([]);
  const [createUserModal, setCreateUserModal] = useState<boolean>(false);
  const [createUserFormData, setCreateUserFormData] = useState<User>({
    UserName: "",
    email: "",
    Password: "",
    DisplayName: "",
    UserPhoto: null,
    Role: "",
    IsActive: 0,
    Language: null,
    Region: null,
    TimeZone: null,
    "24HourFormat": 0,
    Calendar: null,
    DateFormat: null,
    LocationGroupID: null,
    LocationID: null,
  });
  const [selectedUser, setSelectedUser] = useState<User>({
    UserName: "",
    email: "",
    Password: "",
    DisplayName: "",
    UserPhoto: null,
    Role: "",
    IsActive: 0,
    Language: "",
    Region: "",
    TimeZone: "",
    "24HourFormat": 0,
    Calendar: "",
    DateFormat: "",
    LocationGroupID: null,
    LocationID: null,
  });
  const [editUserModal, setEditUserModal] = useState<boolean>(false);
  const [locationListData, setLocationListData] = useState<Location[]>([]);
  const [editPassword, setEditPassword] = useState<string>("");
  const [removeUserPhoto, setRemoveUserPhoto] = useState(false);

  const handleOpenEditUser = (user: User) => {
    setEditUserModal(true);
    const userData = {
      UserName: user.UserName || "",
      email: user.email || "",
      Password: user.Password || "",
      DisplayName: user.DisplayName || "",
      UserPhoto: user.UserPhoto,
      Role: user.Role || "",
      IsActive: user.IsActive || 0,
      Language: user.Language || "",
      Region: user.Region || "",
      TimeZone: user.TimeZone || "",
      "24HourFormat": user["24HourFormat"] || 0,
      Calendar: user.Calendar || "",
      DateFormat: user.DateFormat || "",
      LocationGroupID:
        user?.LocationGroupID?.split(",").map((locGrpID: any) =>
          Number(locGrpID)
        ) || null,
      LocationID: user.LocationID || null,
    };
    setSelectedUser(userData);
  };

  const filterUserList = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const searchValue = event.target.value;
    const filteredUserList = userListData.filter((user) =>
      user.DisplayName.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredUserListData(filteredUserList);
  };

  const handleCreateUserSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const { UserName, Password, DisplayName, Role, LocationID } =
      createUserFormData;

    if (!UserName || !Password || !DisplayName || !Role) {
      return toast.custom((t: any) => (
        <Toast
          t={t}
          content="Please fill all the required fields"
          type="warning"
        />
      ));
    }

    if (UserName.length > 50) {
      return toast.custom((t: any) => (
        <Toast t={t} content="Username Too Long" type="warning" />
      ));
    }

    if (DisplayName.length > 50) {
      return toast.custom((t: any) => (
        <Toast t={t} content="Display Name Too Long" type="warning" />
      ));
    }

    if (!LocationID) {
      return toast.custom((t: any) => (
        <Toast t={t} content="Please select a location" type="warning" />
      ));
    }

    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const formData = new FormData();
      // Append all the other form fields
      Object.keys(createUserFormData).forEach((key) => {
        if (key !== "UserPhoto") {
          formData.append(key, createUserFormData[key as keyof User] as any);
        }
      });
      // Append the UserPhoto as a file
      if (createUserFormData.UserPhoto) {
        formData.append("UserPhoto", createUserFormData.UserPhoto);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: formData,
        }
      );

      if (response.status === 201) {
        setCreateUserFormData({
          UserName: "",
          email: "",
          Password: "",
          DisplayName: "",
          UserPhoto: null,
          Role: "",
          IsActive: 0,
          Language: "ENGLISH",
          Region: null,
          TimeZone: null,
          "24HourFormat": 0,
          Calendar: null,
          DateFormat: null,
          LocationGroupID: null,
          LocationID: null,
        });
        setCreateUserModal(false);
        fetchUserListData();
        return toast.custom((t: any) => (
          <Toast t={t} content="User Created Successfully" type="success" />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} content="An error occurred" type="error" />
      ));
    }
  };

  const handleEditUser = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const { UserName, DisplayName, Role, LocationID } = selectedUser;

    if (!UserName || !DisplayName || !Role) {
      return toast.custom((t: any) => (
        <Toast
          t={t}
          content="Please fill all the required fields"
          type="warning"
        />
      ));
    }

    if (UserName.length > 50) {
      return toast.custom((t: any) => (
        <Toast t={t} content="Username Too Long" type="warning" />
      ));
    }

    if (DisplayName.length > 50) {
      return toast.custom((t: any) => (
        <Toast t={t} content="Display Name Too Long" type="warning" />
      ));
    }

    if (!LocationID) {
      return toast.custom((t: any) => (
        <Toast t={t} content="Please select a location" type="warning" />
      ));
    }

    if (selectedUser!.Role === "") {
      return toast.custom((t: any) => (
        <Toast t={t} content="Please select a role" type="warning" />
      ));
    }

    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const formData = new FormData();

      // Append all the fields (same as in handleCreateUserSubmit)
      Object.keys(selectedUser!).forEach((key) => {
        if (key !== "UserPhoto" && key !== "Password") {
          formData.append(key, selectedUser![key as keyof User] as any);
        }
      });

      if (editPassword.length !== 0) {
        formData.append("Password", editPassword);
      }

      // Append the UserPhoto as a file if available
      if (selectedUser!.UserPhoto && selectedUser!.UserPhoto instanceof File) {
        formData.append("UserPhoto", selectedUser!.UserPhoto);
      } else if (removeUserPhoto) {
        formData.append("RemoveUserPhoto", "true");
      }

      console.log({ formData });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: formData,
        }
      );

      if (response.status === 200) {
        setSelectedUser({
          UserName: "",
          email: "",
          Password: "",
          DisplayName: "",
          UserPhoto: null,
          Role: "",
          IsActive: 0,
          Language: "ENGLISH",
          Region: null,
          TimeZone: null,
          "24HourFormat": 0,
          Calendar: null,
          DateFormat: null,
          LocationGroupID: null,
          LocationID: null,
        });
        setEditUserModal(false);
        fetchUserListData();
        return toast.custom((t: any) => (
          <Toast t={t} content="User Updated Successfully" type="success" />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} content="An error occurred" type="error" />
      ));
    }
  };

  const fetchUserListData = async () => {
    const cookies = parseCookies();
    const { userToken } = cookies;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const data: User[] = await response.json();
      setUserListData(data);
      setFilteredUserListData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRoleListData = async () => {
    const cookies = parseCookies();
    const { userToken } = cookies;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/role`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const data: Role[] = await response.json();
      setRolesListData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLocationListData = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/location`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 200) {
        const data: Location[] = await response.json();
        setLocationListData(data.filter((location) => location.IsActive === 1));
      } else {
        throw new Error("Failed to fetch location data");
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast type="error" content="Failed to fetch location data" t={t} />
      ));
    }
  };

  useEffect(() => {
    fetchUserListData();
    fetchRoleListData();
    fetchLocationListData();
  }, []);

  return (
    <Layout
      headerTitle={
        <div className="flex items-center gap-2">
          <div>
            <h1 className="font-bold text-lg">USERS</h1>
          </div>
        </div>
      }
    >
      <div className="w-full h-full flex flex-col gap-2 bg-background px-2">
        <div className="w-full flex justify-between items-center gap-2 border-b border-b-border pb-2">
          <div className="w-64 flex gap-1">
            <SearchInput placeholder="Users" onChange={filterUserList} />
          </div>
          <div>
            <Button
              color="foreground"
              icon={<Plus className="w-5" />}
              text="User"
              onClick={setCreateUserModal.bind(null, true)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-4">
          {filteredUserListData?.map((user, index) => (
            <div
              key={index}
              className="w-full rounded-md cursor-pointer"
              onClick={handleOpenEditUser.bind(null, user)}
            >
              <UserCard user={user} />
            </div>
          ))}
        </div>
      </div>
      {createUserModal && (
        <Modal
          className="w-2/6"
          title="New User"
          onClose={setCreateUserModal.bind(null, false)}
        >
          <form className="mt-4" onSubmit={handleCreateUserSubmit}>
            <div className="w-full h-full flex flex-col gap-4 justify-center">
              <div className="w-full flex gap-2 justify-between">
                <div className="w-full">
                  <h1 className="font-bold text-sm">User Name</h1>
                  <Input
                    required
                    type="text"
                    value={createUserFormData.UserName}
                    onChange={(e) =>
                      setCreateUserFormData({
                        ...createUserFormData,
                        UserName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Email</h1>
                  <Input
                    type="email"
                    value={createUserFormData.email}
                    onChange={(e) =>
                      setCreateUserFormData({
                        ...createUserFormData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="w-full flex gap-2 justify-between">
                <div className="w-full">
                  <h1 className="font-bold text-sm">Password</h1>
                  <Input
                    required
                    type="password"
                    value={createUserFormData.Password}
                    onChange={(e) =>
                      setCreateUserFormData({
                        ...createUserFormData,
                        Password: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Display Name</h1>
                  <Input
                    required
                    type="text"
                    value={createUserFormData.DisplayName}
                    onChange={(e) =>
                      setCreateUserFormData({
                        ...createUserFormData,
                        DisplayName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="w-full flex items-center gap-2">
                <div className="w-1/2">
                  <h1 className="font-bold text-sm">Role</h1>
                  <Select
                    options={rolesListData.map((role) => ({
                      value: role.Name,
                      label: role.Name,
                    }))}
                    onChange={(e) =>
                      setCreateUserFormData({
                        ...createUserFormData,
                        Role: e.target.value,
                      })
                    }
                    placeholder="Select Role"
                  />
                </div>
                <div className="w-1/2">
                  <h1 className="font-bold text-sm">Location</h1>
                  <Select
                    options={
                      createUserFormData.Role === "Guest"
                        ? locationListData
                            .filter((loc) => loc.LocationType === "Property")
                            .map((location) => ({
                              value: location.LocationID!.toString(),
                              label: location.LocationName,
                            }))
                        : locationListData
                            .filter((loc) => loc.LocationType === "Control")
                            .map((locationGroup) => ({
                              value: locationGroup.LocationID!.toString(),
                              label: locationGroup.LocationName,
                            }))
                    }
                    onChange={(e) =>
                      setCreateUserFormData({
                        ...createUserFormData,
                        LocationID: Number(e.target.value),
                        LocationGroupID: null,
                      })
                    }
                    placeholder="No Location Selected"
                  />
                </div>
              </div>
              <div className="w-1/2">
                <h1 className="font-bold text-sm">User Photo</h1>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    onChange={(e) =>
                      setCreateUserFormData({
                        ...createUserFormData,
                        UserPhoto: e.target.value,
                      })
                    }
                  />
                  {createUserFormData.UserPhoto && (
                    <Trash
                      onClick={() =>
                        setCreateUserFormData({
                          ...createUserFormData,
                          UserPhoto: null,
                        })
                      }
                      className="text-red-500"
                    />
                  )}
                </div>
              </div>
              <div className="h-full flex items-center gap-2">
                <Input
                  required
                  placeholder="Is Active"
                  type="checkBox"
                  value={createUserFormData.IsActive === 1 ? "true" : "false"}
                  onChange={(e) =>
                    setCreateUserFormData({
                      ...createUserFormData,
                      IsActive: (e.target as HTMLInputElement).checked ? 1 : 0,
                    })
                  }
                />
                <h1 className="font-bold text-sm">
                  {createUserFormData.IsActive ? "Active" : "Inactive"}
                </h1>
              </div>
              <div className="w-full flex items-center justify-center gap-2 border-t-2 border-t-border pt-4">
                <Button color="foreground" text="Save" type="submit" />
                <Button
                  color="foreground"
                  text="Cancel"
                  type="button"
                  onClick={setCreateUserModal.bind(null, false)}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
      {editUserModal && (
        <Modal
          className="w-2/6"
          title="Edit User"
          onClose={setEditUserModal.bind(null, false)}
        >
          <form className="mt-2" onSubmit={handleEditUser}>
            <div className="w-full h-full flex flex-col gap-4 justify-center items-center">
              <div className="w-full flex gap-2 justify-between">
                <div className="w-full">
                  <h1 className="font-bold text-sm">User Name</h1>
                  <div className="w-full min-w-44 bg-background text-text placeholder:text-textAlt font-bold border-2 border-border rounded-md p-2 text-sm focus:outline-none cursor-not-allowed">
                    <h1 className="text-textAlt">{selectedUser?.UserName}</h1>
                  </div>
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Email</h1>
                  <Input
                    placeholder="Enter Email"
                    type="email"
                    value={selectedUser!.email}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser!,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="w-full flex gap-2 justify-between">
                <div className="w-full">
                  <h1 className="font-bold text-sm">Password</h1>
                  <Input
                    // required
                    placeholder="Enter New Password"
                    type="password"
                    // value={selectedUser!.Password}
                    onChange={(e) => setEditPassword(e.target.value)}
                  />
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Display Name</h1>
                  <Input
                    required
                    placeholder="Enter Display Name"
                    type="text"
                    value={selectedUser!.DisplayName}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser!,
                        DisplayName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="w-full flex items-center gap-2">
                <div className="w-1/2">
                  <h1 className="font-bold text-sm">Role</h1>
                  <Select
                    options={rolesListData.map((role) => ({
                      value: role.Name,
                      label: role.Name,
                    }))}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser!,
                        Role: e.target.value,
                      })
                    }
                    placeholder="Select Role"
                    defaultValue={selectedUser!.Role}
                  />
                </div>
                <div className="w-1/2">
                  <h1 className="font-bold text-sm">Location</h1>
                  <Select
                    options={
                      selectedUser.Role === "Guest"
                        ? locationListData
                            .filter((loc) => loc.LocationType === "Property")
                            .map((location) => ({
                              value: location.LocationID!.toString(),
                              label: location.LocationName,
                            }))
                        : locationListData
                            .filter((loc) => loc.LocationType === "Control")
                            .map((location) => ({
                              value: location.LocationID!.toString(),
                              label: location.LocationName,
                            }))
                    }
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        LocationID: Number(e.target.value),
                        LocationGroupID: null,
                      })
                    }
                    placeholder="No Location Selected"
                    defaultValue={selectedUser.LocationID?.toString()}
                  />
                </div>
              </div>
              <div className="w-full flex items-center gap-2">
                <div className="w-1/2">
                  <h1 className="font-bold text-sm">User Photo</h1>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser!,
                          UserPhoto: e.target.value,
                        })
                      }
                      value={`${selectedUser?.UserPhoto}`}
                    />
                    {(selectedUser.UserPhoto ||
                      (typeof selectedUser.UserPhoto === "string" &&
                        selectedUser.UserPhoto.length > 0)) && (
                      <Trash
                        className="text-red-500"
                        onClick={() => {
                          setSelectedUser({
                            ...selectedUser!,
                            UserPhoto: null,
                          });
                          setRemoveUserPhoto(true);
                        }}
                      />
                    )}
                  </div>
                </div>
                <Input
                  required
                  placeholder="Is Active"
                  type="checkBox"
                  value={selectedUser!.IsActive === 1 ? "true" : "false"}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser!,
                      IsActive: (e.target as HTMLInputElement).checked ? 1 : 0,
                    })
                  }
                />
                <h1 className="font-bold text-sm">
                  {selectedUser!.IsActive ? "Active" : "Inactive"}
                </h1>
              </div>
              <div className="w-full flex items-center justify-center gap-2 border-t-2 border-t-border pt-4">
                <Button color="foreground" text="Save" type="submit" />
                <Button
                  color="foreground"
                  text="Cancel"
                  type="button"
                  onClick={setEditUserModal.bind(null, false)}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
