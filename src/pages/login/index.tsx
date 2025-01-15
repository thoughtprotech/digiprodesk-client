/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import Image from "next/image";
import { useRouter } from "next/router";
import { parseCookies, setCookie } from "nookies";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import jwt from "jsonwebtoken";

export default function Login() {
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  });

  const router = useRouter();

  const handleLogIn = async () => {
    if (formData.userName === "") {
      return toast.custom((t: any) => <Toast content="Username is required." type="warning" t={t} />);
    }
    if (formData.password === "") {
      return toast.custom((t: any) => <Toast content="Password is required." type="warning" t={t} />);
    }

    const { userName, password } = formData;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/authentication`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userName, password })
    });

    if (response.status === 200) {
      console.log({ response });
      response.json().then((data) => {
        console.log({ data });
        setCookie(
          null, "userToken", data.token, {
          maxAge: 30 * 24 * 60 * 60,
        })

        const decoded = jwt.decode(data.token);
        console.log({ decoded });
        const { role } = decoded as { role: string };
        if (role === "Guest") {
          router.push('/guest');
        } else {
          router.push('/checkInHub');
        }
        // router.push('/checkInHub');
        return toast.custom((t: any) => <Toast content="Logged In Successfully" type="success" t={t} />);
      })
    } else {
      return toast.custom((t: any) => <Toast content="Invalid Credentials!" type="error" t={t} />);
    }
  }

  useEffect(() => {
    const cookies = parseCookies();
    const { userToken } = cookies;

    try {
      if (userToken) {
        const decoded = jwt.decode(userToken) as { userName: string, exp: number, role: string };

        const currentTime = Math.floor(Date.now() / 1000);  // Current time in seconds

        if (decoded.exp > currentTime) {
          if (decoded.role === "Guest") {
            router.push('/guest');
          } else {
            router.push('/checkInHub');
          }
        }
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      router.push("/");  // Redirect to login on error
    }
  }, []);

  return (
    <div className="flex h-screen">
      <div className="w-1/2 h-full">
        <Image
          src={`/images/loginBackground.jpg`}
          alt="Login"
          width={1000}
          height={1000}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-1/2 h-full flex flex-col">
        <div className="w-full h-fit flex items-center justify-end relative z-50 bg-background p-2 border-b-2 border-b-border pb-3">
          <div className="flex flex-col justify-end items-end">
            <h1 className="font-extrabold text-5xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              ORION.
            </h1>
            <h1 className="font-bold text-sm text-textAlt">Your Virtual Frontline, Anywhere.</h1>
          </div>
        </div>
        <div className="w-full h-full flex justify-center items-center">
          <div className="w-80 h-fit p-4 flex flex-col items-center space-y-4 transform -translate-y-14">
            <div className="w-full flex flex-col border-b-2 border-b-border pb-2">
              <h1 className="font-bold text-lg text-textAlt">WELCOME BACK!</h1>
              <h1 className="font-bold text-4xl">
                Let&apos;s Get You {" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                  Signed In
                </span>
              </h1>
            </div>
            <div className="w-full">
              <input
                type="text"
                placeholder="Username"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full p-2 rounded-md border-2 border-border bg-foreground outline-none text-text font-semibold"
              />
            </div>
            <div className="w-full">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2 rounded-md border-2 border-border bg-foreground outline-none text-text font-semibold"
              />
            </div>
            <div className="w-full">
              <Button
                color="indigo"
                onClick={handleLogIn}
                text="Log In To Virtual Assistance"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}