import { Role, User } from "@/utils/types";

const roles: Role[] = [
  {
    ID: 1,
    Name: 'Admin',
    SuperAdmin: true,
    Language: 'en',
    IsActive: true,
    CreatedBy: 1,
    CreatedOn: new Date(),
    ModifiedBy: 1,
    ModifiedOn: new Date()
  },
  {
    ID: 2,
    Name: 'Host',
    SuperAdmin: false,
    Language: 'en',
    IsActive: true,
    CreatedBy: 1,
    CreatedOn: new Date(),
    ModifiedBy: 1,
    ModifiedOn: new Date()
  },
  {
    ID: 3,
    Name: 'Guest',
    SuperAdmin: false,
    Language: 'en',
    IsActive: true,
    CreatedBy: 1,
    CreatedOn: new Date(),
    ModifiedBy: 1,
    ModifiedOn: new Date()
  }
]

export default function UserCard({ user }: {
  user: User;
}) {
  return (
    <div className="max-w-sm mx-auto p-2 bg-foreground hover:bg-background shadow-lg rounded-lg border border-border hover:shadow-xl transition-shadow duration-300 flex justify-between items-start">
      <div className="flex items-center gap-4 pb-2">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-textAlt text-2xl font-bold">
          {user?.DisplayName?.split(' ')?.map(name => name[0])?.join('')}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text">{user?.DisplayName}</h2>
          <p className="text-sm text-textAlt font-semibold">{roles?.find(role => role?.ID === user?.RoleID)?.Name}</p>
          <p className="text-sm text-textAlt font-semibold">{user?.UserName}</p>
          <div className="mt-2 flex items-center gap-2">
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
  )
}