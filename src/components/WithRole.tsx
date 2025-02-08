/* eslint-disable @typescript-eslint/no-explicit-any */
import { RoleDetail, User } from "@/utils/types";
import { useRouter } from "next/router";
import { destroyCookie, parseCookies } from "nookies";
import { ReactNode, useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import Toast from "./ui/Toast";
import toast from "react-hot-toast";

const userMenuRouteMapping: {
  menu: string;
  route: string;
}[] = [
    { menu: "check-in hub", route: "/checkInHub" },
    { menu: "check-in trails", route: "/admin/checkIns" },
    { menu: "locations", route: "/admin/locations" },
    { menu: "users", route: "/admin/users" },
    { menu: "watch hub", route: "/watchHub" },
    { menu: "guest location", route: "/guest" },
  ];

export default function WithRole({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [showPage, setShowPage] = useState<boolean>(false);
  const [roleDetails, setRoleDetails] = useState<RoleDetail[]>();
  const [user, setUser] = useState<User>();

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
        destroyCookie(null, "userToken");
        router.push("/");
      } else {
        return toast.custom((t: any) => (
          <Toast t={t} type="error" content="Error Fetching User Details" />
        ));
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
        destroyCookie(null, "userToken");
        router.push("/");
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

  useEffect(() => {
    fetchUserDetails();
    fetchRoleDetails();
  }, []);

  useEffect(() => {
    const currentPath = router.asPath.split("?")[0];
    const mapping = userMenuRouteMapping.find((item) =>
      currentPath.startsWith(item.route)
    );
    const menu = mapping?.menu;

    if (roleDetails && user) {
      const permission = roleDetails.find(
        (role) =>
          role.Role.toLowerCase() === user.Role.toLowerCase() &&
          role.Menu.toLowerCase() === menu &&
          role.Action.toLowerCase() === "view, edit"
      );

      if (!permission) {
        if (user.Role.toLowerCase() === "guest") {
          router.push("/guest");
        } else {
          router.push("/checkInHub");
        }
      } else {
        setShowPage(true);
      }
    }
  }, [user, roleDetails, router.asPath]);

  return <>{showPage && children}</>;
}
