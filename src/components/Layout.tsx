/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Backpack,
  Cctv,
  FileText,
  LockKeyhole,
  LogOut,
  MapPinPlus,
  SmartphoneNfc,
  Users,
} from "lucide-react";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import Tooltip from "./ui/ToolTip";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import Image from "next/image";
import Input from "./ui/Input";
import toast from "react-hot-toast";
import Toast from "./ui/Toast";
import jwt from "jsonwebtoken";
import { CallQueue, Location, RoleDetail, User } from "@/utils/types";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { useCallRing } from "./ui/CallRing";
import { CallListContext } from "@/context/CallListContext";
import WithRole from "./WithRole";
import logOut from "@/utils/logOut";
import { useSocket } from "@/context/SocketContext";
import { CallDetailsContext } from "@/context/CallDetailsContext";

export default function Index({
  header,
  headerTitle,
  menu = true,
  children,
}: {
  header?: ReactNode;
  headerTitle: ReactNode;
  menu?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [userOnline, setUserOnline] = useState(true);
  const [user, setUser] = useState<User>();
  const [roleDetails, setRoleDetails] = useState<RoleDetail[]>();
  const [confirmToggleModal, setConfirmToggleModal] = useState(false);
  const [confirmLogoutModal, setConfirmLogoutModal] = useState<boolean>(false);
  const [password, setPassword] = useState("");
  const [logOutPassword, setLogOutPassword] = useState("");
  const passwordRef = useRef<HTMLInputElement>(null);
  const logOutPasswordRef = useRef<HTMLInputElement>(null);
  const changePasswordRef = useRef<HTMLInputElement>(null);
  const [changePasswordModal, setChangePasswordModal] =
    useState<boolean>(false);
  const [changePasswordPayload, setChangePasswordPayload] = useState<{
    oldPassword: string;
    newPassword: string;
  }>({
    oldPassword: "",
    newPassword: "",
  });

  const [userId, setUserId] = useState<string>();
  const { CallRingComponent, showCallRing } = useCallRing();
  const { callList, setCallList, setCallToPickUp } =
    useContext(CallListContext);
  const { socket } = useSocket();
  const [joinedCallIds, setJoinedCallIds] = useState<Set<string>>(new Set());
  const [userControl, setUserControl] = useState<Location>();
  const { setGuestLocation } = useContext(CallDetailsContext);

  const fetchGuestLocationDetails = async (userName: string) => {
    const cookies = parseCookies();
    const { userToken } = cookies;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/userLocationList/user/${userName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 200) {
        response.json().then((data) => {
          setGuestLocation(data[0]);
        });
      } else {
        console.log({ response });
        return toast.custom((t: any) => (
          <Toast t={t} type="error" content="Error Fetching User Status" />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} type="error" content="Error Fetching User Status" />
      ));
    }
  };

  useEffect(() => {
    if (confirmToggleModal) {
      passwordRef.current?.focus();
    }
    if (confirmLogoutModal) {
      logOutPasswordRef.current?.focus();
    }
    if (changePasswordModal) {
      changePasswordRef.current?.focus();
    }
  }, [confirmToggleModal, confirmLogoutModal, changePasswordModal]);

  const handleLogOutToggle = () => {
    setConfirmLogoutModal(true);
  };

  const handleChangePasswordToggle = () => {
    setChangePasswordModal(true);
  };

  const handleCloseChangePasswordModal = () => {
    setChangePasswordModal(false);
    setChangePasswordPayload({
      oldPassword: "",
      newPassword: "",
    });
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Password Change");

    const cookies = parseCookies();
    const { userToken } = cookies;

    if (changePasswordPayload.oldPassword === "") {
      return toast.custom((t: any) => {
        <Toast t={t} content="Old Password Is Required" type="error" />;
      });
    }
    if (changePasswordPayload.newPassword === "") {
      return toast.custom((t: any) => {
        <Toast t={t} content="New Password Is Required" type="error" />;
      });
    }

    try {
      const response: any = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/authentication/changePassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            oldPassword: changePasswordPayload.oldPassword,
            newPassword: changePasswordPayload.newPassword,
          }),
        }
      );

      if (response.status === 200) {
        setChangePasswordModal(false);
        setChangePasswordPayload({
          oldPassword: "",
          newPassword: "",
        });
        return toast.custom((t: any) => (
          <Toast t={t} type="success" content="Password changed successfully" />
        ));
      } else if (response.status === 401) {
        return toast.custom((t: any) => (
          <Toast content="Old Password Is Invalid" type="error" t={t} />
        ));
      }
    } catch (error: any) {
      return toast.custom((t: any) => (
        <Toast t={t} type="error" content={error.error} />
      ));
    }
  };

  const toggleUserAway = () => {
    setConfirmToggleModal(true);
  };

  const handleCloseConfirmToggleModal = async () => {
    setConfirmToggleModal(false);
    setPassword("");
  };

  const handleCloseConfirmLogoutModal = async () => {
    setConfirmLogoutModal(false);
    setLogOutPassword("");
  };

  const handleToggleUser = async (event: React.FormEvent) => {
    event.preventDefault();

    const cookies = parseCookies();
    const { userToken } = cookies;
    const decoded = jwt.decode(userToken) as {
      userName: string;
      exp: number;
      role: string;
    };
    const { userName } = decoded;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verifyUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ userName, password }),
        }
      );

      if (response.status === 200) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/userLogs`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
              body: JSON.stringify({
                status: userOnline ? "Away" : "Available",
              }),
            }
          );

          if (response.status === 200) {
            setUserOnline(!userOnline);
            setPassword("");
            setConfirmToggleModal(false);
            return toast.custom((t: any) => (
              <Toast
                t={t}
                type="info"
                content={userOnline ? "You Are Now Away" : "You Are Now Online"}
              />
            ));
          } else if (response.status === 401) {
            logOut(router);
          }
        } catch {
          return toast.custom((t: any) => (
            <Toast t={t} type="error" content="Error Updating User Status" />
          ));
        }
      } else {
        return toast.custom((t: any) => (
          <Toast content="Invalid Credentials!" type="error" t={t} />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} type="error" content="Error Updating User Status" />
      ));
    }
  };

  const handleUserLogout = async (event: React.FormEvent) => {
    event.preventDefault();

    const cookies = parseCookies();
    const { userToken } = cookies;
    const decoded = jwt.decode(userToken) as {
      userName: string;
      exp: number;
      role: string;
    };
    const { userName } = decoded;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verifyUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ userName, password: logOutPassword }),
        }
      );

      if (response.status === 200) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/userLogs`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
              body: JSON.stringify({
                status: "Logged Out",
              }),
            }
          );

          if (response.status === 200) {
            setLogOutPassword("");
            setConfirmLogoutModal(false);
            logOut(router);
            return toast.custom((t: any) => (
              <Toast t={t} type="success" content="Logged Out Successfully" />
            ));
          }
        } catch (e) {
          console.log({ e });
          return toast.custom((t: any) => (
            <Toast t={t} type="error" content="Error Logging Out" />
          ));
        }
      } else {
        return toast.custom((t: any) => (
          <Toast content="Invalid Credentials!" type="error" t={t} />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} type="error" content="Error Logging Out" />
      ));
    }
  };

  const fetchUserDetails = async () => {
    const cookies = parseCookies();
    const { userToken } = cookies;
    const decoded = jwt.decode(userToken);
    const { userName } = decoded as { userName: string };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 200) {
        response.json().then((data) => {
          setUser(data);
        });
      } else if (response.status === 401) {
        logOut(router);
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} type="error" content="Error Fetching User Details" />
      ));
    }
  };

  const fetchRoleDetails = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/roleDetails`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 200) {
        response.json().then((data) => {
          setRoleDetails(data);
        });
      } else if (response.status === 401) {
        logOut(router);
      } else {
        return toast.custom((t: any) => (
          <Toast t={t} type="error" content="Error Fetching Role Details" />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} type="error" content="Error Fetching Role Details" />
      ));
    }
  };

  const fetchUserStatus = async () => {
    const cookies = parseCookies();
    const { userToken } = cookies;
    const decoded = jwt.decode(userToken);
    const { userName } = decoded as { userName: string };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/userLogs/${userName}/latest`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 200) {
        response.json().then((data) => {
          if (data.data.Status !== "Away") {
            setUserOnline(true);
          } else {
            setUserOnline(false);
          }
        });
      } else if (response.status === 401) {
        logOut(router);
      } else {
        console.log({ response });
        return toast.custom((t: any) => (
          <Toast t={t} type="error" content="Error Fetching User Status" />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} type="error" content="Error Fetching User Status" />
      ));
    }
  };

  const fetchUserControl = async () => {
    const cookies = parseCookies();
    const { userToken } = cookies;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/userLocationList/user`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 200) {
        response.json().then((data) => {
          setUserControl(data[0]);
        });
      } else if (response.status === 401) {
        logOut(router);
      } else {
        console.log({ response });
        return toast.custom((t: any) => (
          <Toast t={t} type="error" content="Error Fetching User Status" />
        ));
      }
    } catch {
      return toast.custom((t: any) => (
        <Toast t={t} type="error" content="Error Fetching User Status" />
      ));
    }
  };

  const heartBeat = async () => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;
      const decoded = jwt.decode(userToken) as {
        userName: string;
        exp: number;
        role: string;
      };
      const { role } = decoded;
      console.log("Heart Beat");
      if (role == "Host") {
        console.log("Sending Heart Beat");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/hostCheck`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              status: userOnline ? "Available" : "Away",
            }),
          }
        );

        if (response.status === 200) {
          console.log("Heart Beat Sent");
        } else if (response.status === 401) {
          logOut(router);
        }
      }
    } catch {
      console.error("Error Sending Heart Beat");
    }
  };

  useEffect(() => {
    try {
      const cookies = parseCookies();
      const { userToken } = cookies;
      const decoded = jwt.decode(userToken) as {
        userName: string;
        exp: number;
        role: string;
      };
      const { userName } = decoded as { userName: string };
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        toast.custom((t: any) => (
          <Toast t={t} type="error" content="Token has expired" />
        ));
        console.error("Token has expired");
        logOut(router);
      } else {
        setUserId(userName);
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      router.push("/");
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
    fetchRoleDetails();
    fetchUserStatus();
    fetchUserControl();
  }, []);

  useEffect(() => {
    heartBeat();
    const interval = setInterval(() => {
      heartBeat();
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   try {
  //     if (userId && userId !== "" && socket) {
  //       socket.emit("get-call-list");
  //       socket.on("call-list-update", (data: CallQueue[]) => {
  //         console.log("CALL LIST", { callList });
  //         console.log("CALL LIST DATA", { data });
  //         // Identify new "pending" calls
  //         let newPendingCalls = data.filter(
  //           (call) =>
  //             call.CallStatus === "New" &&
  //             call.CallPlacedByUserName !== userId &&
  //             call.AssignedToUserName === userId &&
  //             !callList.some(
  //               (existingCall) => existingCall.CallID === call.CallID
  //             ) &&
  //             !joinedCallIds.has(call.CallID)
  //         );

  //         if (newPendingCalls.length > 0 && router.query.from !== "push") {
  //           newPendingCalls.map((call) => {
  //             showCallRing(call, () => {
  //               setCallToPickUp(call);
  //               newPendingCalls = newPendingCalls.filter(
  //                 (c) => c.CallID !== call.CallID
  //               );
  //               fetchGuestLocationDetails(call.CallPlacedByUserName!);
  //               setJoinedCallIds((prev) => new Set(prev).add(call.CallID));
  //               router.push("/checkInHub");
  //             });
  //           });
  //         }
  //         // Update the call list state
  //         setCallList(
  //           data.filter(
  //             (call) =>
  //               call.AssignedToUserName === userId &&
  //               call.CallPlacedByUserName !== userId
  //           )
  //         );
  //       });
  //     }
  //   } catch {
  //     toast.custom((t: any) => (
  //       <Toast t={t} type="error" content="Error Connecting to Socket" />
  //     ));
  //   }
  // }, [userId, socket]);

  if (user) {
    return (
      <WithRole>
        <div className="w-full h-screen overflow-hidden flex flex-col space-y-2">
          <div className="w-full border-b-2 border-b-border py-2 flex justify-between items-center px-2 bg-foreground p-2">
            <div className="flex items-center space-x-2">
              <div className="border-r border-r-border pr-2">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={1000}
                  height={1000}
                  className="w-20"
                />
              </div>
              <div className="border-r border-r-border pr-2">
                <h1 className="font-bold text-xl">
                  {userControl?.LocationName}
                </h1>
              </div>
              {headerTitle}
            </div>
            {menu ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center gap-2">
                  {roleDetails && (
                    <>
                      {roleDetails.find(
                        (role) =>
                          role.Role.toLowerCase() === user.Role.toLowerCase() &&
                          role.Menu.toLowerCase() === "reports" &&
                          role.Action.toLowerCase() === "view, edit"
                      ) && (
                        <div
                          className={`${
                            router.pathname === "/admin/reports"
                              ? "bg-highlight"
                              : "hover:bg-highlight"
                          } rounded-md p-1 cursor-pointer`}
                          onClick={() => router.push("/admin/reports")}
                        >
                          <Tooltip tooltip="Reports" position="bottom">
                            <FileText className="w-5 h-5" />
                          </Tooltip>
                        </div>
                      )}
                      {roleDetails.find(
                        (role) =>
                          role.Role.toLowerCase() === user.Role.toLowerCase() &&
                          role.Menu.toLowerCase() === "check-in trails" &&
                          role.Action.toLowerCase() === "view, edit"
                      ) && (
                        <div
                          className={`${
                            router.pathname === "/admin/checkIns"
                              ? "bg-highlight"
                              : "hover:bg-highlight"
                          } rounded-md p-1 cursor-pointer`}
                          onClick={() => router.push("/admin/checkIns")}
                        >
                          <Tooltip tooltip="Calls" position="bottom">
                            <Backpack className="w-5 h-5" />
                          </Tooltip>
                        </div>
                      )}
                      {roleDetails.find(
                        (role) =>
                          role.Role.toLowerCase() === user.Role.toLowerCase() &&
                          role.Menu.toLowerCase() === "locations" &&
                          role.Action.toLowerCase() === "view, edit"
                      ) && (
                        <div
                          className={`${
                            router.pathname === "/admin/locations"
                              ? "bg-highlight"
                              : "hover:bg-highlight"
                          } rounded-md p-1 cursor-pointer`}
                          onClick={() => router.push("/admin/locations")}
                        >
                          <Tooltip tooltip="Locations" position="bottom">
                            <MapPinPlus className="w-5 h-5" />
                          </Tooltip>
                        </div>
                      )}
                      {roleDetails.find(
                        (role) =>
                          role.Role.toLowerCase() === user.Role.toLowerCase() &&
                          role.Menu.toLowerCase() === "users" &&
                          role.Action.toLowerCase() === "view, edit"
                      ) && (
                        <div
                          className={`${
                            router.pathname === "/admin/users"
                              ? "bg-highlight"
                              : "hover:bg-highlight"
                          } rounded-md p-1 cursor-pointer`}
                          onClick={() => router.push("/admin/users")}
                        >
                          <Tooltip tooltip="Users" position="bottom">
                            <Users className="w-5 h-5" />
                          </Tooltip>
                        </div>
                      )}
                      {roleDetails.find(
                        (role) =>
                          role.Role.toLowerCase() === user.Role.toLowerCase() &&
                          role.Menu.toLowerCase() === "watch hub" &&
                          role.Action.toLowerCase() === "view, edit"
                      ) && (
                        <div
                          className={`${
                            router.pathname === "/watchHub"
                              ? "bg-highlight"
                              : "hover:bg-highlight"
                          } rounded-md p-1 cursor-pointer`}
                          onClick={() => router.push("/watchHub")}
                        >
                          <Tooltip tooltip="Watch Hub" position="bottom">
                            <Cctv className="w-5 h-5" />
                          </Tooltip>
                        </div>
                      )}
                      {/* {roleDetails.find(
                        (role) =>
                          role.Role.toLowerCase() === user.Role.toLowerCase() &&
                          role.Menu.toLowerCase() === "check-in hub" &&
                          role.Action.toLowerCase() === "view, edit"
                      ) && (
                        <div
                          className={`${
                            router.pathname === "/checkInHub"
                              ? "bg-highlight"
                              : "hover:bg-highlight"
                          } rounded-md p-1 cursor-pointer`}
                          onClick={() => router.push("/checkInHub")}
                        >
                          <Tooltip tooltip="Check-In Hub" position="bottom">
                            <SmartphoneNfc className="w-5 h-5" />
                          </Tooltip>
                        </div>
                      )} */}
                    </>
                  )}
                  {header}
                </div>
                <div className="border-l-2 border-l-border pl-2 flex items-center gap-2">
                  <div className="flex items-center gap-2 border-r-2 border-r-border pr-2">
                    <Tooltip
                      className="transform -translate-x-9"
                      cursor={false}
                      tooltip="User Name"
                      position="bottom"
                    >
                      <div className="flex items-center gap-1">
                        <div className="w-7 h-7 flex items-center justify-center bg-gray-300 rounded-full">
                          {user?.UserPhoto === "" && (
                            <h1 className="text-textAlt font-bold">
                              {user?.DisplayName?.split(" ")
                                .slice(0, 2)
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()}
                            </h1>
                          )}
                          {user?.UserPhoto !== "" && (
                            <img
                              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${user?.UserPhoto}`}
                              alt={user?.DisplayName?.split(" ")
                                .slice(0, 2)
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()}
                              className="w-full h-full object-cover rounded-full flex items-center justify-center"
                            />
                          )}
                        </div>
                        <div>
                          <h1 className="font-bold text-xs">
                            {user?.DisplayName}
                          </h1>
                        </div>
                      </div>
                    </Tooltip>
                    <Tooltip
                      className="transform -translate-x-6"
                      tooltip="Status"
                      position="bottom"
                    >
                      <div
                        className="w-[5.6rem] h-full flex items-center gap-1"
                        onClick={toggleUserAway}
                      >
                        <div className="flex items-center">
                          <Input
                            type="checkBox"
                            name="Status"
                            value={userOnline.toString()}
                          />
                        </div>
                        <h1 className="text-xs font-bold">
                          {userOnline ? "Available" : "Away"}
                        </h1>
                      </div>
                    </Tooltip>
                  </div>
                  <div className="px-2" onClick={handleChangePasswordToggle}>
                    <Tooltip
                      className="transform -translate-x-20"
                      tooltip="Change Password"
                      position="bottom"
                    >
                      <LockKeyhole className="w-5 h-5" />
                    </Tooltip>
                  </div>
                  <div onClick={handleLogOutToggle}>
                    <Tooltip
                      className="transform -translate-x-12"
                      tooltip="Log Out"
                      position="bottom"
                    >
                      <LogOut className="w-5 h-5 text-red-500" />
                    </Tooltip>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <h1 className="text-sm font-bold text-textAlt">
                  End or hold the call to access the menu
                </h1>
              </div>
            )}
            {confirmToggleModal && (
              <Modal
                onClose={handleCloseConfirmToggleModal}
                title={`Change Status To ${
                  userOnline ? "Away" : "Available  "
                }`}
              >
                <div className="h-full flex flex-col gap-2 p-2">
                  <div>
                    <h1 className="font-bold">Password</h1>
                  </div>
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={handleToggleUser}
                  >
                    <div>
                      <Input
                        ref={passwordRef}
                        type="password"
                        name="togglePassword"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 items-center justify-center">
                      <Button
                        text={userOnline ? "Away" : "Available"}
                        color="foreground"
                        type="submit"
                      />
                      <Button
                        text="Cancel"
                        color="foreground"
                        type="button"
                        onClick={handleCloseConfirmToggleModal}
                      />
                    </div>
                  </form>
                </div>
              </Modal>
            )}
            {confirmLogoutModal && (
              <Modal
                onClose={handleCloseConfirmLogoutModal}
                title="Confirm Log Out"
              >
                <div className="flex flex-col gap-2 p-2">
                  <div>
                    <h1 className="font-bold">Password</h1>
                  </div>
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={handleUserLogout}
                  >
                    <div>
                      <Input
                        ref={logOutPasswordRef}
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={logOutPassword}
                        onChange={(e) => setLogOutPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 items-center justify-center">
                      <Button text="Log Out" color="foreground" type="submit" />
                      <Button
                        text="Cancel"
                        color="foreground"
                        type="button"
                        onClick={handleCloseConfirmLogoutModal}
                      />
                    </div>
                  </form>
                </div>
              </Modal>
            )}
            {changePasswordModal && (
              <Modal
                onClose={handleCloseChangePasswordModal}
                title="Change Password"
              >
                <form
                  className="flex flex-col space-y-4 pt-4"
                  onSubmit={handlePasswordChange}
                >
                  <div>
                    <Input
                      ref={changePasswordRef}
                      type="password"
                      name="oldPassword"
                      placeholder="Old Password"
                      value={changePasswordPayload.oldPassword}
                      onChange={(e) =>
                        setChangePasswordPayload({
                          ...changePasswordPayload,
                          oldPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="New Password"
                      value={changePasswordPayload.newPassword}
                      onChange={(e) =>
                        setChangePasswordPayload({
                          ...changePasswordPayload,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="flex gap-2 items-center justify-center">
                    <Button text="Save" color="foreground" type="submit" />
                    <Button
                      text="Cancel"
                      color="foreground"
                      type="button"
                      onClick={handleCloseChangePasswordModal}
                    />
                  </div>
                </form>
              </Modal>
            )}
          </div>
          <div className="p-2 overflow-auto">{children}</div>
          {CallRingComponent}
        </div>
      </WithRole>
    );
  }
}
