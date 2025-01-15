/* eslint-disable @typescript-eslint/no-explicit-any */
import { Backpack, Cctv, Headset, LogOut, MapPinPlus, Users } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import Tooltip from "./ui/ToolTip";
import { useRouter } from "next/router";
import { destroyCookie, parseCookies } from "nookies";
import Image from "next/image";
import Input from "./ui/Input";
import toast from "react-hot-toast";
import Toast from "./ui/Toast";
import jwt from "jsonwebtoken";
import { User } from "@/utils/types";



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

  const toggleUserAway = () => {
    setUserOnline(!userOnline);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return toast.custom((t: any) => (<Toast t={t} type="info" content={
      userOnline ? 'You Are Now Away' : 'You Are Now Online'
    } />));
  }

  const handleUserLogout = () => {
    destroyCookie(null, 'userToken');
    router.push('/');
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

    try {
      if (!userToken) {
        router.push("/");  // Redirect if token doesn't exist
      } else {
        const decoded = jwt.decode(userToken) as { userName: string, exp: number };
        console.log({ decoded });

        const currentTime = Math.floor(Date.now() / 1000);  // Current time in seconds
        if (decoded.exp < currentTime) {
          toast.custom((t: any) => (<Toast t={t} type="error" content="Token has expired" />));
          console.error("Token has expired");
          handleUserLogout();  // Log out if token has expired
        }
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      router.push("/");  // Redirect to login on error
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
  }, []);

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
        <div className="flex items-center space-x-2 pr-4">
          <div className="flex items-center gap-2">
            {user?.RoleID === 1 && (
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
                <Headset className="w-5 h-5" />
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
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 flex items-center justify-center bg-gray-300 rounded-full">
                <h1 className="text-textAlt font-bold">{
                  user?.DisplayName.slice(0, 1)
                }</h1>
              </div>
              <div>
                <h1 className="text-sm font-bold">{user?.DisplayName}</h1>
              </div>
            </div>
            <div className="h-full flex items-center gap-1">
              <div className="flex items-center">
                <Input type="checkBox" name="Status" onChange={toggleUserAway} value={userOnline.toString()} />
              </div>
              <h1 className="text-sm font-bold">
                {userOnline ? 'Online' : 'Away'}
              </h1>
            </div>
            <div
              onClick={handleUserLogout}
            >
              <Tooltip tooltip="Log Out" position="bottom">
                <LogOut className="w-5 h-5 text-red-500" />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
      <div className="p-2">
        {children}
      </div>
    </div>
  )
}