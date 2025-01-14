import { Backpack, Cctv, Headset, LogOut, MapPinPlus, Users } from "lucide-react";
import { ReactNode } from "react";
// import { ThemeContext } from "@/context/ThemeContext";
import Tooltip from "./ui/ToolTip";
import { useRouter } from "next/router";
import { destroyCookie } from "nookies";
import Image from "next/image";



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

  const handleUserLogout = () => {
    destroyCookie(null, 'userToken');
    router.push('/');
  }

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
            <div className={
              `${router.pathname === '/checkInHub' ? 'bg-highlight' : 'hover:bg-highlight'} rounded-md p-1 cursor-pointer`
            }
              onClick={() => router.push('/checkInHub')}
            >
              <Tooltip tooltip="Check-In Hub" position="bottom">
                <Headset className="w-5 h-5" />
              </Tooltip>
            </div>
            <div className={
              `${router.pathname === '/watchCenter' ? 'bg-highlight' : 'hover:bg-highlight'} rounded-md p-1 cursor-pointer`
            }
              onClick={() => router.push('/watchCenter')}
            >
              <Tooltip tooltip="Watch Center" position="bottom">
                <Cctv className="w-5 h-5" />
              </Tooltip>
            </div>
          </div>
          <div className="border-l-2 border-l-border pl-2 flex items-center gap-2">
            {header}
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