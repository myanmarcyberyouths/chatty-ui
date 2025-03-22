import { Users } from "lucide-react";

export default function GroupItem({ group, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
    >
      <Users className="h-6 w-6 text-blue-600" />
      <div className="flex-1">
        <h3 className="font-semibold">{group.name}</h3>
        <p className="text-sm text-muted-foreground">{group.members.length} members</p>
      </div>
    </div>
  );
}
