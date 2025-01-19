/* eslint-disable @next/next/no-img-element */
import { User } from "@/utils/types";


export default function UserCard({ user }: {
  user: User;
}) {
  return (
    <div className="h-full max-w-sm mx-auto p-2 bg-foreground hover:bg-highlight duration-300 rounded-md border border-border flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-textAlt text-2xl font-bold">
          {
            user?.UserPhoto === "" && (
              user?.DisplayName?.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase()
            )
          }
          {user?.UserPhoto !== "" &&
            (
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${user?.UserPhoto}`}
                alt={user?.DisplayName?.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase()}
                className="w-full h-full object-cover rounded-full flex items-center justify-center"
              />
            )
          }
        </div>
        <div className="flex flex-col gap-1 border-l-2 border-l-border pl-2">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-text">{user?.DisplayName}</h1>
            <h1 className="text-sm text-textAlt font-semibold">{user?.UserName}</h1>
          </div>
          <div className="w-full flex items-center gap-2">
            <div>
              <span
                className="px-3 py-1 text-xs font-semibold rounded-full bg-background text-textAlt"
              >
                {user?.Role}
              </span>
            </div>
            <div>
              {
                user?.IsActive ? (
                  <span
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/30 text-green-500"
                  >
                    Active
                  </span>
                ) : (
                  <span
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/30 text-red-500"
                  >
                    Inactive
                  </span>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}