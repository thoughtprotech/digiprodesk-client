import { destroyCookie, parseCookies } from "nookies";
import { NextRouter } from "next/router";

const logOut = (router: NextRouter) => {
  console.log("Logging out triggered");
  // Remove the cookie; specify the same options (like path) as when the cookie was set
  destroyCookie(null, "userToken", { path: "/" });

  // Optionally, check if the cookie is deleted and log an error if it's not.
  const cookies = parseCookies();
  if (!cookies.userToken) {
    router.push("/");
  } else {
    console.error("Failed to delete userToken cookie");
    router.push("/");
  }
};

export default logOut;
