/* eslint-disable @typescript-eslint/no-explicit-any */
import { Backpack, Cctv, KeyRound, LogOut, MapPinPlus, Users } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import Tooltip from "./ui/ToolTip";
import { useRouter } from "next/router";
import { destroyCookie, parseCookies } from "nookies";
import Image from "next/image";
import Input from "./ui/Input";
import toast from "react-hot-toast";
import Toast from "./ui/Toast";
import jwt from "jsonwebtoken";
import { User } from "@/utils/types";
import Modal from "./ui/Modal";
import Button from "./ui/Button";

export default function Index({
  header,
  headerTitle,
  children
}: {
  header?: ReactNode;
  headerTitle: ReactNode;
  children: ReactNode;
}) {
  // const { theme, toggleTheme } = useContext(ThemeContext);
  const router = useRouter();
  const [userOnline, setUserOnline] = useState(true);
  const [user, setUser] = useState<User>();
  const [confirmToggleModal, setConfirmToggleModal] = useState(false);
  const [confirmLogoutModal, setConfirmLogoutModal] = useState<boolean>(false);
  const [password, setPassword] = useState('');
  const [logOutPassword, setLogOutPassword] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const logOutPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (confirmToggleModal) {
      passwordRef.current?.focus();
    }
    if (confirmLogoutModal) {
      logOutPasswordRef.current?.focus();
    }
  },
    [confirmToggleModal, confirmLogoutModal]);

  const handleLogOutToggle = () => {
    setConfirmLogoutModal(true);
  }

  const logOut = () => {
    destroyCookie(null, 'userToken');
    router.push('/');
  }

  const toggleUserAway = () => {
    setConfirmToggleModal(true);
  }

  const handleCloseConfirmToggleModal = async () => {
    setConfirmToggleModal(false);
    setPassword('');
  }

  const handleCloseConfirmLogoutModal = async () => {
    setConfirmLogoutModal(false);
    setLogOutPassword('');
  }

  const handleToggleUser = async (event: React.FormEvent) => {
    event.preventDefault();

    const cookies = parseCookies();
    const { userToken } = cookies;
    const decoded = jwt.decode(userToken) as { userName: string, exp: number, role: string };
    const { userName } = decoded;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verifyUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ userName, password })
      });

      if (response.status === 200) {
        setUserOnline(!userOnline);
        setPassword('');
        setConfirmToggleModal(false);
        return toast.custom((t: any) => (<Toast t={t} type="info" content={
          userOnline ? 'You Are Now Away' : 'You Are Now Online'
        } />));
      } else {
        return toast.custom((t: any) => <Toast content="Invalid Credentials!" type="error" t={t} />);
      }
    } catch {
      return toast.custom((t: any) => (<Toast t={t} type="error" content="Error Updating User Status" />));
    }
  }

  const handleUserLogout = async (event: React.FormEvent) => {
    event.preventDefault();

    const cookies = parseCookies();
    const { userToken } = cookies;
    const decoded = jwt.decode(userToken) as { userName: string, exp: number, role: string };
    const { userName } = decoded;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verifyUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ userName, password: logOutPassword })
      });

      if (response.status === 200) {
        setLogOutPassword('');
        setConfirmLogoutModal(false);
        logOut();
        return toast.custom((t: any) => (<Toast t={t} type="info" content={"Logged Out"} />));
      } else {
        return toast.custom((t: any) => <Toast content="Invalid Credentials!" type="error" t={t} />);
      }
    } catch {
      return toast.custom((t: any) => (<Toast t={t} type="error" content="Error Updating User Status" />));
    }
  }

  const fetchUserDetails = async () => {
    const cookies = parseCookies();
    const { userToken } = cookies;
    const decoded = jwt.decode(userToken);
    const { userName } = decoded as { userName: string };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      if (response.status === 200) {
        response.json().then((data) => {
          setUser(data);
          console.log({ user });
        });
      } else if (response.status === 401) {
        destroyCookie(null, 'userToken');
        router.push('/');
      } else {
        return toast.custom((t: any) => (<Toast t={t} type="error" content="Error Fetching User Details" />));
      }

    } catch {
      return toast.custom((t: any) => (<Toast t={t} type="error" content="Error Fetching User Details" />));
    }
  }

  useEffect(() => {
    const cookies = parseCookies();
    const { userToken } = cookies;
    const decoded = jwt.decode(userToken) as { userName: string, exp: number, role: string };
    console.log({ decoded });

    try {
      if (!userToken) {
        router.push("/");
      } else if (decoded.role === "Guest") {
        router.push("/guest");
      } else {
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          toast.custom((t: any) => (<Toast t={t} type="error" content="Token has expired" />));
          console.error("Token has expired");
          logOut();
        }
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      router.push("/");
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  if (user) {
    return (
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
            {headerTitle}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-2">
              {(user?.Role === "Admin" || user?.Role === "Super Admin") && (
                <>
                  <div className={
                    `${router.pathname === '/admin/calls' ? 'bg-highlight' : 'hover:bg-highlight'} rounded-md p-1 cursor-pointer`
                  }
                    onClick={() => router.push('/admin/calls')}
                  >
                    <Tooltip tooltip="Check Ins" position="bottom">
                      <Backpack className="w-5 h-5" />
                    </Tooltip>
                  </div>
                  <div className={
                    `${router.pathname === '/admin/locations' ? 'bg-highlight' : 'hover:bg-highlight'} rounded-md p-1 cursor-pointer`
                  }
                    onClick={() => router.push('/admin/locations')}
                  >
                    <Tooltip tooltip="Locations" position="bottom">
                      <MapPinPlus className="w-5 h-5" />
                    </Tooltip>
                  </div>
                  <div className={
                    `${router.pathname === '/admin/users' ? 'bg-highlight' : 'hover:bg-highlight'} rounded-md p-1 cursor-pointer`
                  }
                    onClick={() => router.push('/admin/users')}
                  >
                    <Tooltip tooltip="Users" position="bottom">
                      <Users className="w-5 h-5" />
                    </Tooltip>
                  </div>
                </>
              )
              }
              <div className={
                `${router.pathname === '/watchCenter' ? 'bg-highlight' : 'hover:bg-highlight'} rounded-md p-1 cursor-pointer`
              }
                onClick={() => router.push('/watchCenter')}
              >
                <Tooltip tooltip="Watch Center" position="bottom">
                  <Cctv className="w-5 h-5" />
                </Tooltip>
              </div>
              <div className={
                `${router.pathname === '/checkInHub' ? 'bg-highlight' : 'hover:bg-highlight'} rounded-md p-1 cursor-pointer`
              }
                onClick={() => router.push('/checkInHub')}
              >
                <Tooltip tooltip="Check-In Hub" position="bottom">
                  <KeyRound className="w-5 h-5" />
                </Tooltip>
              </div>
              {header}
            </div>
            <div className="border-l-2 border-l-border pl-2 flex items-center gap-2">
              {/* <div>
              <Dropdown
                id='person'
                title={
                  <div className='flex items-center gap-2'>
                    <Tooltip tooltip="Menu" position="bottom">
                      <Menu />
                    </Tooltip>
                  </div>
                }
                position="bottom-right"
                data={dropdownItems}
                hasImage
                style='bg-purple-800'
                selectedId='3'
                onSelect={handleSelect}
              />
            </div> */}
              <div className="flex items-center gap-2 border-r-2 border-r-border pr-2">
                <Tooltip className="transform -translate-x-9  " tooltip="User Name" position="bottom">
                  <div className="flex items-center gap-1">
                    <div className="w-7 h-7 flex items-center justify-center bg-gray-300 rounded-full">
                      <h1 className="text-textAlt font-bold">{
                        user?.DisplayName?.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase()
                      }</h1>
                    </div>
                    <div>
                      <h1 className="font-bold text-xs">{user?.DisplayName}</h1>
                    </div>
                  </div>
                </Tooltip>
                <Tooltip className="transform -translate-x-6" tooltip="Status" position="bottom">
                  <div className="w-[5.6rem] h-full flex items-center gap-1" onClick={toggleUserAway}>
                    <div className="flex items-center">
                      <Input type="checkBox" name="Status" value={userOnline.toString()} />
                    </div>
                    <h1 className="text-xs font-bold">
                      {userOnline ? 'Available' : 'Away'}
                    </h1>
                  </div>
                </Tooltip>
              </div>
              <div
                onClick={handleLogOutToggle}
              >
                <Tooltip className="transform -translate-x-12" tooltip="Log Out" position="bottom">
                  <LogOut className="w-5 h-5 text-red-500" />
                </Tooltip>
              </div>
            </div>
          </div>
          {
            confirmToggleModal && (
              <Modal onClose={handleCloseConfirmToggleModal} title={`Confirm Status Change To ${userOnline ? 'Away' : 'Available  '}`}>
                <div className="h-full flex flex-col gap-2 p-2">
                  <div>
                    <h1 className="font-bold">Password</h1>
                  </div>
                  <form className="flex flex-col gap-2" onSubmit={handleToggleUser}>
                    <div>
                      <Input ref={passwordRef} type="password" name="togglePassword" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="flex gap-2 items-center justify-center">
                      <Button text={
                        userOnline ? 'Away' : 'Available'
                      } color="foreground" type="submit" />
                      <Button text="Cancel" color="foreground" type="button" onClick={handleCloseConfirmToggleModal} />
                    </div>
                  </form>
                </div>
              </Modal>
            )
          }
          {
            confirmLogoutModal && (
              <Modal onClose={handleCloseConfirmLogoutModal} title="Confirm Log Out">
                <div className="flex flex-col gap-2 p-2">
                  <div>
                    <h1 className="font-bold">Password</h1>
                  </div>
                  <form className="flex flex-col gap-2" onSubmit={handleUserLogout}>
                    <div>
                      <Input ref={logOutPasswordRef} type="password" name="password" placeholder="Password" value={logOutPassword} onChange={(e) => setLogOutPassword(e.target.value)} />
                    </div>
                    <div className="flex gap-2 items-center justify-center">
                      <Button text="Submit" color="foreground" type="submit" />
                      <Button text="Cancel" color="foreground" type="button" onClick={handleCloseConfirmLogoutModal} />
                    </div>
                  </form>
                </div>
              </Modal>
            )
          }
        </div>
        <div className="p-2">
          {children}
        </div>
      </div >
    )
  }
}