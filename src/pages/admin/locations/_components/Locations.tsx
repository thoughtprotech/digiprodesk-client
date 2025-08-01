/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import SearchInput from "@/components/ui/Search";
import Select from "@/components/ui/Select";
import Toast from "@/components/ui/Toast";
import { Location, User } from "@/utils/types";
import { Plus, Trash, X } from "lucide-react";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Locations({
  locationData,
  fetchLocationData,
}: {
  locationData: Location[];
  fetchLocationData: () => void;
}) {
  const [filteredLocationData, setFilteredLocationData] = useState<Location[]>(
    []
  );
  const [createLocationModal, setCreateLocationModal] =
    useState<boolean>(false);
  const [editLocationModal, setEditLocationModal] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<Location>({
    LocationName: "",
    LocationCode: "",
    LocationType: "",
    LocationManager: null,
    LocationBanner: "",
    LocationParentID: "",
    LocationImage: "",
    LocationLogo: "",
    LocationReceptionistPhoto: "",
    LocationAdvertisementVideo: "",
    IsActive: 0,
  });
  const [createLocationFormData, setCreateLocationFormData] =
    useState<Location>({
      LocationName: "",
      LocationCode: "",
      LocationType: "",
      LocationManager: null,
      LocationBanner: "",
      LocationParentID: "",
      LocationImage: "",
      LocationLogo: "",
      LocationReceptionistPhoto: "",
      LocationAdvertisementVideo: "",
      IsActive: 0,
    });
  const [userListData, setUserListData] = useState<User[]>([]);
  const [removeLocationFiles, setRemoveLocationFiles] = useState<{
    [key: string]: boolean;
  }>({
    LocationLogo: false,
    LocationImage: false,
    LocationReceptionistPhoto: false,
    LocationBanner: false,
    LocationAdvertisementVideo: false,
  });

  const handleCreateLocationChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCreateLocationFormData({
      ...createLocationFormData,
      [event.target.name]: event.target.value,
    });
  };

  const handleEditLocationChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (selectedLocation) {
      setSelectedLocation({
        ...selectedLocation,
        [event.target.name]: event.target.value || null,
      });
    }
  };

  const handleOpenCreateLocationModal = () => {
    setCreateLocationModal(true);
  };

  const handleCloseCreateLocationModal = () => {
    setCreateLocationModal(false);
  };

  const handleOpenEditLocationModal = (location: Location) => {
    setSelectedLocation(location);
    setEditLocationModal(true);
  };

  const handleCloseEditLocationModal = () => {
    setSelectedLocation({
      LocationName: "",
      LocationCode: "",
      LocationType: "",
      LocationManager: null,
      LocationBanner: "",
      LocationParentID: "",
      LocationImage: "",
      LocationLogo: "",
      LocationReceptionistPhoto: "",
      LocationAdvertisementVideo: "",
      IsActive: 0,
    });
    setRemoveLocationFiles({
      LocationLogo: false,
      LocationImage: false,
      LocationReceptionistPhoto: false,
      LocationBanner: false,
      LocationAdvertisementVideo: false,
    });
    setEditLocationModal(false);
  };

  const handleCreateLocationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const formData = new FormData();
      // Append all the other form fields

      if (createLocationFormData?.LocationName.length > 100) {
        return toast.custom((t: any) => (
          <Toast type="warning" content="Location Name Too Long" t={t} />
        ));
      }

      if (createLocationFormData?.LocationCode.length > 10) {
        return toast.custom((t: any) => (
          <Toast type="warning" content="Location Code Too Long" t={t} />
        ));
      }

      if (
        createLocationFormData?.LocationType === "Control" &&
        createLocationFormData?.LocationManager === null
      ) {
        return toast.custom((t: any) => (
          <Toast type="warning" content="Select a location manager" t={t} />
        ));
      }

      if (
        createLocationFormData?.LocationType === "Property" &&
        createLocationFormData?.LocationParentID === ""
      ) {
        return toast.custom((t: any) => (
          <Toast
            type="warning"
            content="Select a control location for property"
            t={t}
          />
        ));
      }

      Object.keys(createLocationFormData!).forEach((key) => {
        const value = createLocationFormData![key as keyof Location];
        if (
          key !== "LocationImage" &&
          key !== "LocationLogo" &&
          key !== "LocationReceptionistPhoto" &&
          key !== "LocationAdvertisementVideo"
        ) {
          formData.append(key, value);
        }
      });

      // Append the UserPhoto as a file
      if (createLocationFormData.LocationLogo) {
        formData.append("LocationLogo", createLocationFormData.LocationLogo);
      }

      if (createLocationFormData.LocationImage) {
        formData.append("LocationImage", createLocationFormData.LocationImage);
      }

      if (createLocationFormData.LocationReceptionistPhoto) {
        formData.append(
          "LocationReceptionistPhoto",
          createLocationFormData.LocationReceptionistPhoto
        );
      }

      if (createLocationFormData.LocationAdvertisementVideo) {
        formData.append(
          "LocationAdvertisementVideo",
          createLocationFormData.LocationAdvertisementVideo
        );
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/location`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: formData,
        }
      );

      if (response.status === 201) {
        toast.custom((t: any) => (
          <Toast type="success" content="Location Created successfully" t={t} />
        ));
        setCreateLocationModal(false);
        fetchLocationData();
        setCreateLocationFormData({
          LocationName: "",
          LocationCode: "",
          LocationType: "",
          LocationManager: null,
          LocationBanner: "",
          LocationParentID: "",
          LocationImage: null,
          LocationLogo: null,
          LocationReceptionistPhoto: null,
          LocationAdvertisementVideo: "",
          IsActive: 0,
        });
      } else {
        throw new Error("Failed to create location");
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast type="error" content="Failed to create location" t={t} />
      ));
    }
  };

  const handleEditLocationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Ensure LocationParentID is set to 0 for 'Control' type
    if (selectedLocation?.LocationType === "Control") {
      selectedLocation.LocationParentID = "";
    }

    if (selectedLocation?.LocationName.length > 100) {
      return toast.custom((t: any) => (
        <Toast type="warning" content="Location Name Too Long" t={t} />
      ));
    }

    if (selectedLocation?.LocationCode.length > 10) {
      return toast.custom((t: any) => (
        <Toast type="warning" content="Location Code Too Long" t={t} />
      ));
    }

    if (
      selectedLocation.LocationType === "Control" &&
      selectedLocation?.LocationManager === null
    ) {
      return toast.custom((t: any) => (
        <Toast type="warning" content="Select a location manager" t={t} />
      ));
    }

    if (
      selectedLocation?.LocationType === "Property" &&
      selectedLocation?.LocationParentID === ""
    ) {
      return toast.custom((t: any) => (
        <Toast
          type="warning"
          content="Select a control location for property"
          t={t}
        />
      ));
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
          key !== "LocationLogo" &&
          key !== "LocationReceptionistPhoto" &&
          key !== "LocationAdvertisementVideo"
        ) {
          formData.append(key, value);
        }
      });

      // Append file fields to FormData
      if (selectedLocation!.LocationImage) {
        formData.append("LocationImage", selectedLocation!.LocationImage);
      }

      if (selectedLocation!.LocationLogo) {
        formData.append("LocationLogo", selectedLocation!.LocationLogo);
      }

      if (selectedLocation!.LocationReceptionistPhoto) {
        formData.append(
          "LocationReceptionistPhoto",
          selectedLocation!.LocationReceptionistPhoto
        );
      }

      if (selectedLocation.LocationAdvertisementVideo) {
        formData.append(
          "LocationAdvertisementVideo",
          selectedLocation.LocationAdvertisementVideo
        );
      }

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
        setSelectedLocation({
          LocationName: "",
          LocationCode: "",
          LocationType: "",
          LocationManager: null,
          LocationParentID: "",
          LocationImage: "",
          LocationBanner: "",
          LocationLogo: "",
          LocationReceptionistPhoto: "",
          LocationAdvertisementVideo: "",
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

  const fetchUserListData = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 200) {
        const data: User[] = await response.json();
        setUserListData(
          data.filter((user) => user.IsActive === 1 && user.Role !== "Guest")
        );
      } else {
        throw new Error("Failed to fetch location data");
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast type="error" content="Failed to fetch location data" t={t} />
      ));
    }
  };

  const handleSearchLocation = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const searchValue = event.target.value;
    const filteredLocations = locationData.filter((location) =>
      location.LocationName.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredLocationData(filteredLocations);
  };

  useEffect(() => {
    setFilteredLocationData(locationData);
  }, [locationData]);

  useEffect(() => {
    fetchUserListData();
  }, []);

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col relative">
      <div className="flex items-center justify-between sticky top-0 bg-background pb-2 pr-2 border-b border-b-border">
        <div className="flex items-center gap-1">
          <SearchInput
            placeholder="Locations"
            onChange={handleSearchLocation}
          />
        </div>
        <div>
          <Button
            color="foreground"
            icon={<Plus />}
            text="Location"
            onClick={handleOpenCreateLocationModal}
          />
        </div>
      </div>
      <div className="w-full h-full pt-2 pb-2 pr-2">
        {/* Create a grid to display locationOptions in cards */}
        <div className="w-full h-fit grid grid-cols-3 gap-2">
          {filteredLocationData?.map((location, index) => (
            <div
              key={index}
              className="w-full h-full rounded-md bg-foreground border border-border hover:bg-highlight duration-300 p-2 cursor-pointer"
              onClick={handleOpenEditLocationModal.bind(null, location)}
            >
              <div className="w-full">
                <div>
                  <h1 className="font-bold text-xl">
                    {location?.LocationName}
                  </h1>
                </div>
                <div className="w-full h-full flex flex-col gap-1 justify-between items-start">
                  <div className="w-full h-full">
                    <div className="w-full h-full flex flex-col gap-1">
                      <div className="w-full flex justify-center items-center">
                        <div className="w-full flex gap-1 items-center">
                          <h1 className="font-bold text-sm text-textAlt">
                            Type
                          </h1>
                          <h1 className="font-bold text-sm text-text">
                            {location?.LocationType}
                          </h1>
                        </div>
                        <div>
                          {location?.IsActive ? (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/30 text-green-500">
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/30 text-red-500">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                      {location.LocationType === "Property" &&
                        location.LocationParentID !== "" && (
                          <div className="w-full flex gap-1 items-start">
                            <h1 className="font-bold text-sm text-textAlt">
                              Control
                            </h1>
                            <h1 className="font-bold text-sm text-text">
                              {location?.LocationParentID?.split(",")
                                .map((controlID) => {
                                  return locationData.find(
                                    (loc) => loc.LocationID === +controlID
                                  )?.LocationName;
                                })
                                .join(", ")}
                            </h1>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Location Modal */}
      {createLocationModal && (
        <Modal
          className="w-1/2"
          title="New Location"
          onClose={handleCloseCreateLocationModal}
        >
          <form
            className="mt-4 w-full h-full"
            onSubmit={handleCreateLocationSubmit}
          >
            <div className="w-full h-full flex flex-col gap-4 justify-between">
              <div className="w-full flex justify-between gap-2">
                <div className="w-full">
                  <h1 className="font-bold text-sm">Name</h1>
                  <Input
                    name="LocationName"
                    value={createLocationFormData.LocationName}
                    onChange={handleCreateLocationChange}
                    required
                  />
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Code</h1>
                  <Input
                    name="LocationCode"
                    value={createLocationFormData.LocationCode}
                    onChange={handleCreateLocationChange}
                    required
                  />
                </div>
              </div>
              <div className="w-full flex justify-between gap-2">
                <div className="w-full">
                  <h1 className="font-bold text-sm">Type</h1>
                  <Select
                    options={[
                      { value: "Property", label: "Property" },
                      { value: "Control", label: "Control" },
                    ]}
                    placeholder="Select Location Type"
                    onChange={(e) =>
                      setCreateLocationFormData({
                        ...createLocationFormData,
                        LocationType: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Location Manager</h1>
                  <Select
                    options={userListData?.map((user) => {
                      return { value: user.UserName, label: user.DisplayName };
                    })}
                    placeholder="Select Location Manager"
                    onChange={(e) =>
                      setCreateLocationFormData({
                        ...createLocationFormData,
                        LocationManager: e.target.value,
                      })
                    }
                    disabled={
                      createLocationFormData.LocationType === "Control"
                        ? false
                        : true
                    }
                  />
                </div>
              </div>
              <div className="w-full flex justify-between gap-2">
                <div className="w-full">
                  <h1 className="font-bold text-sm">Logo</h1>
                  <Input
                    name="LocationLogo"
                    // value={createLocationFormData.LocationLogo}
                    onChange={handleCreateLocationChange}
                    type="file"
                    // required
                  />
                  {createLocationFormData.LocationLogo && (
                    <Button
                      type="button"
                      color="foreground"
                      text="Remove"
                      onClick={() =>
                        setCreateLocationFormData({
                          ...createLocationFormData,
                          LocationLogo: null,
                        })
                      }
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Receptionist Photo</h1>
                  <Input
                    name="LocationReceptionistPhoto"
                    // value={createLocationFormData.LocationReceptionistPhoto}
                    onChange={handleCreateLocationChange}
                    type="file"
                    // required
                  />
                  {createLocationFormData.LocationReceptionistPhoto && (
                    <Button
                      type="button"
                      color="foreground"
                      text="Remove"
                      onClick={() =>
                        setCreateLocationFormData({
                          ...createLocationFormData,
                          LocationReceptionistPhoto: null,
                        })
                      }
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
              <div className="w-full flex justify-between gap-2">
                <div className="w-full">
                  <h1 className="font-bold text-sm">Location Banner</h1>
                  <Input
                    name="LocationBanner"
                    value={createLocationFormData.LocationBanner}
                    onChange={handleCreateLocationChange}
                    type="file"
                  />
                  {createLocationFormData.LocationBanner && (
                    <Button
                      type="button"
                      color="foreground"
                      text="Remove"
                      onClick={() =>
                        setCreateLocationFormData({
                          ...createLocationFormData,
                          LocationBanner: null,
                        })
                      }
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Advertisement Video</h1>
                  <Input
                    name="LocationAdvertisementVideo"
                    value={createLocationFormData.LocationAdvertisementVideo}
                    onChange={handleCreateLocationChange}
                    type="video"
                  />
                  {createLocationFormData.LocationAdvertisementVideo && (
                    <Button
                      type="button"
                      color="foreground"
                      text="Remove"
                      onClick={() =>
                        setCreateLocationFormData({
                          ...createLocationFormData,
                          LocationAdvertisementVideo: null,
                        })
                      }
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
              <div className="w-full flex justify-between gap-2">
                <div className="w-full max-w-[50%]">
                  <h1 className="font-bold text-sm">Image</h1>
                  <Input
                    name="LocationImage"
                    value={createLocationFormData.LocationImage}
                    onChange={handleCreateLocationChange}
                    type="file"
                    // required
                  />
                  {createLocationFormData.LocationImage && (
                    <Button
                      type="button"
                      color="foreground"
                      text="Remove"
                      onClick={() =>
                        setCreateLocationFormData({
                          ...createLocationFormData,
                          LocationImage: null,
                        })
                      }
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Control</h1>
                  <Select
                    options={locationData
                      .filter((location) => location.LocationType === "Control")
                      .filter((location) => location.IsActive === 1)
                      .filter(
                        (location) =>
                          !createLocationFormData.LocationParentID?.split(
                            ","
                          ).includes(location?.LocationID?.toString() || "")
                      )
                      .map((location) => ({
                        value: location.LocationID!.toString(),
                        label: location.LocationName,
                      }))}
                    placeholder="Assign Control"
                    onChange={(e) =>
                      setCreateLocationFormData((prev) => {
                        const newValue = e.target.value;
                        // Get current values as an array, or an empty array if none exist
                        const currentValues = prev.LocationParentID
                          ? prev.LocationParentID.split(",").filter(
                              (v) => v.trim() !== ""
                            )
                          : [];
                        // Append newValue if it doesn't already exist
                        if (!currentValues.includes(newValue)) {
                          currentValues.push(newValue);
                        }
                        return {
                          ...prev,
                          LocationParentID: currentValues.join(","),
                        };
                      })
                    }
                    disabled={
                      createLocationFormData.LocationType === "Property"
                        ? false
                        : true
                    }
                  />
                  {/* Show selected controls and give option to remove it */}
                  {createLocationFormData.LocationParentID && (
                    <div className="w-full flex flex-col gap-2 mt-3">
                      <div className="w-full flex gap-2">
                        {createLocationFormData.LocationParentID.split(",").map(
                          (controlID) => {
                            const control = locationData.find(
                              (loc) => loc.LocationID === +controlID
                            );
                            return (
                              <div
                                key={controlID}
                                className="w-fit px-2 py-1 rounded-md flex items-center gap-2 bg-background"
                              >
                                <h1 className="font-bold text-sm">
                                  {control?.LocationName}
                                </h1>
                                <X
                                  className="w-5 h-5 cursor-pointer"
                                  onClick={() =>
                                    setCreateLocationFormData((prev) => {
                                      const currentValues =
                                        prev.LocationParentID
                                          ? prev.LocationParentID.split(
                                              ","
                                            ).filter(
                                              (v) => v.trim() !== controlID
                                            )
                                          : [];
                                      return {
                                        ...prev,
                                        LocationParentID:
                                          currentValues.join(","),
                                      };
                                    })
                                  }
                                />
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full flex justify-between">
                <div className="w-full flex items-center gap-2">
                  <Input
                    type="checkBox"
                    name="IsActive"
                    value={
                      createLocationFormData!.IsActive === 1 ? "true" : "false"
                    }
                    onChange={(e) =>
                      setCreateLocationFormData({
                        ...createLocationFormData,
                        IsActive: (e.target as HTMLInputElement).checked
                          ? 1
                          : 0,
                      })
                    }
                  />
                  <h1 className="font-bold text-sm">
                    {createLocationFormData!.IsActive ? "Active" : "Inactive"}
                  </h1>
                </div>
                {/* <div>
                    <Button text='Preview' color='foreground' onClick={handleCloseCreateLocationModal} />
                  </div> */}
              </div>
              <div className="w-full flex justify-between gap-2">
                {createLocationFormData!.LocationImage && (
                  <div className="w-1/3 flex justify-center">
                    <div className="w-full flex flex-col gap-2">
                      <div>
                        <h1 className="font-bold text-sm">Location Image</h1>
                      </div>
                      <div className="w-full flex justify-center">
                        <img
                          src={
                            createLocationFormData!.LocationImage instanceof
                            File
                              ? URL.createObjectURL(
                                  createLocationFormData!.LocationImage
                                )
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}${
                                  createLocationFormData!.LocationImage
                                }`
                          }
                          alt="Location Image"
                          className="w-20 h-20 object-contain rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {createLocationFormData!.LocationLogo && (
                  <div className="w-1/3 flex justify-center">
                    <div className="w-full flex flex-col gap-2">
                      <div>
                        <h1 className="font-bold text-sm">Location Logo</h1>
                      </div>
                      <div className="w-full flex justify-center">
                        <img
                          src={
                            createLocationFormData!.LocationLogo instanceof File
                              ? URL.createObjectURL(
                                  createLocationFormData!.LocationLogo
                                )
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}${
                                  createLocationFormData!.LocationLogo
                                }`
                          }
                          alt="Location Logo"
                          className="w-20 h-20 object-contain rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {createLocationFormData!.LocationReceptionistPhoto && (
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
                            createLocationFormData!
                              .LocationReceptionistPhoto instanceof File
                              ? URL.createObjectURL(
                                  createLocationFormData!
                                    .LocationReceptionistPhoto
                                )
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}${
                                  createLocationFormData!
                                    .LocationReceptionistPhoto
                                }`
                          }
                          alt="Receptionist Photo"
                          className="w-20 h-20 object-contain rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {createLocationFormData!.LocationBanner && (
                  <div className="w-1/3 flex justify-center">
                    <div className="w-full flex flex-col gap-2">
                      <div>
                        <h1 className="font-bold text-sm">Banner</h1>
                      </div>
                      <div className="w-full flex justify-center">
                        <img
                          src={
                            createLocationFormData!.LocationBanner instanceof
                            File
                              ? URL.createObjectURL(
                                  createLocationFormData!.LocationBanner
                                )
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}${
                                  createLocationFormData!.LocationBanner
                                }`
                          }
                          alt="Banner Photo"
                          className="w-20 h-20 object-contain rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-2 border-t-2 border-t-border pt-4">
                <Button text="Save" color="foreground" type="submit" />
                <Button
                  text="Cancel"
                  color="foreground"
                  onClick={handleCloseCreateLocationModal}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Location Modal */}
      {editLocationModal && (
        <Modal
          className="w-1/2"
          title="Edit Location"
          onClose={handleCloseEditLocationModal}
        >
          <form className="mt-4" onSubmit={handleEditLocationSubmit}>
            <div className="flex flex-col gap-2">
              <div className="w-full flex justify-between gap-2">
                <div className="w-full">
                  <h1 className="font-bold text-sm">Name</h1>
                  <Input
                    name="LocationName"
                    value={selectedLocation!.LocationName}
                    onChange={handleEditLocationChange}
                    required
                  />
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Code</h1>
                  <Input
                    name="LocationCode"
                    value={selectedLocation!.LocationCode}
                    onChange={handleEditLocationChange}
                    required
                  />
                </div>
              </div>
              <div className="w-full flex justify-between gap-2">
                <div className="w-full">
                  <h1 className="font-bold text-sm">Type</h1>
                  <Select
                    options={[
                      { value: "Property", label: "Property" },
                      { value: "Control", label: "Control" },
                    ]}
                    placeholder="Select Location Type"
                    onChange={(e) =>
                      setSelectedLocation({
                        ...selectedLocation!,
                        LocationType: e.target.value,
                        LocationParentID: "",
                        LocationManager: null,
                      })
                    }
                    defaultValue={selectedLocation!.LocationType}
                  />
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Location Manager</h1>
                  <Select
                    options={userListData?.map((user) => {
                      return { value: user.UserName, label: user.DisplayName };
                    })}
                    placeholder="Select Location Manager"
                    onChange={(e) =>
                      setSelectedLocation({
                        ...selectedLocation,
                        LocationManager: e.target.value,
                      })
                    }
                    defaultValue={
                      selectedLocation?.LocationManager ?? undefined
                    }
                    disabled={
                      selectedLocation.LocationType === "Control" ? false : true
                    }
                  />
                </div>
              </div>
              <div className="w-full flex justify-between gap-2">
                <div className="w-full">
                  <h1 className="font-bold text-sm">Logo</h1>
                  <Input
                    name="LocationLogo"
                    value={selectedLocation!.LocationLogo}
                    onChange={(e) => {
                      setRemoveLocationFiles((prev) => ({
                        ...prev,
                        LocationLogo: false,
                      }));
                      handleEditLocationChange(e);
                    }}
                    type="file"
                    // required
                  />
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Receptionist Photo</h1>
                  <Input
                    name="LocationReceptionistPhoto"
                    value={selectedLocation!.LocationReceptionistPhoto}
                    onChange={(e) => {
                      setRemoveLocationFiles((prev) => ({
                        ...prev,
                        LocationReceptionistPhoto: false,
                      }));
                      handleEditLocationChange(e);
                    }}
                    type="file"
                    // required
                  />
                </div>
              </div>
              <div className="w-full flex justify-between gap-2">
                <div className="w-full">
                  <h1 className="font-bold text-sm">Location Banner</h1>
                  <Input
                    name="LocationBanner"
                    value={selectedLocation.LocationBanner}
                    onChange={(e) => {
                      setRemoveLocationFiles((prev) => ({
                        ...prev,
                        LocationBanner: false,
                      }));
                      handleEditLocationChange(e);
                    }}
                    type="file"
                  />
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Advertisement Video</h1>
                  <Input
                    name="LocationAdvertisementVideo"
                    value={selectedLocation.LocationAdvertisementVideo}
                    onChange={(e) => {
                      setRemoveLocationFiles((prev) => ({
                        ...prev,
                        LocationAdvertisementVideo: false,
                      }));
                      handleEditLocationChange(e);
                    }}
                    type="video"
                  />
                </div>
              </div>
              <div className="w-full flex justify-between gap-2">
                <div className="w-full max-w-[50%]">
                  <h1 className="font-bold text-sm">Image</h1>
                  <Input
                    name="LocationImage"
                    value={selectedLocation!.LocationImage}
                    onChange={(e) => {
                      setRemoveLocationFiles((prev) => ({
                        ...prev,
                        LocationImage: false,
                      }));
                      handleEditLocationChange(e);
                    }}
                    type="file"
                    // required
                  />
                </div>
                <div className="w-full">
                  <h1 className="font-bold text-sm">Control</h1>
                  <Select
                    options={locationData
                      .filter((location) => location.LocationType === "Control")
                      .filter((location) => location.IsActive === 1)
                      .filter(
                        (location) =>
                          !selectedLocation.LocationParentID?.split(
                            ","
                          ).includes(location.LocationID?.toString() || "")
                      )
                      .map((location) => ({
                        value: location.LocationID!.toString(),
                        label: location.LocationName,
                      }))}
                    placeholder="Assign Control"
                    onChange={(e) =>
                      setSelectedLocation((prev) => {
                        // Get the new value as a string
                        const newValue = e.target.value;
                        // Convert the current LocationParentID to an array (or start with an empty array)
                        const currentValues = prev?.LocationParentID
                          ? prev.LocationParentID.split(",").filter(
                              (val) => val.trim() !== ""
                            )
                          : [];
                        // Append the new value if it's not already included
                        if (!currentValues.includes(newValue)) {
                          currentValues.push(newValue);
                        }
                        // Return the updated object with the joined string
                        return {
                          ...prev,
                          LocationParentID: currentValues.join(","),
                        };
                      })
                    }
                    defaultValue={selectedLocation?.LocationParentID?.toString()}
                    disabled={
                      selectedLocation.LocationType === "Property"
                        ? false
                        : true
                    }
                  />
                  {/* Show selected controls and give option to remove it */}
                  {selectedLocation.LocationParentID && (
                    <div className="w-full flex flex-col gap-2 mt-3">
                      <div className="w-full flex gap-2">
                        {selectedLocation.LocationParentID.split(",").map(
                          (controlID) => {
                            const trimmedControlID = controlID.trim();
                            const control = locationData.find(
                              (loc) => loc.LocationID === +trimmedControlID
                            );
                            return (
                              <div
                                key={trimmedControlID}
                                className="w-fit px-2 py-1 rounded-md flex items-center gap-2 bg-background"
                              >
                                <h1 className="font-bold text-sm">
                                  {control?.LocationName}
                                </h1>
                                <X
                                  className="w-5 h-5 cursor-pointer"
                                  onClick={() =>
                                    setSelectedLocation((prev) => {
                                      // Convert the current LocationParentID to an array (trimming values)
                                      const currentValues =
                                        prev?.LocationParentID
                                          ? prev.LocationParentID.split(",")
                                              .map((val) => val.trim())
                                              .filter(
                                                (val) =>
                                                  val !== trimmedControlID
                                              )
                                          : [];
                                      // Return the updated object with the joined string
                                      return {
                                        ...prev,
                                        LocationParentID:
                                          currentValues.join(", "),
                                      };
                                    })
                                  }
                                />
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full flex justify-between pb-2">
                <div className="w-full flex gap-2 items-center">
                  <Input
                    type="checkBox"
                    name="IsActive"
                    value={selectedLocation!.IsActive === 1 ? "true" : "false"}
                    onChange={(e) =>
                      setSelectedLocation({
                        ...selectedLocation!,
                        IsActive: (e.target as HTMLInputElement).checked
                          ? 1
                          : 0,
                      })
                    }
                    required
                  />
                  <h1 className="font-bold text-sm">
                    {selectedLocation!.IsActive ? "Active" : "Inactive"}
                  </h1>
                </div>
                {/* <div>
                    <Button text='Preview' color='foreground' onClick={handleCloseCreateLocationModal} />
                  </div> */}
              </div>
              <div className="w-full flex justify-between gap-2">
                {selectedLocation!.LocationImage &&
                  !removeLocationFiles.LocationImage && (
                    <div className="mt-2 flex flex-col">
                      <div className="flex gap-2 items-center">
                        <h1 className="font-bold">Location Image</h1>
                        <Trash
                          className="text-red-500"
                          onClick={() => {
                            setSelectedLocation({
                              ...selectedLocation!,
                              LocationImage: null,
                            });
                            setRemoveLocationFiles((prev) => ({
                              ...prev,
                              LocationImage: true,
                            }));
                          }}
                        />
                      </div>
                      <div>
                        <img
                          src={
                            selectedLocation!.LocationImage instanceof File
                              ? URL.createObjectURL(
                                  selectedLocation!.LocationImage
                                )
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}${
                                  selectedLocation!.LocationImage
                                }`
                          }
                          alt="Location Logo"
                          className="w-32 h-32 object-contain rounded-md"
                        />
                      </div>
                    </div>
                  )}
                {selectedLocation!.LocationLogo &&
                  !removeLocationFiles.LocationLogo && (
                    <div className="mt-2 flex flex-col">
                      <div className="flex gap-2 items-center">
                        <h1 className="font-bold">Logo</h1>
                        <Trash
                          className="text-red-500"
                          onClick={() => {
                            setSelectedLocation({
                              ...selectedLocation!,
                              LocationLogo: null,
                            });
                            setRemoveLocationFiles((prev) => ({
                              ...prev,
                              LocationLogo: true,
                            }));
                          }}
                        />
                      </div>
                      <div>
                        <img
                          src={
                            selectedLocation!.LocationLogo instanceof File
                              ? URL.createObjectURL(
                                  selectedLocation!.LocationLogo
                                )
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}${
                                  selectedLocation!.LocationLogo
                                }`
                          }
                          alt="Location Logo"
                          className="w-32 h-32 object-contain rounded-md"
                        />
                      </div>
                    </div>
                  )}
                {selectedLocation!.LocationReceptionistPhoto &&
                  !removeLocationFiles.LocationReceptionistPhoto && (
                    <div className="mt-2 flex flex-col">
                      <div className="flex gap-2 items-center">
                        <h1 className="font-bold">Receptionist Photo</h1>
                        <Trash
                          className="text-red-500"
                          onClick={() => {
                            setSelectedLocation({
                              ...selectedLocation!,
                              LocationReceptionistPhoto: null,
                            });
                            setRemoveLocationFiles((prev) => ({
                              ...prev,
                              LocationReceptionistPhoto: true,
                            }));
                          }}
                        />
                      </div>
                      <div>
                        <img
                          src={
                            selectedLocation!
                              .LocationReceptionistPhoto instanceof File
                              ? URL.createObjectURL(
                                  selectedLocation!.LocationReceptionistPhoto
                                )
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}${
                                  selectedLocation!.LocationReceptionistPhoto
                                }`
                          }
                          alt="Location Logo"
                          className="w-32 h-32 object-contain rounded-md"
                        />
                      </div>
                    </div>
                  )}
                {selectedLocation!.LocationBanner &&
                  !removeLocationFiles.LocationBanner && (
                    <div className="mt-2 flex flex-col">
                      <div className="flex gap-2 items-center">
                        <h1 className="font-bold">Banner</h1>
                        <Trash
                          className="text-red-500"
                          onClick={() => {
                            setSelectedLocation({
                              ...selectedLocation!,
                              LocationBanner: null,
                            });
                            setRemoveLocationFiles((prev) => ({
                              ...prev,
                              LocationBanner: true,
                            }));
                          }}
                        />
                      </div>
                      <div>
                        <img
                          src={
                            selectedLocation!.LocationBanner instanceof File
                              ? URL.createObjectURL(
                                  selectedLocation!.LocationBanner
                                )
                              : `${process.env.NEXT_PUBLIC_BACKEND_URL}${
                                  selectedLocation!.LocationBanner
                                }`
                          }
                          alt="Location Logo"
                          className="w-32 h-32 object-contain rounded-md"
                        />
                      </div>
                    </div>
                  )}
                  {selectedLocation!.LocationAdvertisementVideo &&
                  !removeLocationFiles.LocationAdvertisementVideo && (
                    <div className="mt-2 flex flex-col">
                      <div className="flex gap-2 items-center">
                        <h1 className="font-bold">Advertisement video</h1>
                        <Trash
                          className="text-red-500"
                          onClick={() => {
                            setSelectedLocation({
                              ...selectedLocation!,
                              LocationAdvertisementVideo: null,
                            });
                            setRemoveLocationFiles((prev) => ({
                              ...prev,
                              LocationAdvertisementVideo: true,
                            }));
                          }}
                        />
                      </div>
                    </div>
                  )}
              </div>
              <div className="flex justify-center gap-2 border-t-2 border-t-border pt-4">
                <Button text="Save" color="foreground" type="submit" />
                <Button
                  text="Cancel"
                  color="foreground"
                  onClick={handleCloseEditLocationModal}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
