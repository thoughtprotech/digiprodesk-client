/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import Image from "next/image";
import { useRouter } from "next/router";
import { setCookie } from "nookies";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  });

  const router = useRouter();

  const handleLogIn = () => {
    if (formData.userName === "") {
      return toast.custom((t: any) => <Toast content="Username is required." type="warning" t={t} />);
    }
    if (formData.password === "") {
      return toast.custom((t: any) => <Toast content="Password is required." type="warning" t={t} />);
    }

    const { userName, password } = formData;

    if (userName === "olive_indiranagar" && password === "olive@123") {
      setCookie(
        null, "userToken", "olive_indiranagar", {
        maxAge: 30 * 24 * 60 * 60,
        path: "/"
      })

      toast.custom((t: any) => <Toast content="Logged In Successfully!" type="success" t={t} />);
      return router.push("/guest");
    }

    if (userName === "olive_koramangala" && password === "olive@123") {
      setCookie(
        null, "userToken", "olive_koramangala", {
        maxAge: 30 * 24 * 60 * 60,
        path: "/"
      })
      toast.custom((t: any) => <Toast content="Logged In Successfully!" type="success" t={t} />);
      return router.push("/guest");
    }

    if (userName === "olive_hsr" && password === "olive@123") {
      setCookie(
        null, "userToken", "olive_hsr", {
        maxAge: 30 * 24 * 60 * 60,
      })
      toast.custom((t: any) => <Toast content="Logged In Successfully!" type="success" t={t} />);
      return router.push("/guest");
    }

    if (userName === "olive_marathahalli" && password === "olive@123") {
      setCookie(
        null, "userToken", "olive_marathahalli", {
        maxAge: 30 * 24 * 60 * 60,
      })
      toast.custom((t: any) => <Toast content="Logged In Successfully!" type="success" t={t} />);
      return router.push("/guest");
    }

    if (userName === "olive_whitefield" && password === "olive@123") {
      setCookie(
        null, "userToken", "olive_whitefield", {
        maxAge: 30 * 24 * 60 * 60,
      })
      toast.custom((t: any) => <Toast content="Logged In Successfully!" type="success" t={t} />);
      return router.push("/guest");
    }

    if (userName === "host" && password === "host") {
      setCookie(
        null, "userToken", "host", {
        maxAge: 30 * 24 * 60 * 60,
      })
      toast.custom((t: any) => <Toast content="Logged In Successfully!" type="success" t={t} />);
      return router.push("/checkInHub");
    }

    return toast.custom((t: any) => <Toast content="Invalid Credentials!" type="error" t={t} />);
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/2 h-full">
        <Image
          src={`/images/loginBackground.png`}
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
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                  Log In {" "}
                </span>
                To Your Account.</h1>
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